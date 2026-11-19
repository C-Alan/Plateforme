import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, SlidersHorizontal, Sparkles, Plus, Minus, Check,
  ShieldCheck, Star, Radio, ArrowRight, Music, Video, Image,
  FileText, Flame, ExternalLink, X, Play, Volume2, Share2, Menu,
  Lock, Eye, Headphones, Camera, BookOpen, Layers, UserCheck, ChevronRight, Trophy
} from 'lucide-react';
import { apiGetActiveLives, apiGetArtists } from '../../api';
import ArtistProfileFanView from './ArtistProfileFanView';

export default function DiscoveryView({
  posts = [],
  onUnlockPost,
  onSubscribeArtist,
  onGoToLives,
  onGoToFeedWithArtist,
  onGoToFeedWithCategory,
  onGoToRanking,
  onViewArtistProfile,
  currentFan
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [expandedCardId, setExpandedCardId] = useState('cat_music'); // Par défaut la 1ère ouverte ou null

  const [activeLives, setActiveLives] = useState([]);
  const [loadingLives, setLoadingLives] = useState(false);
  const [apiArtists, setApiArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  // Artiste sélectionné pour la modale d'aperçu rapide
  const [selectedArtistModal, setSelectedArtistModal] = useState(null);

  // Charger les données de découverte (Lives actifs et Artistes)
  useEffect(() => {
    const loadData = async () => {
      setLoadingLives(true);
      setLoadingArtists(true);
      try {
        const [lives, arts] = await Promise.all([
          apiGetActiveLives().catch(() => []),
          apiGetArtists().catch(() => [])
        ]);
        setActiveLives(lives);
        setApiArtists(arts);
      } catch (err) {
        console.error("Erreur chargement données de découverte:", err);
      } finally {
        setLoadingLives(false);
        setLoadingArtists(false);
      }
    };
    loadData();
  }, []);

  // Définition structurée des 7 grandes Catégories de Contenu CDAR
  const contentCategories = useMemo(() => [
    {
      id: 'cat_music',
      key: 'music',
      title: 'Musique & Titres Inédits',
      subtitle: 'MAQUETTES, SESSIONS BRUTES & VERSIONS ACOUSTIQUES',
      tagline: 'AUDIO HAUTE FIDÉLITÉ',
      badge: 'AUDIO EXCLUSIF',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200',
      description: 'Découvrez en exclusivité les singles avant sortie officielle, les maquettes brutes enregistrées en studio de nuit, les sessions acoustiques et les featurings inédits des créateurs.',
      filterFn: (p) => p.content_type?.toLowerCase() === 'music',
    },
    {
      id: 'cat_video',
      key: 'video',
      title: 'Vidéos & Clips Exclusifs',
      subtitle: 'AVANT-PREMIÈRES, TEASERS & SÉANCES 4K',
      tagline: 'CAPTATIONS HAUTE DÉFINITION',
      badge: 'VIDÉO 4K',
      icon: Video,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
      description: 'Visionnez les clips musicaux officiels en avant-première, versions longues director’s cut, séances de studio filmées et teasers exclusifs réservés aux fans CDAR.',
      filterFn: (p) => p.content_type?.toLowerCase() === 'video',
    },
    {
      id: 'cat_live',
      key: 'live',
      title: 'Lives & Directs en Streaming',
      subtitle: activeLives.length > 0
        ? `${activeLives.length} DIRECT(S) EN COURS • CHAT & DONS EN TEMPS RÉEL`
        : 'CONCERTS INTERACTIFS & REPLAY 48H',
      tagline: 'DIFFUSION INTERACTIVE 🔴',
      badge: activeLives.length > 0 ? 'EN DIRECT 🔴' : 'STREAMING 🔴',
      icon: Radio,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      description: 'Vivez l\'intensité des performances en direct : concerts intimistes, sessions de composition interactive, chat en direct avec les artistes et replays garantis 48h.',
      isLiveCategory: true,
    },
    {
      id: 'cat_podcast',
      key: 'podcast',
      title: 'Podcasts & Notes Vocales',
      subtitle: 'MÉMOS AUDIO, CONFIDENCES & DÉBRIEFS DE SCÈNE',
      tagline: 'VOICE NOTES EXCLUSIVES',
      badge: 'VOCAL VIP',
      icon: Volume2,
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200',
      description: 'Notes vocales privées enregistrées par les artistes à la volée, réflexions personnelles, anecdotes de tournées et discussions audio exclusives.',
      filterFn: (p) => p.content_type?.toLowerCase() === 'podcast',
    },
    {
      id: 'cat_photo',
      key: 'photo',
      title: 'Galeries Photos & Shootings',
      subtitle: 'SÉANCES PHOTOS HD, POCHETTES & ARCHIVES RARES',
      tagline: 'VISUELS HAUTE RÉSOLUTION',
      badge: 'GALERIE HD',
      icon: Image,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200',
      description: 'Consultez et admirez les visuels haute fidélité : séances photos officielles, déclinaisons d\'artworks d\'albums, clichés de concerts et shootings inédits.',
      filterFn: (p) => p.content_type?.toLowerCase() === 'photo' || p.content_type?.toLowerCase() === 'image',
    }
  ], [activeLives]);

  // Liste enrichie des Artistes pour la section "Specialist" (Plateforme_Search_2.png)
  const specialists = useMemo(() => {
    // Profils de base correspondant fidèlement à la section Specialist de Plateforme_Search_2.png
    const defaultSpecialists = [
      {
        id: 'spec_didib',
        artist_id: '73d85f29-42b1-49de-bce4-6a911195ccc1',
        stage_name: 'Didi B',
        category: 'Rap Ivoire',
        portrait_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        kyc_status: 'verified',
        post_count: 4,
        min_tier_price_cfa: 5000,
        bio: 'Pionnier du Rap Ivoire : exclusivités de l\'album "Before History", sessions studio et coulisses de loges.'
      },
      {
        id: 'spec_josey',
        artist_id: '83e95f29-42b1-49de-bce4-6a911195ccc2',
        stage_name: 'Josey',
        category: 'Afro-Soul',
        portrait_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        kyc_status: 'verified',
        post_count: 2,
        min_tier_price_cfa: 10000,
        bio: 'Voix d\'or de la musique ivoirienne : sessions acoustiques, secrets vocaux et titres inédits.'
      },
      {
        id: 'spec_annerenner',
        artist_id: 'spec_anne',
        stage_name: 'Anne Renner',
        category: 'Pop & R&B Urbain',
        portrait_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        kyc_status: 'verified',
        post_count: 6,
        min_tier_price_cfa: 5000,
        bio: 'Compositrice et interprète : morceaux acoustiques et captations visuelles intimistes.'
      },
      {
        id: 'spec_bettymoser',
        artist_id: 'spec_betty',
        stage_name: 'Betty Moser',
        category: 'Acoustique & Neo-Soul',
        portrait_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
        kyc_status: 'verified',
        post_count: 3,
        min_tier_price_cfa: 7500,
        bio: 'Arrangements acoustiques en studio, harmonies vocales et créations exclusives.'
      },
      {
        id: 'spec_uzow',
        artist_id: 'spec_uzo',
        stage_name: 'Uzo Williams',
        category: 'Afrobeat & Danse',
        portrait_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
        kyc_status: 'verified',
        post_count: 5,
        min_tier_price_cfa: 5000,
        bio: 'Énergie scénique, chorégraphies inédites et coulisses de tournées panafricaines.'
      }
    ];

    // Fusion avec les artistes retournés par l'API backend
    const merged = [...defaultSpecialists];
    apiArtists.forEach(art => {
      const existingIdx = merged.findIndex(s =>
        (s.artist_id && s.artist_id === art.id) ||
        s.stage_name.toLowerCase() === (art.stage_name || '').toLowerCase()
      );

      if (existingIdx >= 0) {
        merged[existingIdx] = {
          ...merged[existingIdx],
          artist_id: art.id,
          stage_name: art.stage_name || merged[existingIdx].stage_name,
          category: art.category || merged[existingIdx].category,
          bio: art.bio || merged[existingIdx].bio,
          post_count: art.post_count ?? merged[existingIdx].post_count,
          min_tier_price_cfa: art.min_tier_price_cfa ?? merged[existingIdx].min_tier_price_cfa,
          kyc_status: art.kyc_status || merged[existingIdx].kyc_status,
        };
      } else {
        merged.push({
          id: `spec_${art.id}`,
          artist_id: art.id,
          stage_name: art.stage_name || 'Artiste Certifié',
          category: art.category || 'Musique',
          portrait_url: art.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          kyc_status: art.kyc_status || 'verified',
          post_count: art.post_count || 1,
          min_tier_price_cfa: art.min_tier_price_cfa || 5000,
          bio: art.bio || 'Créateur certifié de la plateforme CDAR.',
        });
      }
    });

    return merged;
  }, [apiArtists]);

  // Filtrage des spécialistes par recherche
  const filteredSpecialists = useMemo(() => {
    if (!searchQuery.trim()) return specialists;
    const q = searchQuery.trim().toLowerCase();
    return specialists.filter(s =>
      s.stage_name.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.bio?.toLowerCase().includes(q)
    );
  }, [specialists, searchQuery]);

  // Filtrage des catégories selon la recherche et le filtre pilule
  const filteredCategories = useMemo(() => {
    return contentCategories.filter(cat => {
      // Filtre par catégorie sélectionnée
      if (selectedCategoryFilter !== 'ALL' && cat.id !== selectedCategoryFilter && cat.key !== selectedCategoryFilter) {
        return false;
      }

      // Filtre textuel
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = cat.title.toLowerCase().includes(q);
        const matchSubtitle = cat.subtitle.toLowerCase().includes(q);
        const matchDesc = cat.description.toLowerCase().includes(q);
        const matchTag = cat.badge.toLowerCase().includes(q);

        // Vérifier si des posts dans cette catégorie correspondent aussi à la recherche
        const matchingPosts = cat.isLiveCategory
          ? activeLives.filter(l => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
          : posts.filter(p => cat.filterFn && cat.filterFn(p) && (p.title?.toLowerCase().includes(q) || p.artist_name?.toLowerCase().includes(q)));

        return matchTitle || matchSubtitle || matchDesc || matchTag || matchingPosts.length > 0;
      }

      return true;
    });
  }, [contentCategories, selectedCategoryFilter, searchQuery, activeLives, posts]);

  const toggleExpand = (id) => {
    setExpandedCardId(prev => prev === id ? null : id);
  };

  // Liste des filtres rapides
  const quickFilters = [
    { id: 'ALL', label: 'Toutes les Catégories' },
    { id: 'cat_music', label: '🎵 Musique & Inédits' },
    { id: 'cat_video', label: '🎬 Vidéos & Clips' },
    { id: 'cat_live', label: '🔴 Lives Direct' },
    { id: 'cat_podcast', label: '🎙️ Podcasts' },
    { id: 'cat_photo', label: '📸 Galeries Photos' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto pb-28 pt-2">

      {/* 1. CONTAINER MOBILE STYLE ÉPURÉ IDENTIQUE À PLATEFORME_SEARCH_1.PNG */}
      <div className="bg-[#FAFBFD] dark:bg-[#0D0D14] rounded-[44px] p-5 sm:p-7 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] space-y-6 transition-colors">

        {/* TOP BRANDING BAR (Plateforme_Search_1.png : "YOUR LOGO" & "MENU :") */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white uppercase font-mono">
              CDAR CREATIVE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]"></span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
            MENU :
          </span>
        </div>

        {/* ACCÈS DIRECT AU CLASSEMENT OFFICIEL DES ARTISTES */}
        {onGoToRanking && (
          <button
            onClick={onGoToRanking}
            type="button"
            className="w-full p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-orange-500/15 border border-yellow-500/30 flex items-center justify-between group hover:border-yellow-500/50 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-black flex items-center justify-center font-black shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Classement Officiel des Artistes</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 dark:text-yellow-400">
                    TOP 2026
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Consulter le podium, la popularité et les créateurs phares
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>
        )}

        {/* SEARCH & FILTERS BAR (EXACTE REPRODUCTION PLATEFORME_SEARCH_1.PNG) */}
        <div className="flex items-center gap-2">
          {/* Champ de recherche ovale arrondi */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search categories or artists"
              className="w-full bg-white dark:bg-[#161622] border border-slate-300 dark:border-white/15 rounded-full px-5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-slate-800 dark:focus:border-[#FF7A00] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bouton Pilule Noire "filters" */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${filterDrawerOpen || selectedCategoryFilter !== 'ALL'
              ? 'bg-[#FF7A00] text-white shadow-glow-orange'
              : 'bg-black text-white hover:bg-slate-800'
              }`}
          >
            <span>filters</span>
            {selectedCategoryFilter !== 'ALL' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            )}
          </button>

          {/* Bouton d'action / rafraîchir */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('ALL');
            }}
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/15 bg-white dark:bg-[#161622] flex items-center justify-center text-slate-700 dark:text-gray-300 hover:border-slate-800 dark:hover:border-white shadow-sm flex-shrink-0"
            title="Réinitialiser"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* TIROIR DE FILTRES DÉPLOYABLE (CATÉGORIES DE CONTENU) */}
        {filterDrawerOpen && (
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-[#161624] border border-slate-200 dark:border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 font-mono">
              <span>Filtrer par Catégorie de Contenu</span>
              <button
                onClick={() => setSelectedCategoryFilter('ALL')}
                className="text-[10px] text-orange-500 hover:underline"
              >
                Tout Afficher
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickFilters.map((qf) => (
                <button
                  key={qf.id}
                  onClick={() => setSelectedCategoryFilter(qf.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${selectedCategoryFilter === qf.id
                    ? 'bg-black dark:bg-[#FF7A00] text-white font-black shadow-sm'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10 hover:border-slate-400'
                    }`}
                >
                  {qf.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION ÉDITORIALE TITRE (EXACTE TYPOGRAPHIE PLATEFORME_SEARCH_1.PNG) */}
        <div className="flex items-end justify-between pt-1 px-1">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 font-mono">
              DÉCOUVERTE DU CATALOGUE
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight leading-[1.05] font-sans">
              COMPOSITION,<br />
              CARE & ORIGIN
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 block font-mono">
              MADE IN
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">
              NOWHERE
            </span>
          </div>
        </div>

        {/* 2. LE DECK DE CARTES EN CASCADE PAR CATÉGORIE DE CONTENU (PLATEFORME_SEARCH_1.PNG) */}
        <div className="pt-2 relative">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Aucune catégorie de contenu ne correspond à "{searchQuery}".
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredCategories.map((category, index) => {
                const isExpanded = expandedCardId === category.id;
                const IconComponent = category.icon;

                // Contenus réels associés à cette catégorie
                const categoryPosts = category.isLiveCategory
                  ? []
                  : posts.filter(p => category.filterFn && category.filterFn(p));

                const countBadge = category.isLiveCategory
                  ? (activeLives.length > 0 ? `${activeLives.length} DIRECT 🔴` : 'SESSION LIVE')
                  : (categoryPosts.length > 0 ? `${categoryPosts.length} CONTENU${categoryPosts.length > 1 ? 'S' : ''}` : category.badge);

                return (
                  <div
                    key={category.id}
                    style={{ zIndex: index + 10 }}
                    className={`transition-all duration-300 ${index === 0 ? 'mt-0' : '-mt-10 sm:-mt-12'
                      } ${isExpanded ? 'my-3 z-50' : 'hover:-translate-y-2'}`}
                  >
                    <div
                      className={`relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.35)] border border-white/20 dark:border-white/10 bg-[#12121A] transition-all duration-300 ${isExpanded ? 'ring-2 ring-orange-500/80 shadow-2xl' : ''
                        }`}
                    >
                      {/* Image de fond de la carte cascade avec voile dégradé texturé */}
                      <div className="absolute inset-0 z-0">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover object-center brightness-75 hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35"></div>
                      </div>

                      {/* Header Visible de la carte de catégorie (Visible en mode empilé) */}
                      <div
                        onClick={() => toggleExpand(category.id)}
                        className="relative z-10 p-4 sm:p-5 flex items-center justify-between cursor-pointer min-h-[92px] sm:min-h-[104px]"
                      >
                        {/* Côté Gauche : Bouton (+) Blanc et Titre de la Catégorie */}
                        <div className="flex items-center space-x-3.5 pr-2 min-w-0">
                          {/* Le Bouton (+) blanc ovale identique à Plateforme_Search_1.png */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(category.id);
                            }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0 hover:scale-110 active:scale-95 transition-transform"
                          >
                            {isExpanded ? (
                              <Minus className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <Plus className="w-4 h-4 stroke-[3]" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-black text-white text-sm sm:text-base tracking-tight truncate drop-shadow-md">
                                {category.title}
                              </h3>
                            </div>
                            <p className="text-[10px] font-bold text-gray-300/90 truncate uppercase tracking-wider font-mono">
                              {category.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Côté Droit : Typographie stylisée micro-metadata */}
                        <div className="text-right flex-shrink-0 pl-2">
                          <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase font-mono tracking-widest block drop-shadow-sm ${category.isLiveCategory && activeLives.length > 0
                            ? 'text-rose-400 animate-pulse font-black'
                            : 'text-white/90'
                            }`}>
                            {countBadge}
                          </span>
                          <span className="text-[9px] text-gray-300 font-medium font-mono hidden sm:block">
                            EXCLUSIF
                          </span>
                        </div>
                      </div>

                      {/* Contenu Déployé : Détail de la Catégorie et Publications réelles */}
                      {isExpanded && (
                        <div className="relative z-10 px-5 pb-5 pt-2 space-y-4 border-t border-white/10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                          {/* Description de la catégorie */}
                          <p className="text-xs text-gray-200 leading-relaxed">
                            {category.description}
                          </p>

                          {/* 1. CAS PARTICULIER : CATÉGORIE LIVES EN STREAMING */}
                          {category.isLiveCategory ? (
                            <div className="space-y-3 pt-1">
                              {activeLives.length > 0 ? (
                                <div className="space-y-2">
                                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 font-mono uppercase">
                                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                                    <span>Diffusions en direct actuellement</span>
                                  </span>
                                  {activeLives.map((live) => (
                                    <div
                                      key={live.id}
                                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                                    >
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">
                                          {live.title}
                                        </h4>
                                        <p className="text-[10px] text-gray-400 truncate">
                                          {live.artist_name || 'Artiste Certifié'} • {live.current_viewers || 1} spectateur(s)
                                        </p>
                                      </div>
                                      <button
                                        onClick={onGoToLives}
                                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-[11px] shadow-glow-orange flex items-center gap-1 flex-shrink-0"
                                      >
                                        <Play className="w-3 h-3 fill-white" />
                                        <span>Rejoindre</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                                  <Radio className="w-6 h-6 text-gray-400 mx-auto" />
                                  <p className="text-xs text-gray-300 font-bold">
                                    Aucun live en direct pour l'instant.
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    Les abonnés VIP bénéficient de notifications prioritaires dès le lancement d'une session et du replay pendant 48 heures.
                                  </p>
                                  <button
                                    onClick={onGoToLives}
                                    className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs inline-flex items-center gap-1.5 mt-1"
                                  >
                                    <span>Consulter l'espace Lives</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 2. CAS GÉNÉRAL : LISTE DES CONTENUS DISPONIBLES DANS CETTE CATÉGORIE */
                            <div className="space-y-2.5 pt-1">
                              {categoryPosts.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 font-mono uppercase">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Publications disponibles ({categoryPosts.length})</span>
                                    </span>
                                  </div>

                                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                                    {categoryPosts.map((post) => {
                                      const isFree = post.visibility === 'free';
                                      const isPPV = post.visibility === 'ppv';
                                      const isVIP = post.visibility === 'subscribers';
                                      const canView = post.can_view !== false;

                                      return (
                                        <div
                                          key={post.id}
                                          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 flex items-center justify-between gap-3 transition-colors"
                                        >
                                          {/* Miniature & Infos */}
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                                              {post.teaser_media_url || post.media_url ? (
                                                <img
                                                  src={post.teaser_media_url || post.media_url}
                                                  alt=""
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <IconComponent className="w-4 h-4 text-gray-400" />
                                              )}
                                              {!canView && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                  <Lock className="w-3 h-3 text-amber-400" />
                                                </div>
                                              )}
                                            </div>

                                            <div className="min-w-0">
                                              <h4 className="text-xs font-bold text-white truncate">
                                                {post.title || 'Publication exclusive'}
                                              </h4>
                                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                <span className="font-semibold text-gray-300 truncate">
                                                  {post.artist_name || 'Artiste CDAR'}
                                                </span>
                                                <span>•</span>
                                                <span className={`font-mono uppercase font-bold ${isFree ? 'text-emerald-400' : isPPV ? 'text-amber-400' : 'text-purple-400'
                                                  }`}>
                                                  {isFree ? 'Gratuit' : isPPV ? `${post.price_cfa || 1000} F` : 'VIP'}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Bouton d'action selon accès */}
                                          <div className="flex-shrink-0">
                                            {canView ? (
                                              <button
                                                onClick={() => {
                                                  if (onGoToFeedWithCategory) {
                                                    onGoToFeedWithCategory(category.key);
                                                  } else if (onGoToFeedWithArtist) {
                                                    onGoToFeedWithArtist(post.artist_id);
                                                  }
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                                              >
                                                <Play className="w-3 h-3 fill-white" />
                                                <span>Ouvrir</span>
                                              </button>
                                            ) : isPPV ? (
                                              <button
                                                onClick={() => onUnlockPost && onUnlockPost(post)}
                                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] shadow-sm flex items-center gap-1"
                                              >
                                                <Lock className="w-3 h-3" />
                                                <span>Acheter</span>
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => onUnlockPost && onUnlockPost(post)}
                                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                                              >
                                                <Lock className="w-3 h-3" />
                                                <span>VIP</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1.5">
                                  <p className="text-xs text-gray-300 font-bold">
                                    Nouveaux contenus en cours de publication
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    Les créateurs certifiés préparent les prochains titres et contenus exclusifs pour cette catégorie.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bouton de pied de carte : Explorer toute la catégorie dans le feed */}
                          <div className="pt-2 flex items-center justify-between border-t border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">
                              CATÉGORIE OFFICIELLE CDAR
                            </span>

                            <button
                              onClick={() => {
                                if (category.isLiveCategory) {
                                  onGoToLives && onGoToLives();
                                } else if (onGoToFeedWithCategory) {
                                  onGoToFeedWithCategory(category.key);
                                } else if (onGoToFeedWithArtist) {
                                  onGoToFeedWithArtist(null);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <span>Voir tout dans le fil</span>
                              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. SECTION SPÉCIALISTES & DÉCOUVERTE D'ARTISTES (PLATEFORME_SEARCH_2.PNG) */}
        <div className="pt-6 sm:pt-8 space-y-3.5">
          {/* Header de la section "Specialist" (Style exact de Plateforme_Search_2.png) */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Specialist
            </h2>
            <button
              onClick={() => {
                if (onGoToFeedWithArtist) onGoToFeedWithArtist(null);
              }}
              className="text-xs font-bold text-[#FF7A00] hover:underline font-mono tracking-wide flex items-center gap-0.5"
            >
              <span>Voir tout ({filteredSpecialists.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Carousel horizontal de cartes portraits style Plateforme_Search_2.png */}
          <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-2 -mx-1 px-1 snap-x scroll-smooth">
            {filteredSpecialists.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 w-full">
                Aucun artiste ne correspond à votre recherche "{searchQuery}".
              </div>
            ) : (
              filteredSpecialists.map((specialist) => (
                <div
                  key={specialist.id}
                  onClick={() => {
                    if (onViewArtistProfile) {
                      onViewArtistProfile(specialist);
                    } else {
                      setSelectedArtistModal(specialist);
                    }
                  }}
                  className="w-[145px] sm:w-[165px] h-[225px] sm:h-[260px] flex-shrink-0 snap-start relative rounded-[26px] overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/50 dark:border-white/10 group cursor-pointer transition-all duration-300 hover:scale-[1.03] bg-slate-900"
                >
                  {/* Photo plein cadre portrait */}
                  <img
                    src={specialist.portrait_url}
                    alt={specialist.stage_name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dégradé immersif du bas */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                  {/* Badge KYC si vérifié */}
                  {specialist.kyc_status === 'verified' && (
                    <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}

                  {/* Typographie en bas de la carte (Identique à "Anne Renner", "Betty Moser", "Uzo W") */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-0.5">
                    <h4 className="font-bold text-sm sm:text-base text-white tracking-tight leading-tight line-clamp-1 drop-shadow-md">
                      {specialist.stage_name}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-amber-300/90 tracking-wide line-clamp-1 drop-shadow">
                      {specialist.category}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM BAR (Plateforme_Search_1.png : "Catalogue" et icône menu) */}
        <div className="flex items-center justify-between pt-6 px-2 border-t border-slate-200 dark:border-white/10">
          <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Catalogue
          </span>

          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-[11px] font-bold font-mono">
              {filteredCategories.length} CATÉGORIES • {filteredSpecialists.length} ARTISTES
            </span>
            <Menu className="w-4 h-4 text-slate-700 dark:text-gray-300" />
          </div>
        </div>

      </div>

      {/* VUE DE PROFIL ARTISTE STRICTEMENT CONFORME À PLATEFORME_VIEW_ARTIST_FAN_0.PNG */}
      {selectedArtistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
          <ArtistProfileFanView
            artist={selectedArtistModal}
            posts={posts}
            onBack={() => setSelectedArtistModal(null)}
            onUnlockPost={onUnlockPost}
            onSubscribeArtist={onSubscribeArtist}
            onGoToLives={onGoToLives}
            currentFan={currentFan}
          />
        </div>
      )}

    </div>
  );
}
