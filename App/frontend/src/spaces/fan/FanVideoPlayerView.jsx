import React, { useState, useMemo } from 'react';
import { 
  Play, Pause, ArrowLeft, Calendar, Clock, Sparkles, Lock, 
  Check, Heart, Share2, Film, Video, Tv, Plus, Search, 
  ChevronDown, X, ShieldCheck, MoreHorizontal, MessageSquare,
  Gift, Sliders, Volume2, Maximize, CheckCircle2
} from 'lucide-react';
import { apiSendTip } from '../../api';

export default function FanVideoPlayerView({
  posts = [],
  artists = [],
  selectedArtistId = null,
  onClearArtistFilter,
  onUnlockPost,
  onSubscribeArtist,
  onViewArtistProfile,
  currentFan,
  onBackToAllFeed
}) {
  // Vue active entre les 2 écrans de Plateforme_Video_0.png :
  // 'catalog' (Écran 1: Catalogue de vidéos avec cartes horizontales et bouton "Do it now / Regarder")
  // 'player_schedule' (Écran 2: Lecteur vidéo plein format et planning/calendrier de séances)
  const [videoScreenTab, setVideoScreenTab] = useState('catalog');

  // Vidéo en cours de visionnage
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35); // 0 à 100%
  const [likedVideos, setLikedVideos] = useState({});
  const [tipSuccess, setTipSuccess] = useState(null);
  const [scheduleSavedToast, setScheduleSavedToast] = useState(null);

  // Recherche rapide
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filtre de catégorie de vidéo
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('ALL'); // ALL | clip | concert

  // État du planning / calendrier (Écran 2)
  const [selectedMonth, setSelectedMonth] = useState('Décembre 2026');
  const [calendarSlots, setCalendarSlots] = useState([
    { day: '15', weekday: 'Dim.', start: '12:00', end: '15:00', active: true, color: 'coral' },
    { day: '16', weekday: 'Mar.', start: '00:00', end: '00:00', active: false, color: 'gray' },
    { day: '17', weekday: 'Mer.', start: '12:00', end: '12:00', active: true, color: 'coral' },
    { day: '18', weekday: 'Jeu.', start: '18:00', end: '20:00', active: false, color: 'gray' },
    { day: '19', weekday: 'Ven.', start: '21:00', end: '23:00', active: true, color: 'coral' },
  ]);

  // 1. Base de données des vidéos et masterclasses exclusives des artistes
  const allVideos = useMemo(() => {
    const baseCuratedVideos = [
      {
        id: 'vid-didib-masterclass',
        title: "Masterclass Flow, Écriture & Business Musical",
        subtitle: "Session intensive sur la construction d'une carrière indépendante",
        artist_name: "Didi B",
        artist_id: "artist-didib",
        artist_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        category: "Masterclass",
        type: "masterclass",
        thumbnail_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        duration: "02h 15m",
        resolution: "4K UHD",
        views: "48.2k",
        likes: "15.4k",
        visibility: "ppv",
        price_cfa: 5000,
        chapters: ["1. Structure métrique du Rap Ivoire", "2. Enregistrement punchline", "3. Contrats & Droits d'auteur"]
      },
      {
        id: 'vid-josey-vocale',
        title: "Secrets de Technique Vocale & Respiration en Studio",
        subtitle: "Échauffement, placement de voix et interprétation émotionnelle",
        artist_name: "Josey",
        artist_id: "artist-josey",
        artist_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        category: "Masterclass",
        type: "masterclass",
        thumbnail_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        duration: "45 min",
        resolution: "1080p HD",
        views: "36.8k",
        likes: "12.1k",
        visibility: "subscribers",
        price_cfa: 0,
        chapters: ["1. Respiration diaphragmatique", "2. Soutien vocal", "3. Maîtrise des vibes"]
      },
      {
        id: 'vid-didib-teaser',
        title: "Teaser Officiel & Making-Of — 'Before History'",
        subtitle: "Immersion exclusive dans le processus créatif de l'album",
        artist_name: "Didi B",
        artist_id: "artist-didib",
        artist_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        category: "Clip",
        type: "clip",
        thumbnail_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        duration: "06 min",
        resolution: "4K UHD",
        views: "89.0k",
        likes: "24.5k",
        visibility: "free",
        price_cfa: 0,
        chapters: ["1. Teaser vidéo", "2. Interview coulisses"]
      },
      {
        id: 'vid-suspect-lab',
        title: "Composition d'un Banger Rap de A à Z au Lab",
        subtitle: "Choix des samples 808, arrangement et mixage direct",
        artist_name: "Suspect 95",
        artist_id: "artist-suspect95",
        artist_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400",
        category: "Masterclass",
        type: "masterclass",
        thumbnail_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
        duration: "01h 10m",
        resolution: "1080p HD",
        views: "42.0k",
        likes: "16.8k",
        visibility: "free",
        price_cfa: 0,
        chapters: ["1. Création de la mélodie", "2. Batterie 808", "3. Enregistrement freestyle"]
      },
      {
        id: 'vid-roseline-backstage',
        title: "Répétition Générale & Coulisses de Loges — Tournée 2026",
        subtitle: "Ce que les caméras n'ont pas montré avant l'entrée en scène",
        artist_name: "Roseline Layo",
        artist_id: "artist-roseline",
        artist_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        category: "Coulisses",
        type: "backstage",
        thumbnail_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
        duration: "52 min",
        resolution: "1080p HD",
        views: "55.4k",
        likes: "19.3k",
        visibility: "subscribers",
        price_cfa: 0,
        chapters: ["1. Raccord orchestre", "2. Loges et stylisme", "3. Entrée triomphale"]
      },
      {
        id: 'vid-fally-tokooos',
        title: "Concert Live Intégral — Stade des Martyrs",
        subtitle: "Performance légendaire devant 60 000 spectateurs en fusion",
        artist_name: "Fally Ipupa",
        artist_id: "artist-fally",
        artist_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        category: "Concert",
        type: "concert",
        thumbnail_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
        duration: "01h 45m",
        resolution: "4K UHD",
        views: "112.0k",
        likes: "38.9k",
        visibility: "ppv",
        price_cfa: 1500,
        chapters: ["1. Intro symphonique", "2. Mayday live", "3. Final Tokooos"]
      },
      {
        id: 'vid-burna-wembley',
        title: "Live Stadium Experience — World Tour 4K",
        subtitle: "Direction artistique, cuivres en direct et arrangements inédits",
        artist_name: "Burna Boy",
        artist_id: "artist-burnaboy",
        artist_avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
        category: "Concert",
        type: "concert",
        thumbnail_url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
        duration: "01h 20m",
        resolution: "4K UHD",
        views: "145.0k",
        likes: "52.0k",
        visibility: "free",
        price_cfa: 0,
        chapters: ["1. Entrée explosive", "2. City Boys live", "3. Répétition cuivres"]
      }
    ];

    // Intégrer également les posts de type 'video' provenant de la base réelle
    const realVideoPosts = (posts || [])
      .filter(p => p.content_type?.toLowerCase() === 'video')
      .map(p => ({
        id: `post-${p.id}`,
        title: p.title || "Vidéo Exclusif",
        subtitle: p.caption || "Contenu vidéo exclusif CDAR",
        artist_name: p.artist_name || "Artiste Officiel",
        artist_id: p.artist_id,
        artist_avatar: p.artist_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        category: p.title?.toLowerCase().includes('masterclass') ? 'Masterclass' : 'Clip',
        type: p.title?.toLowerCase().includes('masterclass') ? 'masterclass' : 'clip',
        thumbnail_url: p.media_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        duration: "18 min",
        resolution: "1080p HD",
        views: "22.0k",
        likes: "8.5k",
        visibility: p.visibility || "free",
        price_cfa: p.price_cfa || 0,
        post_obj: p,
        chapters: ["1. Présentation", "2. Performance", "3. Conclusion"]
      }));

    // Éviter les doublons de titre
    const combined = [...realVideoPosts];
    baseCuratedVideos.forEach(cur => {
      if (!combined.some(c => c.title.toLowerCase() === cur.title.toLowerCase())) {
        combined.push(cur);
      }
    });

    return combined;
  }, [posts]);

  // 2. Filtrage dynamique selon l'artiste sélectionné, la catégorie et la recherche
  const filteredVideos = useMemo(() => {
    return allVideos.filter(vid => {
      // Filtre par artiste sélectionné
      if (selectedArtistId && vid.artist_id !== selectedArtistId) {
        return false;
      }

      // Filtre par type
      if (videoCategoryFilter === 'clip' && vid.type !== 'clip') return false;
      if (videoCategoryFilter === 'concert' && vid.type !== 'concert') return false;

      // Recherche texte
      if (videoSearchQuery.trim()) {
        const q = videoSearchQuery.toLowerCase();
        return (
          vid.title.toLowerCase().includes(q) ||
          vid.subtitle?.toLowerCase().includes(q) ||
          vid.artist_name.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allVideos, selectedArtistId, videoCategoryFilter, videoSearchQuery]);

  const currentVideo = filteredVideos[selectedVideoIndex] || filteredVideos[0] || allVideos[0];
  const isCurrentLiked = likedVideos[currentVideo?.id];

  const handleOpenVideoInPlayer = (vid, idx) => {
    const targetIdx = filteredVideos.findIndex(v => v.id === vid.id);
    setSelectedVideoIndex(targetIdx >= 0 ? targetIdx : idx);
    setIsVideoPlaying(true);
    setVideoScreenTab('player_schedule');
  };

  const handleToggleLike = (vidId) => {
    setLikedVideos(prev => ({
      ...prev,
      [vidId]: !prev[vidId]
    }));
  };

  const handleQuickTip = async (artistId) => {
    try {
      await apiSendTip({
        artist_id: artistId,
        amount_cfa: 1000,
        payment_method: 'orange_money'
      });
      setTipSuccess("✨ Pourboire de 1 000 F CFA envoyé avec succès à l'artiste !");
      setTimeout(() => setTipSuccess(null), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleSlot = (index) => {
    setCalendarSlots(prev => prev.map((slot, i) => {
      if (i === index) {
        return {
          ...slot,
          active: !slot.active,
          color: !slot.active ? 'coral' : 'gray'
        };
      }
      return slot;
    }));
  };

  const handleSaveSchedule = () => {
    setScheduleSavedToast(`📅 Planning enregistré pour "${currentVideo?.title}" ! Rappels programmés.`);
    setTimeout(() => setScheduleSavedToast(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">

      {/* Toast Notification Pourboire */}
      {tipSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce border border-emerald-400/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{tipSuccess}</span>
        </div>
      )}

      {/* Toast Notification Planning Enregistré */}
      {scheduleSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce border border-rose-400/40">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{scheduleSavedToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CADRE GLOBAL MOBILE INSPIRÉ DE PLATEFORME_VIDEO_0.PNG                     */}
      {/* ========================================================================= */}
      <div className="bg-[#FAFBFD] dark:bg-[#0D0D14] rounded-[44px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-colors relative">
        
        {/* ========================================================================= */}
        {/* ÉCRAN 1 : CATALOGUE DE VIDÉOS, MASTERCLASSES & BOUTONS "DO IT NOW"        */}
        {/* ========================================================================= */}
        {videoScreenTab === 'catalog' && (
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Header supérieur avec greeting utilisateur & icônes (Plateforme_Video_0.png) */}
            <div className="flex items-center justify-between pt-1">
              {/* Bouton retour vers le flux ou menu */}
              <div className="flex items-center gap-3">
                {onBackToAllFeed ? (
                  <button
                    onClick={onBackToAllFeed}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-rose-500 shadow-sm transition-transform active:scale-95"
                    title="Retour au fil complet"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-gray-300">
                    <Film className="w-5 h-5 text-rose-500" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                    Hello, {currentFan?.display_name || currentFan?.name || 'Abonné'}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src={currentFan?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                      alt="Fan Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>

              {/* Bouton pour basculer vers le lecteur/planning */}
              <button
                onClick={() => setVideoScreenTab('player_schedule')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF4D6D] text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Lecteur & Planning</span>
              </button>
            </div>

            {/* Titre Display immersif (Plateforme_Video_0.png) */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {selectedArtistId 
                  ? `Vidéos & Masterclass • ${artists.find(a => a.id === selectedArtistId)?.stage_name || 'Artiste'}` 
                  : 'Vidéos & Masterclass Exclusives'
                }
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                Clips 4K, secrets de studio, cours intensifs et captations de concerts
              </p>
            </div>

            {/* Barre d'action avec bouton d'ajout / filtre "+ Create your own exercise" (Plateforme_Video_0) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-600 dark:text-gray-400">
                Explorer les séances vidéo
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-9 h-9 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-300 shadow-sm hover:border-slate-800"
                  title="Rechercher une vidéo"
                >
                  <Search className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setVideoScreenTab('player_schedule')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <span>Planifier une séance</span>
                  <div className="w-6 h-6 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Barre de recherche dépliable */}
            {isSearchOpen && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre (Flow, Studio, Palais...), artiste..."
                  className="w-full bg-white dark:bg-[#161622] border border-slate-300 dark:border-white/15 rounded-full px-5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-inner"
                />
                {videoSearchQuery && (
                  <button
                    onClick={() => setVideoSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Filtres de catégorie de vidéo en capsules */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: 'ALL', label: 'Toutes les Vidéos' },
                { id: 'clip', label: '🎬 Clips 4K' },
                { id: 'concert', label: '🎤 Concerts Live' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setVideoCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                    videoCategoryFilter === cat.id
                      ? 'bg-[#FF4D6D] text-white shadow-sm font-black'
                      : 'bg-white dark:bg-[#161622] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-rose-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ========================================================================= */}
            {/* LISTE DES CARTES HORIZONTALES AVEC BOUTON "DO IT NOW" (Plateforme_Video_0) */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-1">
              {filteredVideos.map((vid, idx) => (
                <div
                  key={vid.id || idx}
                  className="rounded-[28px] bg-white dark:bg-[#161622] border border-slate-200/90 dark:border-white/10 p-3 sm:p-4 shadow-[0_10px_25px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-lg transition-all flex flex-col sm:flex-row items-center gap-4 group"
                >
                  {/* Miniature vidéo arrondie à gauche (Plateforme_Video_0) */}
                  <div 
                    onClick={() => handleOpenVideoInPlayer(vid, idx)}
                    className="relative w-full sm:w-44 h-36 sm:h-32 rounded-[22px] overflow-hidden flex-shrink-0 cursor-pointer shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
                  >
                    <img 
                      src={vid.thumbnail_url} 
                      alt={vid.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />

                    {/* Badge Durée & Résolution */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md">
                        {vid.resolution}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-md">
                        {vid.duration}
                      </span>
                    </div>

                    {/* Bouton play flottant */}
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Détails de la vidéo & Bouton "Do it now" à droite (Plateforme_Video_0) */}
                  <div className="flex-1 w-full flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D6D]">
                          {vid.category} • {vid.artist_name}
                        </span>

                        {vid.visibility !== 'free' ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            {vid.visibility === 'ppv' ? `PPV (${vid.price_cfa} F)` : 'VIP Exclusif'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            ✓ Gratuit
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-1">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">
                        {vid.subtitle}
                      </p>
                    </div>

                    {/* Rangée d'action : Bouton "Do it now / Regarder" */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {vid.views} vues • {vid.likes} kifs
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLike(vid.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${likedVideos[vid.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Bouton emblématique rose/corail "Do it now" de Plateforme_Video_0.png */}
                        <button
                          onClick={() => handleOpenVideoInPlayer(vid, idx)}
                          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#FF4D6D] to-[#FF758F] text-white font-black text-xs shadow-[0_6px_20px_rgba(255,77,109,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <span>Do it now</span>
                          <Play className="w-3 h-3 fill-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉCRAN 2 : LECTEUR VIDÉO AVEC BOUTON PLAY CORAIL & CALENDRIER/AGENDA       */}
        {/* ========================================================================= */}
        {videoScreenTab === 'player_schedule' && (
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Header supérieur Écran 2 avec bouton retour circulaire */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setVideoScreenTab('catalog')}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-rose-500 shadow-sm transition-transform active:scale-95"
                title="Retour au catalogue vidéos"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickTip(currentVideo?.artist_id || 'artist-didib')}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm"
                  title="Envoyer un pourboire à l'artiste"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tip 1 000 F</span>
                </button>

                <button
                  onClick={() => setVideoScreenTab('catalog')}
                  className="text-xs font-bold text-[#FF4D6D] hover:underline"
                >
                  Catalogue
                </button>
              </div>
            </div>

            {/* Titre & Instructions Écran 2 (Plateforme_Video_0.png) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D6D]">
                {currentVideo?.artist_name} • {currentVideo?.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentVideo?.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                Follow this instruction below • Session intensive {currentVideo?.duration} ({currentVideo?.resolution})
              </p>
            </div>

            {/* ========================================================================= */}
            {/* LECTEUR VIDÉO AVEC BOUTON PLAY CENTRAL CORAIL (Plateforme_Video_0.png)     */}
            {/* ========================================================================= */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-2 border-white dark:border-white/10 aspect-video bg-black flex items-center justify-center group select-none">
              <img 
                src={currentVideo?.thumbnail_url} 
                alt={currentVideo?.title} 
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isVideoPlaying ? 'scale-105 opacity-90' : 'opacity-80'
                }`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Bouton Play Central Corail Iconique (Plateforme_Video_0) */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <button
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#FF4D6D] to-[#FF758F] text-white flex items-center justify-center shadow-[0_10px_35px_rgba(255,77,109,0.55)] hover:scale-105 active:scale-95 transition-all"
                  title={isVideoPlaying ? "Mettre en pause" : "Lancer la vidéo"}
                >
                  {isVideoPlaying ? (
                    <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
                  ) : (
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
                  )}
                </button>
                <span className="text-[11px] font-black uppercase text-white/90 drop-shadow tracking-wider">
                  {isVideoPlaying ? "Lecture en cours" : "Démarrer la séance"}
                </span>
              </div>

              {/* Barre de contrôle basse du lecteur */}
              <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                    {currentVideo?.duration}
                  </span>
                  <span className="text-[10px] text-white/80 font-bold">
                    {currentVideo?.resolution}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleLike(currentVideo?.id)}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md"
                  >
                    <Heart className={`w-4 h-4 ${isCurrentLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>
                  <button 
                    onClick={() => alert("Passage en plein écran")}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chapitres & Contenu de la séance */}
            {currentVideo?.chapters && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">
                  Programme de la masterclass
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentVideo.chapters.map((chap, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs text-slate-800 dark:text-gray-200 font-bold flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="truncate">{chap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SECTION "SET YOUR WORKOUT CALENDAR" (Reproduction Plateforme_Video_0.png)  */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Set your workout calendar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                    Planifiez vos créneaux de visionnage et alertes
                  </p>
                </div>

                {/* Sélecteur de mois dropdown */}
                <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-gray-300 bg-white dark:bg-[#161622] px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer">
                  <span>{selectedMonth}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-rose-500" />
                </div>
              </div>

              {/* Colonnes interactives des jours (Reproduction exacte Plateforme_Video_0) */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
                {calendarSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleSlot(idx)}
                    className="flex flex-col items-center gap-2 cursor-pointer select-none"
                  >
                    {/* Header Jour : ex: "15 | Sun." */}
                    <div className={`w-full py-2 px-1 rounded-2xl text-center text-xs font-bold transition-all ${
                      slot.active
                        ? 'bg-[#4B3B8A] text-white shadow-sm'
                        : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-gray-400'
                    }`}>
                      <span className="font-black">{slot.day}</span>
                      <span className="opacity-80 ml-1 text-[10px]">{slot.weekday}</span>
                    </div>

                    {/* Heure Début (Start) */}
                    <span className="text-[10px] text-slate-400 font-medium -mb-1">
                      Start
                    </span>
                    <div className={`w-full py-2 px-1 rounded-2xl flex items-center justify-center gap-1 text-xs font-bold transition-all ${
                      slot.active
                        ? 'bg-[#FF4D6D] text-white shadow-sm'
                        : 'bg-slate-200/70 dark:bg-white/5 text-slate-400 dark:text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px] font-mono">{slot.start}</span>
                    </div>

                    {/* Heure Fin (End) */}
                    <span className="text-[10px] text-slate-400 font-medium -mb-1">
                      End
                    </span>
                    <div className={`w-full py-2 px-1 rounded-2xl flex items-center justify-center gap-1 text-xs font-bold transition-all ${
                      slot.active
                        ? 'bg-[#FF4D6D] text-white shadow-sm'
                        : 'bg-slate-200/70 dark:bg-white/5 text-slate-400 dark:text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px] font-mono">{slot.end}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton d'action "Save" (Plateforme_Video_0.png) */}
              <div className="pt-2">
                <button
                  onClick={handleSaveSchedule}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4D6D] via-[#FF5571] to-[#FF758F] text-white font-black text-sm shadow-[0_8px_25px_rgba(255,77,109,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Save</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

