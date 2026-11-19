import pytest
from app.database import Base, engine, SessionLocal, ensure_schema_updates
from app.models.user import User, UserRole, KYCStatus
from app.api.admin import (
    get_admin_posts, moderate_post, get_admin_lives, intervene_live,
    get_artists_revenues, get_artists_ranking, PostModerationRequest, LiveInterventionRequest
)
from app.seed import seed_database_if_empty, seed_admin_demo_ecosystem


def test_admin_console_endpoints():
    Base.metadata.create_all(bind=engine)
    ensure_schema_updates(engine)
    db = SessionLocal()

    try:
        # 1. Vérifier que les données sont amorcées
        seed_database_if_empty(db)
        seed_admin_demo_ecosystem(db)

        admin_user = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
        assert admin_user is not None

        # 2. Test Gestion & Vérification de Contenu (Sensibilité)
        posts = get_admin_posts(status_filter="all", search=None, artist_id=None, current_admin=admin_user, db=db)
        assert len(posts) > 0
        first_post = posts[0]
        assert "sensitivity_status" in first_post
        assert "is_blocked" in first_post

        # Test Modération d'un post
        mod_req = PostModerationRequest(
            sensitivity_status="sensitive",
            sensitivity_reason="Contenu explicite (+18 ans)",
            is_blocked=False,
            moderation_note="Validé par l'équipe avec avertissement de sensibilité"
        )
        mod_res = moderate_post(first_post["id"], mod_req, current_admin=admin_user, db=db)
        assert mod_res["success"] is True
        assert mod_res["sensitivity_status"] == "sensitive"

        # 3. Test Suivi des Lives (Sensibilité & Surveillance)
        lives = get_admin_lives(current_admin=admin_user, db=db)
        assert len(lives) > 0
        first_live = lives[0]
        assert "sensitivity_status" in first_live
        assert "current_viewers" in first_live

        # Test intervention modération sur live
        intervene_req = LiveInterventionRequest(
            action="set_sensitive",
            warning_message="Direct réservé à une audience adulte (+18)"
        )
        intervene_res = intervene_live(first_live["id"], intervene_req, current_admin=admin_user, db=db)
        assert intervene_res["success"] is True
        assert intervene_res["sensitivity_status"] == "sensitive"

        # 4. Test Suivi des Revenus par Artiste (Part 80% / Com 20%)
        rev_data = get_artists_revenues(current_admin=admin_user, db=db)
        assert "summary" in rev_data
        assert "artists" in rev_data
        assert len(rev_data["artists"]) > 0
        sample_artist_rev = rev_data["artists"][0]
        assert "gross_revenue_cfa" in sample_artist_rev
        assert "net_artist_cfa" in sample_artist_rev
        assert "commission_cdar_cfa" in sample_artist_rev
        assert "available_balance_cfa" in sample_artist_rev
        assert "payout_operator" in sample_artist_rev

        # 5. Test Classement des Artistes (Popularité / Fans / Catégories)
        ranking_pop = get_artists_ranking(sort_by="popularity", category=None, country=None, kyc_status=None, current_admin=admin_user, db=db)
        assert ranking_pop["total_ranked"] > 0
        assert ranking_pop["rankings"][0]["rank"] == 1
        assert "popularity_score" in ranking_pop["rankings"][0]
        assert "active_subscribers_count" in ranking_pop["rankings"][0]
        assert "badge" in ranking_pop["rankings"][0]

        # Test tri par abonnés
        ranking_subs = get_artists_ranking(sort_by="subscribers", category=None, country=None, kyc_status=None, current_admin=admin_user, db=db)
        assert ranking_subs["sort_by"] == "subscribers"

        # Test filtrage par pays
        ranking_ci = get_artists_ranking(sort_by="popularity", category=None, country="CI", kyc_status=None, current_admin=admin_user, db=db)
        assert all(a["country"] == "CI" for a in ranking_ci["rankings"])

    finally:
        db.close()
