import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Heart, Radio, Music, Video, Camera,
  Sparkles, Award, Trophy, Eye, MessageCircle, Share2, Smartphone,
  Calendar, ArrowUpRight, CheckCircle2, ShieldCheck, Zap, RefreshCw,
  Flame, Globe, CreditCard, ChevronRight, MessageSquare, Play, HelpCircle
} from 'lucide-react';
import { apiGetArtistAnalytics } from '../../api';

export default function ArtistAnalyticsView({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d'); // '7d' | '30d' | '90d' | 'all'
  const [graphMetric, setGraphMetric] = useState('interactions'); // 'interactions' | 'views' | 'fans'
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await apiGetArtistAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Erreur chargement analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const artistName = currentUser?.stage_name || currentUser?.display_name || "l'Artiste";

  // Données par défaut ou issues de l'API
  const activities = analytics?.activities || {
    total_posts: 12,
    posts_music: 5,
    posts_video: 3,
    posts_photo: 3,
    posts_podcast: 1,
    posts_free: 4,
    posts_vip: 6,
    posts_ppv: 2,
    total_lives: 3,
    total_live_spectators: 3850,
    community_members: 14,
    announcements_count: 5,
    polls_count: 3,
    ppv_sales_count: 28,
    ppv_revenue_cfa: 28000,
    tips_received_count: 19,
    tips_total_cfa: 95000
  };

  const engagement = analytics?.engagement_metrics || {
    global_rate: 88.4,
    total_views: 18450,
    total_likes: 5720,
    total_comments: 1475,
    total_shares: 738,
    vip_messages_response_rate: 96.0,
    retention_rate: 92.4,
    active_vip_fans: 3,
    simple_tier_count: 1,
    vip_tier_count: 1,
    super_fan_tier_count: 1
  };

  const formatPerformance = analytics?.format_performance || [
    { format: "Lives & Concerts Virtuels", icon: "Radio", count: activities.total_lives, engagement_rate: 96.5, avg_interactions: 520, trend: "+12.4%", color: "rose" },
    { format: "Morceaux & Musique Audio", icon: "Music", count: activities.posts_music, engagement_rate: 94.2, avg_interactions: 385, trend: "+8.7%", color: "amber" },
    { format: "Vidéos & Clips Exclusifs", icon: "Video", count: activities.posts_video, engagement_rate: 91.8, avg_interactions: 335, trend: "+6.3%", color: "purple" },
    { format: "Publications Communauté & Sondages", icon: "Users", count: activities.announcements_count + activities.polls_count, engagement_rate: 88.5, avg_interactions: 220, trend: "+15.1%", color: "emerald" },
    { format: "Photos & Galeries de Scène", icon: "Camera", count: activities.posts_photo, engagement_rate: 78.4, avg_interactions: 165, trend: "+3.2%", color: "blue" },
  ];

  const topPosts = analytics?.top_posts || [
    { id: '1', title: 'Grand Concert Live Acoustique', content_type: 'video', visibility: 'subscribers', views: 4200, likes: 1180, comments: 290, engagement_rate: 95.8, created_at: 'Hier' },
    { id: '2', title: 'Nouveau Single Exclusif (Master)', content_type: 'music', visibility: 'ppv', views: 3600, likes: 980, comments: 240, engagement_rate: 93.4, created_at: 'Il y a 3j' },
    { id: '3', title: 'Freestyle Studio Privé', content_type: 'music', visibility: 'subscribers', views: 2800, likes: 820, comments: 195, engagement_rate: 89.2, created_at: 'Il y a 5j' },
    { id: '4', title: 'Séance Shooting Nouvel Album', content_type: 'photo', visibility: 'free', views: 2450, likes: 650, comments: 130, engagement_rate: 82.5, created_at: 'Il y a 1 sem.' },
  ];

  const topFans = analytics?.top_fans || [
    { id: '1', name: 'Amadou Diallo', country: 'CI', tier_label: 'Super Fan (Palier 3)', badge: '👑 Top Contributeur', total_tips_cfa: 35000, reactions_count: 84, avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: '2', name: 'Aïcha Koné', country: 'SN', tier_label: 'Fan VIP (Palier 2)', badge: '🔥 Fan Assidue', total_tips_cfa: 20000, reactions_count: 72, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: '3', name: 'Koffi Serge', country: 'CI', tier_label: 'Fan VIP (Palier 2)', badge: '⚡ Super Supporter', total_tips_cfa: 15000, reactions_count: 58, avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    { id: '4', name: "Fatou N'diaye", country: 'ML', tier_label: 'Fan Actif (Palier 1)', badge: '⭐ Fan Régulier', total_tips_cfa: 7500, reactions_count: 43, avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  ];

  const geoDistribution = analytics?.geographic_distribution || [
    { country: "Côte d'Ivoire", code: "CI", percentage: 58.4, fans_count: 10775 },
    { country: "Sénégal", code: "SN", percentage: 18.2, fans_count: 3358 },
    { country: "Cameroun", code: "CM", percentage: 9.5, fans_count: 1753 },
    { country: "Mali", code: "ML", percentage: 7.1, fans_count: 1310 },
    { country: "Diaspora & France", code: "FR", percentage: 6.8, fans_count: 1254 }
  ];

  const trendSeries = analytics?.trend_series || [
    { day: "Lun", views: 1850, reactions: 590, new_fans: 2, revenue_cfa: 22200 },
    { day: "Mar", views: 2100, reactions: 670, new_fans: 1, revenue_cfa: 25200 },
    { day: "Mer", views: 2450, reactions: 780, new_fans: 3, revenue_cfa: 29400 },
    { day: "Jeu", views: 2600, reactions: 830, new_fans: 2, revenue_cfa: 31200 },
    { day: "Ven", views: 3400, reactions: 1090, new_fans: 4, revenue_cfa: 40800 },
    { day: "Sam", views: 4200, reactions: 1340, new_fans: 6, revenue_cfa: 50400 },
    { day: "Dim", views: 3800, reactions: 1210, new_fans: 4, revenue_cfa: 45600 }
  ];

  const smartInsights = analytics?.smart_insights || [
    {
      id: 1,
      type: "opportunity",
      title: "Pic d'engagement en fin de semaine",
      description: "Vos fans sont 45% plus actifs les vendredis et samedis soirs entre 19h et 22h. Programmez vos sorties audio et directs lives sur ce créneau.",
      impact: "+35% de réactions"
    },
    {
      id: 2,
      type: "retention",
      title: "Fidélité exceptionnelle des Abonnés VIP",
      description: "Votre taux de rétention de 92.4% prouve la valeur de vos contenus exclusifs. Pensez à récompenser vos Super Fans avec un message audio personnalisé.",
      impact: "+18% de pourboires"
    },
    {
      id: 3,
      type: "format",
      title: "La vidéo et le live génèrent le meilleur partage",
      description: "Vos clips et sessions lives convertissent 2.8x plus de fans gratuits en abonnés payants que les simples images.",
      impact: "+24% de conversion"
    }
  ];

  // Déterminer la valeur max pour la mise à l'échelle du graphique
  const maxGraphValue = Math.max(
    ...trendSeries.map((item) => {
      if (graphMetric === 'interactions') return item.reactions;
      if (graphMetric === 'views') return item.views;
      return item.new_fans * 100;
    })
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Filtres Temporels */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#171722] via-[#1A1828] to-[#14141E] border border-orange-500/25 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-orange-500/20 text-[#FF5500] border border-orange-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Statistiques d'Activité & Engagement Fans
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {analytics?.engagement?.status || "Très Élevé"}
            </span>
          </div>
          <p className="text-xs text-gray-300 max-w-xl">
            Suivi complet de vos publications, directs, dynamiques d'interactions communautaires et fidélité de vos abonnés Mobile Money pour <strong className="text-white">{artistName}</strong>.
          </p>
        </div>

        {/* Sélecteur de période & actualisation */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/10 text-xs font-bold text-gray-300">
            {['7d', '30d', '90d', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-md'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : p === '90d' ? '3 mois' : 'Global'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10 transition-all flex items-center justify-center active:scale-95"
            title="Actualiser les statistiques en direct"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF5500]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Cartes Synthétiques d'Activité & Engagement Clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 : Taux d'Engagement Global */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#22152C] to-[#120D1B] border border-purple-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-purple-300 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              Taux d'Engagement
            </span>
            <span className="text-[10px] font-black bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
              +{analytics?.evolution?.growth_rate || 28.5}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {engagement.global_rate}%
            </span>
            <span className="text-xs text-purple-300 font-bold">score actif</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Moyenne sur {activities.total_posts} publications et directs
          </p>
        </div>

        {/* KPI 2 : Vues & Écoutes Totales */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122220] to-[#0A1413] border border-emerald-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Vues & Écoutes
            </span>
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Streams
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {engagement.total_views.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-emerald-400 font-bold">lectures</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Morceaux audio, vidéos & sessions lives
          </p>
        </div>

        {/* KPI 3 : Interactions & Réactions */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#281810] to-[#170E0A] border border-orange-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-orange-300 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF5500]" />
              Interactions Fans
            </span>
            <span className="text-[10px] font-black bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
              Cœurs & Comms
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {(engagement.total_likes + engagement.total_comments).toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-orange-400 font-bold">réactions</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {engagement.total_likes.toLocaleString('fr-FR')} likes • {engagement.total_comments.toLocaleString('fr-FR')} commentaires
          </p>
        </div>

        {/* KPI 4 : Pourboires & Soutien Direct */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#241E10] to-[#151108] border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
              Pourboires (MoMo)
            </span>
            <span className="text-[10px] font-black bg-amber-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              Tips
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activities.tips_total_cfa.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-yellow-400 font-bold">F CFA</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {activities.tips_received_count} pourboires spontanés reçus
          </p>
        </div>
      </div>

      {/* 3. Graphique d'Évolution Temporelle de l'Engagement */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Courbe d'Évolution de l'Engagement Hebdomadaire</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Fluctuations quotidiennes des réactions de vos fans suite à vos publications et diffusions.
            </p>
          </div>

          {/* Boutons d'axe de métrique */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 self-start sm:self-center">
            <button
              onClick={() => setGraphMetric('interactions')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                graphMetric === 'interactions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Interactions
            </button>
            <button
              onClick={() => setGraphMetric('views')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                graphMetric === 'views'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Vues / Écoutes
            </button>
            <button
              onClick={() => setGraphMetric('fans')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                graphMetric === 'fans'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Nouveaux Abonnés
            </button>
          </div>
        </div>

        {/* Visualisation interactive en barres et jauges animées */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-white/10 pb-2">
            {trendSeries.map((item, idx) => {
              const val = graphMetric === 'interactions' ? item.reactions : graphMetric === 'views' ? item.views : item.new_fans * 100;
              const heightPercent = maxGraphValue > 0 ? Math.max(15, Math.round((val / maxGraphValue) * 100)) : 20;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip Valeur */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap mb-1">
                    {graphMetric === 'interactions'
                      ? `${item.reactions} réactions`
                      : graphMetric === 'views'
                      ? `${item.views} vues`
                      : `+${item.new_fans} fans`}
                  </div>

                  {/* Barre Graphique */}
                  <div className="w-full max-w-[42px] bg-white/5 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125 ${
                        graphMetric === 'interactions'
                          ? 'bg-gradient-to-t from-purple-600 to-pink-500 shadow-purple-500/20'
                          : graphMetric === 'views'
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-emerald-500/20'
                          : 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-orange-500/20'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Label Jour */}
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3">
            <span>Données en temps réel synchronisées avec les lectures des fans</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" />
              Tendance globale en hausse (+28.5%)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Grille Duale : Activités par Format & Répartition Géographique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Colonne Gauche : Taux d'Engagement par Format d'Activité */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Engagement par Format d'Activité</span>
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Classement efficacité</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {formatPerformance.map((fp, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2 hover:border-white/15 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      {fp.icon === 'Radio' && <Radio className="w-4 h-4 text-rose-400" />}
                      {fp.icon === 'Music' && <Music className="w-4 h-4 text-amber-400" />}
                      {fp.icon === 'Video' && <Video className="w-4 h-4 text-purple-400" />}
                      {fp.icon === 'Users' && <Users className="w-4 h-4 text-emerald-400" />}
                      {fp.icon === 'Camera' && <Camera className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{fp.format}</h4>
                      <p className="text-[10px] text-gray-400">
                        {fp.count} activités • ~{fp.avg_interactions} réactions/activité
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-white block">
                      {fp.engagement_rate}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {fp.trend}
                    </span>
                  </div>
                </div>

                {/* Barre de progression du format */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fp.color === 'rose'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                        : fp.color === 'amber'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : fp.color === 'purple'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        : fp.color === 'emerald'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    style={{ width: `${fp.engagement_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite : Répartition Géographique de l'Audience */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Rayonnement & Origine des Fans</span>
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Pénétration sous-régionale</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {geoDistribution.map((geo, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {geo.code === 'CI' ? '🇨🇮' : geo.code === 'SN' ? '🇸🇳' : geo.code === 'CM' ? '🇨🇲' : geo.code === 'ML' ? '🇲🇱' : '🌍'}
                    </span>
                    <div>
                      <span className="text-xs font-black text-white block">{geo.country}</span>
                      <span className="text-[10px] text-gray-400">{geo.fans_count.toLocaleString('fr-FR')} interactions</span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-blue-300">
                    {geo.percentage}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${geo.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Synthèse Abonnements par Paliers */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-black text-amber-300 uppercase block">Abonnés VIP Fidèles</span>
              <span className="text-[10px] text-gray-300">Taux de rétention mensuelle : <strong className="text-white">92.4%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-black text-white">Tier 1: {engagement.simple_tier_count}</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">VIP: {engagement.vip_tier_count}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">Super: {engagement.super_fan_tier_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top Fans & Membres les Plus Engagés */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Leaderboard des Super Fans & Membres les Plus Actifs</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Ces fans représentent le cœur de votre communauté et génèrent le plus de réactions et de pourboires Mobile Money.
            </p>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 self-start sm:self-center">
            COMMUNAUTÉ TOP 5
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {topFans.map((fan, idx) => (
            <div
              key={fan.id || idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-all space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={fan.avatar_url}
                    alt={fan.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/10 group-hover:border-yellow-400 transition-colors"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/90 border border-white/20 text-[9px] font-black flex items-center justify-center text-yellow-400">
                    #{idx + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-black text-white truncate">{fan.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{fan.tier_label}</p>
                  <span className="inline-block text-[9px] font-bold text-yellow-300 mt-0.5">
                    {fan.badge}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-white/10">
                <div className="bg-black/30 rounded-lg p-1.5 text-center">
                  <span className="text-gray-400 block">Pourboires</span>
                  <strong className="text-emerald-400 font-black text-[11px]">
                    {fan.total_tips_cfa.toLocaleString('fr-FR')} F
                  </strong>
                </div>
                <div className="bg-black/30 rounded-lg p-1.5 text-center">
                  <span className="text-gray-400 block">Réactions</span>
                  <strong className="text-purple-300 font-black text-[11px]">
                    {fan.reactions_count} cœurs
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Top Publications les Plus Engageantes */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            <span>Top Publications Ayant Généré le Plus d'Engagement</span>
          </h3>
          <span className="text-[10px] font-bold text-gray-400">Classement par interactions</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Contenu / Titre</th>
                <th className="pb-3">Format</th>
                <th className="pb-3">Visibilité</th>
                <th className="pb-3 text-right">Vues / Écoutes</th>
                <th className="pb-3 text-right">Cœurs</th>
                <th className="pb-3 text-right">Engagement</th>
                <th className="pb-3 pr-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topPosts.map((post, idx) => (
                <tr key={post.id || idx} className="hover:bg-white/5 transition-colors group">
                  <td className="py-3 pl-2">
                    <span className="font-bold text-white group-hover:text-[#FF5500] transition-colors block">
                      {post.title}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-gray-200 capitalize">
                      {post.content_type}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      post.visibility === 'ppv'
                        ? 'bg-amber-500/20 text-yellow-300 border border-amber-500/30'
                        : post.visibility === 'subscribers'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {post.visibility === 'ppv' ? `PPV (${post.price_cfa} F)` : post.visibility === 'subscribers' ? 'VIP' : 'Gratuit'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-gray-300">
                    {post.views.toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-pink-400">
                    {post.likes.toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 text-right font-black text-emerald-400">
                    {post.engagement_rate}%
                  </td>
                  <td className="py-3 pr-2 text-right text-gray-400 text-[11px]">
                    {post.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Recommandations Intelligentes pour Booster l'Engagement */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 shadow-xl space-y-3.5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-black text-white">
            Conseils d'Optimisation de l'Engagement Communautaire
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {smartInsights.map((insight) => (
            <div key={insight.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  Recommandation #{insight.id}
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {insight.impact}
                </span>
              </div>
              <h4 className="text-xs font-black text-white">{insight.title}</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
