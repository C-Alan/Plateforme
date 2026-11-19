import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Users, DollarSign, Award, Star, TrendingUp, 
  Filter, Sparkles, Film, Radio, ShieldCheck, ChevronRight, X, 
  Crown, Medal, ArrowRight, UserCheck, ExternalLink, Heart
} from 'lucide-react';
import { apiGetArtistsRanking } from '../../api';

/**
 * Composant de Classement Officiel des Artistes CDAR
 * Utilisable dans :
 * - Espace Fan (context="fan") : découverte, abonnement, profil
 * - Espace Artiste (context="artist") : benchmark entre pairs, statut personnel mis en avant
 * - Espace Admin (context="admin") : supervision, modération et suivi financier
 */
export default function ArtistLeaderboard({ 
  context = 'fan', 
  currentUserId = null,
  currentUser = null,
  onViewArtistProfile = null,
  onSubscribeArtist = null 
}) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity'); // popularity | subscribers | revenue | posts
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState(null);

  const loadRankings = async () => {
    setLoading(true);
    try {
      const res = await apiGetArtistsRanking({
        sort_by: sortBy,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        country: countryFilter !== 'all' ? countryFilter : undefined
      });
      setRankings(res.rankings || []);
    } catch (err) {
      console.error("Erreur chargement ranking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [sortBy, categoryFilter, countryFilter]);

  // Podium top 3
  const top3 = rankings.slice(0, 3);
  const others = rankings.slice(3);

  // Position de l'artiste connecté (si en mode artiste)
  const myRankInfo = context === 'artist' && currentUserId 
    ? rankings.find(a => a.artist_id === currentUserId) 
    : null;

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black flex items-center justify-center shadow-lg shadow-amber-500/30 text-sm">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-300 to-gray-400 text-black font-black flex items-center justify-center shadow-lg shadow-gray-400/30 text-sm">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black flex items-center justify-center shadow-lg shadow-amber-800/30 text-sm">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 font-extrabold flex items-center justify-center text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Bandeau spécifique au contexte */}
      {context === 'artist' && myRankInfo && (
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-[#2A170A] via-[#1C1318] to-[#12121E] border-2 border-[#FF7A00]/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#FF7A00]/20 via-pink-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-yellow-400 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                #{myRankInfo.rank}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Votre Position Actuelle : Rang #{myRankInfo.rank}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-yellow-300 border border-amber-500/30">
                    {myRankInfo.badge}
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Score de popularité : <strong className="text-white">{myRankInfo.popularity_score.toLocaleString('fr-FR')} pts</strong> • <strong className="text-white">{myRankInfo.active_subscribers_count} abonnés VIP</strong>
                </p>
              </div>
            </div>

            <div className="text-right self-start sm:self-center">
              <span className="text-[11px] text-gray-400 block">Sur {rankings.length} créateurs classés</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> En progression constante
              </span>
            </div>
          </div>
        </div>
      )}

      {context === 'fan' && (
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-[#1E122A] via-[#161224] to-[#11111B] border border-purple-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 text-black flex items-center justify-center shadow-xl shadow-yellow-500/25 flex-shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    Classement Officiel des Artistes CDAR
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                    TOP CRÉATEURS D'AFRIQUE
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Découvrez les créateurs les plus influents, explorez leurs univers exclusifs et rejoignez leur cercle VIP.
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-400 self-start sm:self-center font-bold">
              Mis à jour en temps réel selon l'engagement
            </div>
          </div>
        </div>
      )}

      {/* 2. Barre d'outils, Tri & Filtres */}
      <div className="bg-white/80 dark:bg-[#151522] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Tableau d'Honneur & Notoriété</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Classement calculé selon la popularité, l'adhésion des abonnés VIP et le dynamisme des publications.
            </p>
          </div>

          {/* Tri Principal */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0E0E16] p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: 'popularity', label: '⭐ Popularité', icon: Flame },
              { id: 'subscribers', label: '👥 Abonnés VIP', icon: Users },
              ...(context === 'admin' ? [{ id: 'revenue', label: '💰 Revenus (F CFA)', icon: DollarSign }] : []),
              { id: 'posts', label: '🎬 Publications', icon: Film },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSortBy(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5 ${
                  sortBy === tab.id
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black shadow-md'
                    : 'text-slate-600 dark:text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtres secondaires : Catégorie & Pays */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400">Catégorie :</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 font-bold"
            >
              <option value="all">Toutes les Catégories</option>
              <option value="Rap Ivoire">Rap Ivoire</option>
              <option value="Afro-Soul">Afro-Soul & Variété</option>
              <option value="Danse">Danse & Chorégraphie</option>
              <option value="Masterclass">Masterclass & Production</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400">Pays :</span>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-slate-100 dark:bg-[#0E0E16] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 font-bold"
            >
              <option value="all">Tous les Pays</option>
              <option value="CI">🇨🇮 Côte d'Ivoire</option>
              <option value="SN">🇸🇳 Sénégal</option>
              <option value="CM">🇨🇲 Cameroun</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto font-bold">
            {rankings.length} créateur{rankings.length > 1 ? 's' : ''} classé{rankings.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* 3. PODIUM DES TOP 3 CRÉATEURS */}
      {!loading && top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Argent (À gauche sur écran large) */}
          <div className={`order-2 md:order-1 bg-white/80 dark:bg-[#161626] border rounded-3xl p-5 shadow-xl flex flex-col justify-between text-center relative overflow-hidden group transition-all ${
            top3[1].artist_id === currentUserId
              ? 'border-2 border-orange-500 shadow-glow-orange ring-2 ring-orange-500/30'
              : 'border-slate-300 dark:border-white/15 hover:border-slate-400'
          }`}>
            <div className="absolute top-3 left-3">
              <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md">
                #2
              </span>
            </div>
            {top3[1].artist_id === currentUserId && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px] shadow-sm">
                  C'est vous !
                </span>
              </div>
            )}
            <div className="space-y-3 pt-3">
              <div className="relative inline-block mx-auto cursor-pointer" onClick={() => onViewArtistProfile && onViewArtistProfile(top3[1])}>
                <img
                  src={top3[1].avatar_url}
                  alt={top3[1].stage_name}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-300 shadow-lg mx-auto hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-2 -right-2 text-xl">🥈</span>
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white hover:text-amber-500 transition-colors cursor-pointer" onClick={() => onViewArtistProfile && onViewArtistProfile(top3[1])}>
                  {top3[1].stage_name}
                </h4>
                <p className="text-xs text-gray-500">{top3[1].category} ({top3[1].country})</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                  {top3[1].badge}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-[#10101C] p-2 rounded-xl">
                <span className="text-[10px] text-gray-400">Score Pop.</span>
                <p className="font-black text-slate-900 dark:text-white">{top3[1].popularity_score.toLocaleString('fr-FR')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#10101C] p-2 rounded-xl">
                <span className="text-[10px] text-gray-400">Abonnés VIP</span>
                <p className="font-black text-sky-400">{top3[1].active_subscribers_count}</p>
              </div>
            </div>

            {/* Actions rapides contextuelles */}
            {context === 'fan' && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onViewArtistProfile && onViewArtistProfile(top3[1])}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold transition-all"
                >
                  Voir profil
                </button>
                <button
                  onClick={() => onSubscribeArtist && onSubscribeArtist(top3[1])}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black transition-all shadow-sm"
                >
                  S'abonner
                </button>
              </div>
            )}
          </div>

          {/* #1 Or (Au centre, surélevé) */}
          <div className={`order-1 md:order-2 bg-gradient-to-b from-[#2A1D0E] via-[#1A1418] to-[#12121E] border-2 rounded-3xl p-6 shadow-2xl shadow-amber-500/15 flex flex-col justify-between text-center relative overflow-hidden transform md:-translate-y-2 ${
            top3[0].artist_id === currentUserId
              ? 'border-yellow-400 shadow-glow-orange ring-2 ring-yellow-400/50'
              : 'border-amber-500/60'
          }`}>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300"></div>
            <div className="absolute top-3 left-3">
              <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-black font-black text-sm flex items-center justify-center shadow-lg">
                #1
              </span>
            </div>
            {top3[0].artist_id === currentUserId && (
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black font-black text-[10px] shadow-sm">
                  C'est vous ! 👑
                </span>
              </div>
            )}
            <div className="space-y-3 pt-2">
              <div className="relative inline-block mx-auto cursor-pointer" onClick={() => onViewArtistProfile && onViewArtistProfile(top3[0])}>
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
                <img
                  src={top3[0].avatar_url}
                  alt={top3[0].stage_name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-yellow-400 shadow-2xl mx-auto hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-2 -right-2 text-2xl">🥇</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-white hover:text-yellow-400 transition-colors cursor-pointer" onClick={() => onViewArtistProfile && onViewArtistProfile(top3[0])}>
                  {top3[0].stage_name}
                </h4>
                <p className="text-xs text-amber-200/80">{top3[0].category} ({top3[0].country})</p>
                <span className="inline-block mt-1 text-[11px] font-black px-3 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 border border-amber-500/40">
                  {top3[0].badge}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#12121A] p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-[10px] text-amber-300">Score Popularité</span>
                <p className="font-black text-yellow-400 text-base">{top3[0].popularity_score.toLocaleString('fr-FR')}</p>
              </div>
              <div className="bg-[#12121A] p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-[10px] text-amber-300">Abonnés VIP</span>
                <p className="font-black text-white text-base">{top3[0].active_subscribers_count}</p>
              </div>
            </div>

            {/* Actions rapides contextuelles */}
            {context === 'fan' && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onViewArtistProfile && onViewArtistProfile(top3[0])}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  Voir profil
                </button>
                <button
                  onClick={() => onSubscribeArtist && onSubscribeArtist(top3[0])}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black transition-all shadow-lg shadow-yellow-500/20"
                >
                  S'abonner VIP
                </button>
              </div>
            )}
          </div>

          {/* #3 Bronze (À droite sur écran large) */}
          <div className={`order-3 bg-white/80 dark:bg-[#161626] border rounded-3xl p-5 shadow-xl flex flex-col justify-between text-center relative overflow-hidden group transition-all ${
            top3[2].artist_id === currentUserId
              ? 'border-2 border-orange-500 shadow-glow-orange ring-2 ring-orange-500/30'
              : 'border-amber-800/40 hover:border-amber-700'
          }`}>
            <div className="absolute top-3 left-3">
              <span className="w-8 h-8 rounded-full bg-amber-800 text-white font-black text-xs flex items-center justify-center shadow-md">
                #3
              </span>
            </div>
            {top3[2].artist_id === currentUserId && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px] shadow-sm">
                  C'est vous !
                </span>
              </div>
            )}
            <div className="space-y-3 pt-3">
              <div className="relative inline-block mx-auto cursor-pointer" onClick={() => onViewArtistProfile && onViewArtistProfile(top3[2])}>
                <img
                  src={top3[2].avatar_url}
                  alt={top3[2].stage_name}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-700 shadow-lg mx-auto hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-2 -right-2 text-xl">🥉</span>
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white hover:text-amber-500 transition-colors cursor-pointer" onClick={() => onViewArtistProfile && onViewArtistProfile(top3[2])}>
                  {top3[2].stage_name}
                </h4>
                <p className="text-xs text-gray-500">{top3[2].category} ({top3[2].country})</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                  {top3[2].badge}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-[#10101C] p-2 rounded-xl">
                <span className="text-[10px] text-gray-400">Score Pop.</span>
                <p className="font-black text-slate-900 dark:text-white">{top3[2].popularity_score.toLocaleString('fr-FR')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#10101C] p-2 rounded-xl">
                <span className="text-[10px] text-gray-400">Abonnés VIP</span>
                <p className="font-black text-sky-400">{top3[2].active_subscribers_count}</p>
              </div>
            </div>

            {/* Actions rapides contextuelles */}
            {context === 'fan' && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onViewArtistProfile && onViewArtistProfile(top3[2])}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold transition-all"
                >
                  Voir profil
                </button>
                <button
                  onClick={() => onSubscribeArtist && onSubscribeArtist(top3[2])}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black transition-all shadow-sm"
                >
                  S'abonner
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TABLEAU COMPLET DU CLASSEMENT */}
      <div className="bg-white dark:bg-[#141422] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-gray-500">
            Calcul des métriques de popularité et classement...
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Aucun artiste ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#10101A] text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-4 px-4 text-center">Rang</th>
                  <th className="py-4 px-4">Artiste & Notoriété</th>
                  <th className="py-4 px-4 text-center">Score Popularité</th>
                  <th className="py-4 px-4 text-center">Abonnés VIP</th>
                  <th className="py-4 px-4 text-center">Contenus</th>
                  {context === 'admin' && (
                    <th className="py-4 px-4 text-right">Volume Brut</th>
                  )}
                  <th className="py-4 px-4 text-center">Engagement</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {rankings.map((artist) => {
                  const isMe = artist.artist_id === currentUserId;

                  return (
                    <tr 
                      key={artist.artist_id} 
                      className={`transition-colors ${
                        isMe 
                          ? 'bg-orange-500/10 hover:bg-orange-500/15 font-bold' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Rang */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center">
                          {getRankBadge(artist.rank)}
                        </div>
                      </td>

                      {/* Artiste & Badge */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={artist.avatar_url}
                            alt={artist.stage_name}
                            className={`w-10 h-10 rounded-2xl object-cover border ${
                              isMe ? 'border-orange-500 shadow-md ring-2 ring-orange-500/40' : 'border-slate-200 dark:border-white/10'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 dark:text-white">
                                {artist.stage_name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">({artist.country})</span>
                              {isMe && (
                                <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black">
                                  VOUS
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-500">{artist.category}</span>
                              <span>•</span>
                              <span className="text-[10px] font-bold text-amber-500">{artist.badge}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score Pop */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-yellow-500/15 text-yellow-500 dark:text-yellow-300 border border-yellow-500/30 font-black text-xs shadow-sm">
                          <Flame className="w-3.5 h-3.5 text-yellow-500" />
                          <span>{artist.popularity_score.toLocaleString('fr-FR')}</span>
                        </span>
                      </td>

                      {/* Abonnés VIP */}
                      <td className="py-4 px-4 text-center font-black text-sky-400">
                        {artist.active_subscribers_count}
                      </td>

                      {/* Contenus (Posts + Lives) */}
                      <td className="py-4 px-4 text-center text-slate-700 dark:text-gray-300">
                        <span>{artist.posts_count} posts</span>
                        {artist.lives_count > 0 && (
                          <span className="text-[10px] text-rose-400 ml-1">({artist.lives_count} lives)</span>
                        )}
                      </td>

                      {/* Volume Brut (Admin uniquement) */}
                      {context === 'admin' && (
                        <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">
                          {artist.gross_revenue_cfa.toLocaleString('fr-FR')} F
                        </td>
                      )}

                      {/* Taux engagement */}
                      <td className="py-4 px-4 text-center font-bold text-emerald-400">
                        {artist.engagement_rate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        {context === 'fan' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onViewArtistProfile && onViewArtistProfile(artist)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                            >
                              <span>Profil</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onSubscribeArtist && onSubscribeArtist(artist)}
                              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-[11px] font-black transition-all shadow-sm flex items-center gap-1"
                            >
                              <span>Suivre</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedArtist(artist)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-colors"
                            title="Consulter les détails"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODALE DÉTAIL D'UN ARTISTE DU CLASSEMENT */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#161624] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedArtist.avatar_url}
                  alt={selectedArtist.stage_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10"
                />
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedArtist.stage_name}</span>
                    <span className="text-xs text-gray-400 font-normal">({selectedArtist.country})</span>
                  </h4>
                  <p className="text-xs text-amber-400 font-bold">{selectedArtist.badge}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArtist(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedArtist.bio && (
              <p className="text-xs text-slate-600 dark:text-gray-300 italic bg-slate-50 dark:bg-[#101018] p-3 rounded-2xl border border-slate-200 dark:border-white/5">
                "{selectedArtist.bio}"
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-[#12121E] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Rang Officiel</span>
                <p className="text-lg font-black text-yellow-500 mt-1">#{selectedArtist.rank}</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#12121E] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Popularité</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedArtist.popularity_score.toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#12121E] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Abonnés VIP</span>
                <p className="text-lg font-black text-sky-400 mt-1">{selectedArtist.active_subscribers_count}</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#12121E] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Publications</span>
                <p className="text-lg font-black text-purple-400 mt-1">{selectedArtist.posts_count}</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#12121E] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Lives Diffusés</span>
                <p className="text-lg font-black text-rose-500 mt-1">{selectedArtist.lives_count}</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#12121E] p-3 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Portée Estimée</span>
                <p className="text-lg font-black text-emerald-400 mt-1">{selectedArtist.estimated_reach} fans</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedArtist(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold"
              >
                Fermer
              </button>
              {context === 'fan' && onViewArtistProfile && (
                <button
                  type="button"
                  onClick={() => {
                    const a = selectedArtist;
                    setSelectedArtist(null);
                    onViewArtistProfile(a);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black"
                >
                  Découvrir son profil complet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
