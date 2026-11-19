import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, ShieldCheck, ArrowDownRight, Sparkles, 
  CheckCircle2, AlertCircle, Trophy, ChevronRight, Heart, Users, 
  Flame, Activity, Award, Star, Zap, BarChart3
} from 'lucide-react';
import { apiGetArtistAnalytics } from '../../api';

export default function DashboardOverview({ wallet, currentUser, onOpenPayout, onGoToRanking, onGoToAnalytics }) {
  const [analytics, setAnalytics] = useState({
    engagement: {
      rate: 87.4,
      status: 'Très Élevé',
      active_vip_fans: 3,
      retention_rate: 92.4,
      average_reactions_per_post: 185,
      vip_messages_response_rate: 96.0
    },
    evolution: {
      growth_rate: 28.5,
      period: 'ce mois-ci',
      popularity_score: 3450,
      popularity_gain: 420,
      platform_rank: 1,
      total_ranked_artists: 4,
      content_regularity: 94.0,
      badge: '👑 Top Star'
    }
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiGetArtistAnalytics()
      .then((data) => {
        if (isMounted && data) {
          setAnalytics(data);
        }
      })
      .catch((err) => {
        console.warn("Analytics backend non disponibles, utilisation des données d'amorce:", err);
      });
    return () => { isMounted = false; };
  }, []);

  // Données de portefeuille financier (Unique source financière)
  const available = wallet?.available_balance_cfa || 0;
  const totalEarned = wallet?.total_earned_cfa || 0;
  const totalWithdrawn = wallet?.total_withdrawn_cfa || 0;
  const minThreshold = 5000;
  const canWithdraw = available >= minThreshold;
  const progressPercent = Math.min(100, Math.round((available / minThreshold) * 100));

  return (
    <div className="space-y-4">
      {/* Grille des 3 Cartes Maîtresses du Studio Créateur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 transition-colors">
        
        {/* CARTE 1 : UNIQUE BLOC FINANCIER & RETRAIT MOBILE MONEY (Émeraude Radiant) */}
        <div className="relative group overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#13221B] via-[#0E1B15] to-[#0A1410] border border-emerald-500/35 shadow-xl shadow-emerald-950/40 transition-all duration-300 hover:border-emerald-400/60 flex flex-col justify-between">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-400/30 transition-all"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Portefeuille & Solde Net
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  {available.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-400">F CFA</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline flex-shrink-0" />
                <span>Part 80% nette retirable immédiatement</span>
              </p>
            </div>

            {/* Jauge Seuil Min de Retrait */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                <span>Seuil de retrait : 5 000 F</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Synthèse globale financière & Bouton Retrait */}
          <div className="pt-3.5 mt-3 border-t border-emerald-500/20 flex flex-col gap-2.5 relative z-10">
            <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium">
              <span>Cumulé : <strong className="text-white">{totalEarned.toLocaleString('fr-FR')} F</strong></span>
              <span>Versé : <strong className="text-cyan-300">{totalWithdrawn.toLocaleString('fr-FR')} F</strong></span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200/80 font-medium">
                {canWithdraw ? "Prêt pour virement" : `Encore ${(minThreshold - available).toLocaleString('fr-FR')} F`}
              </span>
              <button
                onClick={onOpenPayout}
                disabled={!canWithdraw}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 active:scale-95 shadow-md ${
                  canWithdraw
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'
                    : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Retirer (MoMo)</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARTE 2 : TAUX D'ENGAGEMENT DES FANS (Purple/Indigo Radiant) */}
        <div className="relative group overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#20132C] via-[#161022] to-[#100C18] border border-purple-500/35 shadow-xl shadow-purple-950/40 transition-all duration-300 hover:border-purple-400/60 flex flex-col justify-between">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-400/30 transition-all"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                Taux d'Engagement Fans
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {analytics.engagement.status}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  {analytics.engagement.rate}%
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-purple-300">interactions</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5">
                Fidélité et réactions moyennes des fans
              </p>
            </div>

            {/* Jauge d'Engagement */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                <span>Rétention abonnés</span>
                <span>{analytics.engagement.retention_rate}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full transition-all duration-500" 
                  style={{ width: `${analytics.engagement.retention_rate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Indicateurs clés d'engagement */}
          <div className="pt-3.5 mt-3 border-t border-purple-500/20 space-y-2 relative z-10">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="text-gray-400 block">Abonnés VIP actifs</span>
                <strong className="text-white text-xs font-black flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-sky-400" />
                  {analytics.engagement.active_vip_fans} fans VIP
                </strong>
              </div>
              <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                <span className="text-gray-400 block">Réponses VIP</span>
                <strong className="text-emerald-300 text-xs font-black flex items-center gap-1 mt-0.5">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {analytics.engagement.vip_messages_response_rate}% traités
                </strong>
              </div>
            </div>

            {onGoToAnalytics && (
              <button
                type="button"
                onClick={onGoToAnalytics}
                className="w-full py-1.5 px-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1 border border-purple-500/25 active:scale-95"
              >
                <span>Détails & Suivi d'Engagement</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* CARTE 3 : TAUX D'ÉVOLUTION SUR LA PLATEFORME (Gold/Amber Radiant) */}
        <div className="relative group overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#271A0B] via-[#1B1309] to-[#120D06] border border-amber-500/35 shadow-xl shadow-amber-950/40 transition-all duration-300 hover:border-amber-400/60 flex flex-col justify-between">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-400/30 transition-all"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                Taux d'Évolution CDAR
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-yellow-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-yellow-400" />
                +{analytics.evolution.growth_rate}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  +{analytics.evolution.growth_rate}%
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-yellow-400">{analytics.evolution.period}</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5 flex items-center gap-1">
                <span>Score popularité :</span>
                <strong className="text-yellow-400 font-bold">{analytics.evolution.popularity_score.toLocaleString('fr-FR')} pts</strong>
                <span className="text-emerald-400 text-[10px] font-bold">(+{analytics.evolution.popularity_gain})</span>
              </p>
            </div>

            {/* Jauge de Régularité & Dynamique */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                <span>Régularité de diffusion</span>
                <span>{analytics.evolution.content_regularity}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                  style={{ width: `${analytics.evolution.content_regularity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Raccourci vers le classement et statut */}
          <div className="pt-3.5 mt-3 border-t border-amber-500/20 flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] text-gray-400 block">Rang officiel CDAR</span>
              <strong className="text-yellow-300 text-xs font-black flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-400" />
                #{analytics.evolution.platform_rank} • {analytics.evolution.badge}
              </strong>
            </div>

            {onGoToRanking && (
              <button
                type="button"
                onClick={onGoToRanking}
                className="px-3 py-1.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500 text-yellow-400 hover:text-black text-xs font-black transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Podium</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Bannières Complémentaires : Statistiques Complètes & Classement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {onGoToAnalytics && (
          <div 
            onClick={onGoToAnalytics}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/25 hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between gap-3 group shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center font-black shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Statistiques d'Activité & Engagement</h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
                    ANALYTICS EN DIRECT
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Publications, streams, fidélité VIP, classement des formats et suivi des interactions.
                </p>
              </div>
            </div>
            <button 
              type="button"
              className="self-end px-3.5 py-1.5 rounded-xl bg-cyan-500/15 group-hover:bg-cyan-500 text-cyan-500 group-hover:text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Consulter le rapport complet</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {onGoToRanking && (
          <div 
            onClick={onGoToRanking}
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/25 hover:border-yellow-500/50 cursor-pointer transition-all flex flex-col justify-between gap-3 group shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-black flex items-center justify-center font-black shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Classement Officiel des Artistes</h4>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 border border-yellow-500/30">
                    PODIUM #{analytics.evolution.platform_rank}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Rang officiel #{analytics.evolution.platform_rank}, score de popularité et comparaison entre pairs.
                </p>
              </div>
            </div>
            <button 
              type="button"
              className="self-end px-3.5 py-1.5 rounded-xl bg-yellow-500/15 group-hover:bg-yellow-500 text-yellow-500 group-hover:text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Voir le classement complet</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
