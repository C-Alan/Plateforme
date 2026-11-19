from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Pour SQLite en dev/test, check_same_thread=False est requis
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_schema_updates(bind_engine):
    """Met à jour le schéma pour supporter les colonnes de sensibilité et modération si absentes"""
    try:
        inspector = inspect(bind_engine)
        tables = inspector.get_table_names()
        
        if "posts" in tables:
            columns = [c["name"] for c in inspector.get_columns("posts")]
            with bind_engine.connect() as conn:
                if "sensitivity_status" not in columns:
                    conn.execute(text("ALTER TABLE posts ADD COLUMN sensitivity_status VARCHAR(30) DEFAULT 'safe'"))
                if "sensitivity_reason" not in columns:
                    conn.execute(text("ALTER TABLE posts ADD COLUMN sensitivity_reason VARCHAR(200)"))
                if "reported_count" not in columns:
                    conn.execute(text("ALTER TABLE posts ADD COLUMN reported_count INTEGER DEFAULT 0"))
                if "moderation_note" not in columns:
                    conn.execute(text("ALTER TABLE posts ADD COLUMN moderation_note TEXT"))
                if "is_blocked" not in columns:
                    conn.execute(text("ALTER TABLE posts ADD COLUMN is_blocked BOOLEAN DEFAULT 0"))
                conn.commit()

        if "live_streams" in tables:
            columns = [c["name"] for c in inspector.get_columns("live_streams")]
            with bind_engine.connect() as conn:
                if "sensitivity_status" not in columns:
                    conn.execute(text("ALTER TABLE live_streams ADD COLUMN sensitivity_status VARCHAR(30) DEFAULT 'safe'"))
                if "is_interrupted" not in columns:
                    conn.execute(text("ALTER TABLE live_streams ADD COLUMN is_interrupted BOOLEAN DEFAULT 0"))
                if "moderation_warning" not in columns:
                    conn.execute(text("ALTER TABLE live_streams ADD COLUMN moderation_warning VARCHAR(255)"))
                conn.commit()
    except Exception as e:
        print(f"[SCHEMA] Migration warning: {e}")


def get_db():
    ensure_schema_updates(engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auto-migration immédiate à l'import
try:
    ensure_schema_updates(engine)
except Exception:
    pass

