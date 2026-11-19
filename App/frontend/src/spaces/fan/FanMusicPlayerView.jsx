import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Heart, Music, Disc, 
  Volume2, Sparkles, Lock, ArrowLeft, Search, MoreHorizontal, 
  Share2, Gift, ShieldCheck, Check, Radio, Flame, Star, ListMusic,
  Sliders, User, CornerDownRight, X
} from 'lucide-react';
import { apiSendTip } from '../../api';
import { useAudioPlayer } from './AudioPlayerContext';

export default function FanMusicPlayerView({ 
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
  // 1. Vue active parmi les 3 écrans de Plateforme_Music_0.jpg :
  // 'discovery' (Écran 1: New Release vinyl carousel, Previews & Most Played)
  // 'queue' (Écran 2: Now Playing hero card, Next sound queue & Recommended)
  // 'vinyl_player' (Écran 3: Grand lecteur vinyle orbital concentrique & playlist)
  const [musicScreenTab, setMusicScreenTab] = useState('discovery');

  // Sous-filtre de genre / style (comme dans l'Écran 1 de Plateforme_Music_0.jpg)
  const [subGenreFilter, setSubGenreFilter] = useState('ALL'); // ALL | exclusive | acoustic | rap | afrobeat

  // Recherche rapide locale
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Intégration du lecteur audio global persistant
  const { 
    currentTrack: globalCurrentTrack, 
    isPlaying: isGlobalPlaying, 
    playTrack: globalPlayTrack, 
    togglePlay: globalTogglePlay, 
    handleNext: globalHandleNext, 
    handlePrevious: globalHandlePrevious,
    currentTime: globalCurrentTime,
    duration: globalDuration,
    seekTo: globalSeekTo
  } = useAudioPlayer();

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [likedTracks, setLikedTracks] = useState({});
  const [tipSuccess, setTipSuccess] = useState(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // 2. Base de données des pistes musicales des artistes (fusionnant les posts réels et morceaux phares)
  const allTracks = useMemo(() => {
    // Morceaux de référence haute-fidélité pour la scène musicale
    const baseCuratedTracks = [
      {
        id: 'track-didib-01',
        title: "Before History — Prémices",
        artist_name: "Didi B",
        artist_id: "artist-didib",
        artist_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        category: "Afro-Rap",
        cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
        duration: "03:45",
        duration_seconds: 225,
        loves: "14.2k",
        played: "89.5k",
        visibility: "subscribers",
        is_exclusive: true,
        is_acoustic: false,
        price_cfa: 0,
        audio_preview_url: "https://cdn.cdar.ci/audio/didib-before-history.mp3"
      },
      {
        id: 'track-josey-01',
        title: "Tout Laisse (Acoustic Unplugged)",
        artist_name: "Josey",
        artist_id: "artist-josey",
        artist_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        category: "Afro-Soul",
        cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        duration: "04:12",
        duration_seconds: 252,
        loves: "22.8k",
        played: "124.0k",
        visibility: "free",
        is_exclusive: false,
        is_acoustic: true,
        price_cfa: 0,
        audio_preview_url: "https://cdn.cdar.ci/audio/josey-tout-laisse.mp3"
      },
      {
        id: 'track-suspect-01',
        title: "Société Suspecte (Lab Beatmaking)",
        artist_name: "Suspect 95",
        artist_id: "artist-suspect95",
        artist_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400",
        category: "Rap Ivoire",
        cover_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        duration: "03:18",
        duration_seconds: 198,
        loves: "18.5k",
        played: "95.2k",
        visibility: "free",
        is_exclusive: false,
        is_acoustic: false,
        price_cfa: 0,
        audio_preview_url: "https://cdn.cdar.ci/audio/suspect95-societe.mp3"
      },
      {
        id: 'track-roseline-01',
        title: "Mogo Fariman (Session Guitare Live)",
        artist_name: "Roseline Layo",
        artist_id: "artist-roseline",
        artist_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        category: "Variété Afro",
        cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
        duration: "04:50",
        duration_seconds: 290,
        loves: "31.4k",
        played: "165.8k",
        visibility: "free",
        is_exclusive: false,
        is_acoustic: true,
        price_cfa: 0,
        audio_preview_url: "https://cdn.cdar.ci/audio/roseline-mogo-fariman.mp3"
      },
      {
        id: 'track-fally-01',
        title: "Mayday (Stade Live VIP Master)",
        artist_name: "Fally Ipupa",
        artist_id: "artist-fally",
        artist_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        category: "Rumba / Tokooos",
        cover_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        duration: "05:05",
        duration_seconds: 305,
        loves: "45.1k",
        played: "241.0k",
        visibility: "ppv",
        is_exclusive: true,
        is_acoustic: false,
        price_cfa: 1000,
        audio_preview_url: "https://cdn.cdar.ci/audio/fally-mayday.mp3"
      },
      {
        id: 'track-wizkid-01',
        title: "Essence (Afrobeat Night Session)",
        artist_name: "Wizkid",
        artist_id: "artist-wizkid",
        artist_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400",
        category: "Afrobeat",
        cover_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800",
        duration: "03:55",
        duration_seconds: 235,
        loves: "58.0k",
        played: "310.4k",
        visibility: "subscribers",
        is_exclusive: true,
        is_acoustic: false,
        price_cfa: 0,
        audio_preview_url: "https://cdn.cdar.ci/audio/wizkid-essence.mp3"
      },
      {
        id: 'track-burna-01',
        title: "City Boys (London Soundcheck Master)",
        artist_name: "Burna Boy",
        artist_id: "artist-burnaboy",
        artist_avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
        category: "Afro-Fusion",
        cover_url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
        duration: "03:32",
        duration_seconds: 212,
        loves: "64.2k",
        played: "420.0k",
        visibility: "free",
        is_exclusive: false,
        is_acoustic: false,
        price_cfa: 0,
        audio_preview_url: "https://cdn.cdar.ci/audio/burna-cityboys.mp3"
      }
    ];

    // Intégrer également les posts réels de type 'music' provenant du backend
    const realMusicPosts = (posts || [])
      .filter(p => p.content_type?.toLowerCase() === 'music')
      .map(p => ({
        id: `post-${p.id}`,
        title: p.title || "Titre Inédit",
        artist_name: p.artist_name || "Artiste",
        artist_id: p.artist_id,
        artist_avatar: p.artist_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        category: p.artist_category || "Musique",
        cover_url: p.media_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
        duration: "03:40",
        duration_seconds: 220,
        loves: "15.0k",
        played: "62.0k",
        visibility: p.visibility || "free",
        is_exclusive: p.visibility !== 'free',
        is_acoustic: p.title?.toLowerCase().includes('acoustique') || false,
        price_cfa: p.price_cfa || 0,
        post_obj: p
      }));

    // Fusionner en évitant les doublons de titre
    const combined = [...realMusicPosts];
    baseCuratedTracks.forEach(cur => {
      if (!combined.some(c => c.title.toLowerCase() === cur.title.toLowerCase())) {
        combined.push(cur);
      }
    });

    return combined;
  }, [posts]);

  // 3. Filtrage dynamique selon l'artiste sélectionné et le genre
  const filteredTracks = useMemo(() => {
    return allTracks.filter(track => {
      // Filtre par artiste sélectionné
      if (selectedArtistId && track.artist_id !== selectedArtistId) {
        return false;
      }

      // Filtre par sous-catégorie
      if (subGenreFilter === 'exclusive' && !track.is_exclusive) return false;
      if (subGenreFilter === 'acoustic' && !track.is_acoustic) return false;
      if (subGenreFilter === 'rap' && !track.category?.toLowerCase().includes('rap')) return false;
      if (subGenreFilter === 'afrobeat' && !track.category?.toLowerCase().includes('afro')) return false;

      // Recherche texte
      if (musicSearchQuery.trim()) {
        const q = musicSearchQuery.toLowerCase();
        return (
          track.title.toLowerCase().includes(q) ||
          track.artist_name.toLowerCase().includes(q) ||
          track.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allTracks, selectedArtistId, subGenreFilter, musicSearchQuery]);

  const activeTrack = globalCurrentTrack || filteredTracks[currentTrackIndex] || filteredTracks[0] || allTracks[0];
  const isPlaying = isGlobalPlaying;
  const currentTrack = activeTrack;

  // Calcul du pourcentage de lecture
  const playbackProgress = globalDuration > 0 ? (globalCurrentTime / globalDuration) * 100 : 28;

  const togglePlay = () => {
    if (!globalCurrentTrack) {
      globalPlayTrack(activeTrack, filteredTracks);
    } else {
      globalTogglePlay();
    }
  };

  const handleSelectTrack = (track) => {
    const idx = filteredTracks.findIndex(t => t.id === track.id);
    if (idx >= 0) {
      setCurrentTrackIndex(idx);
    }
    globalPlayTrack(track, filteredTracks);
  };

  const handleNextTrack = () => {
    if (globalCurrentTrack) {
      globalHandleNext();
    } else {
      if (filteredTracks.length === 0) return;
      const nextIdx = (currentTrackIndex + 1) % filteredTracks.length;
      setCurrentTrackIndex(nextIdx);
      globalPlayTrack(filteredTracks[nextIdx], filteredTracks);
    }
  };

  const handlePrevTrack = () => {
    if (globalCurrentTrack) {
      globalHandlePrevious();
    } else {
      if (filteredTracks.length === 0) return;
      const prevIdx = (currentTrackIndex - 1 + filteredTracks.length) % filteredTracks.length;
      setCurrentTrackIndex(prevIdx);
      globalPlayTrack(filteredTracks[prevIdx], filteredTracks);
    }
  };

  const toggleLikeTrack = (trackId) => {
    setLikedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
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
      setIsTipModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Calcul des coordonnées du bouton indicateur sur l'orbite du vinyle (pour Screen 1 & Screen 3)
  const calculateScrubberCoords = (progressPercent, radiusPercent = 46) => {
    const angleRad = (progressPercent * 3.6 - 90) * (Math.PI / 180);
    const x = 50 + radiusPercent * Math.cos(angleRad);
    const y = 50 + radiusPercent * Math.sin(angleRad);
    return { x, y };
  };

  const scrubberCoords = calculateScrubberCoords(playbackProgress, 46);

  // Formatage du temps écoulé (ex: 01:45 / 03:45)
  const currentSeconds = Math.floor(((currentTrack?.duration_seconds || 220) * playbackProgress) / 100);
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCurrentLiked = likedTracks[currentTrack?.id];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">

      {/* Toast Notification Pourboire */}
      {tipSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 animate-bounce border border-emerald-400/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{tipSuccess}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CADRE GLOBAL MOBILE INSPIRÉ DE PLATEFORME_MUSIC_0.JPG                     */}
      {/* ========================================================================= */}
      <div className="bg-[#FAFBFD] dark:bg-[#0D0D14] rounded-[44px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-colors relative">
        
        {/* TOP BAR / EN-TÊTE ÉLÉGANT AVEC PROFIL, PILLS & MODES (Plateforme_Music_0) */}
        <div className="p-5 sm:p-7 pb-3 border-b border-slate-200/80 dark:border-white/10 space-y-4">
          
          <div className="flex items-center justify-between">
            {/* Profil utilisateur / Artiste & bouton retour */}
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
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img 
                    src={currentFan?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                    alt="Fan Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedArtistId 
                      ? `Musique • ${artists.find(a => a.id === selectedArtistId)?.stage_name || 'Artiste'}` 
                      : 'La Scène Musicale'
                    }
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
                  {filteredTracks.length} titres exclusifs disponibles
                </p>
              </div>
            </div>

            {/* Actions Droite : Recherche & Bouton options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  isSearchOpen
                    ? 'bg-rose-500 text-white border-rose-500 shadow-glow-orange'
                    : 'bg-white dark:bg-[#161622] border-slate-200 dark:border-white/15 text-slate-700 dark:text-gray-300 hover:border-slate-800 dark:hover:border-white shadow-sm'
                }`}
                title="Rechercher un son ou un artiste"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsTipModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-gray-300 hover:text-amber-500 shadow-sm transition-all"
                title="Pourboire à l'artiste en cours"
              >
                <Gift className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </div>

          {/* Barre de recherche dépliable */}
          {isSearchOpen && (
            <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                value={musicSearchQuery}
                onChange={(e) => setMusicSearchQuery(e.target.value)}
                placeholder="Rechercher par titre (Before History, Tout Laisse...), artiste..."
                className="w-full bg-white dark:bg-[#161622] border border-slate-300 dark:border-white/15 rounded-full px-5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-inner"
              />
              {musicSearchQuery && (
                <button
                  onClick={() => setMusicSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-gray-400 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* SÉLECTEUR DES 3 ÉCRANS DU DESIGN (Plateforme_Music_0.jpg) */}
          <div className="flex bg-slate-200/70 dark:bg-[#141420] p-1 rounded-2xl border border-slate-300/60 dark:border-white/10 shadow-inner">
            <button
              onClick={() => setMusicScreenTab('discovery')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                musicScreenTab === 'discovery'
                  ? 'bg-gradient-to-r from-[#FF4D6D] to-[#FF758F] text-white font-black shadow-md'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span className="truncate">Nouveautés (1)</span>
            </button>

            <button
              onClick={() => setMusicScreenTab('queue')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                musicScreenTab === 'queue'
                  ? 'bg-gradient-to-r from-[#FF4D6D] to-[#FF758F] text-white font-black shadow-md'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span className="truncate">File d'Écoute (2)</span>
            </button>

            <button
              onClick={() => setMusicScreenTab('vinyl_player')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                musicScreenTab === 'vinyl_player'
                  ? 'bg-gradient-to-r from-[#FF4D6D] to-[#FF758F] text-white font-black shadow-md'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span className="truncate">Grand Vinyle (3)</span>
            </button>
          </div>

          {/* Pill Toggle Style Écran 1 (Instrumental / Nature Sound -> Exclusif / Acoustique) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 font-mono flex items-center gap-1 mr-1">
              <Sliders className="w-3 h-3 text-slate-500" />
              Style :
            </span>

            {[
              { id: 'ALL', label: 'Tous les Titres' },
              { id: 'exclusive', label: '💎 Exclusivités VIP' },
              { id: 'acoustic', label: '🎙️ Acoustique & Live' },
              { id: 'rap', label: '⚡ Rap & Drill' },
              { id: 'afrobeat', label: '🌴 Afrobeat & Soul' }
            ].map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSubGenreFilter(genre.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                  subGenreFilter === genre.id
                    ? 'bg-[#FF4D6D] text-white shadow-sm font-black'
                    : 'bg-white dark:bg-[#161622] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-rose-400'
                }`}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ÉCRAN 1 : NEW RELEASE VINYL CAROUSEL, PREVIEW & MOST PLAYED               */}
        {/* ========================================================================= */}
        {musicScreenTab === 'discovery' && (
          <div className="p-5 sm:p-7 space-y-7">
            
            {/* 1.1 SECTION "NEW RELEASE" AVEC VINYLE TOURNANT ET ORBITE COLORÉE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    New Release
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                    Sorties récentes et pépites en avant-première
                  </p>
                </div>
                <button 
                  onClick={() => setMusicScreenTab('queue')}
                  className="text-xs font-bold text-[#FF4D6D] hover:underline"
                >
                  View all
                </button>
              </div>

              {/* CAROUSEL DU VINYLE CENTRAL (Reproduction exacte Écran 1) */}
              <div className="relative py-4 flex items-center justify-center overflow-hidden">
                
                {/* Disque Vinyle Précédent (Peeking gauche) */}
                <div 
                  onClick={handlePrevTrack}
                  className="hidden sm:block absolute left-2 w-32 h-32 rounded-full overflow-hidden opacity-35 hover:opacity-75 transition-opacity cursor-pointer transform -translate-x-12 scale-90 border-2 border-white shadow-lg"
                >
                  <img 
                    src={filteredTracks[(currentTrackIndex - 1 + filteredTracks.length) % filteredTracks.length]?.cover_url} 
                    alt="Previous Track" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* DISQUE VINYLE CENTRAL AVEC ORBITE CIRCULAIRE ET POINT ROUGE */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                  
                  {/* SVG Orbite radiale de progression (Anneau extérieur) */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="92" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      className="text-slate-200 dark:text-white/10" 
                    />
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="92" 
                      fill="none" 
                      stroke="url(#screen1CoralGrad)" 
                      strokeWidth="5" 
                      strokeDasharray={2 * Math.PI * 92}
                      strokeDashoffset={2 * Math.PI * 92 * (1 - playbackProgress / 100)}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="screen1CoralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF4D6D" />
                        <stop offset="100%" stopColor="#FF85A1" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Scrubber Knob (Point corail/rose positionné sur l'anneau) */}
                  <div 
                    className="absolute w-4 h-4 rounded-full bg-[#FF4D6D] border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 pointer-events-none"
                    style={{
                      left: `${scrubberCoords.x}%`,
                      top: `${scrubberCoords.y}%`
                    }}
                  />

                  {/* Le Disque Vinyle Rotatif */}
                  <div 
                    className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform duration-500 cursor-pointer ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '18s' }}
                    onClick={togglePlay}
                  >
                    <img 
                      src={currentTrack?.cover_url} 
                      alt={currentTrack?.title} 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Sillons du vinyle */}
                    <div className="absolute inset-0 rounded-full border border-black/20" />
                    <div className="absolute inset-4 rounded-full border border-black/15" />
                    <div className="absolute inset-8 rounded-full border border-black/15" />

                    {/* Trou Spindle central blanc (signature vinyle Plateforme_Music_0) */}
                    <div className="absolute inset-0 m-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border-2 border-slate-100 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>

                {/* Disque Vinyle Suivant (Peeking droite) */}
                <div 
                  onClick={handleNextTrack}
                  className="hidden sm:block absolute right-2 w-32 h-32 rounded-full overflow-hidden opacity-35 hover:opacity-75 transition-opacity cursor-pointer transform translate-x-12 scale-90 border-2 border-white shadow-lg"
                >
                  <img 
                    src={filteredTracks[(currentTrackIndex + 1) % filteredTracks.length]?.cover_url} 
                    alt="Next Track" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              </div>

              {/* Titre & Contrôles sous le Vinyle (Plateforme_Music_0) */}
              <div className="flex items-center justify-between pt-1 px-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400">
                    {currentTrack?.artist_name}
                  </p>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate max-w-[220px]">
                    {currentTrack?.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Bouton Play/Pause Corail Circulaire */}
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF4D6D] to-[#FF758F] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(255,77,109,0.4)] hover:scale-105 active:scale-95 transition-all"
                    title={isPlaying ? "Mettre en pause" : "Écouter"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setMusicScreenTab('vinyl_player')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-slate-900 shadow-sm"
                    title="Ouvrir le grand lecteur"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 1.2 SECTION "PREVIEW" (Extraits carrés avec bouton play) */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Preview
                </h3>
                <span className="text-xs font-bold text-[#FF4D6D]">Extraits audio</span>
              </div>

              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {filteredTracks.map((trk, idx) => {
                  const isCurrent = trk.id === currentTrack.id;
                  return (
                    <div 
                      key={trk.id || idx}
                      onClick={() => handleSelectTrack(trk)}
                      className="group cursor-pointer flex-shrink-0 w-28 sm:w-32 space-y-2 select-none"
                    >
                      <div className="relative aspect-square rounded-[22px] overflow-hidden border-2 border-white dark:border-white/10 shadow-md group-hover:shadow-xl transition-all">
                        <img 
                          src={trk.cover_url} 
                          alt={trk.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />

                        {/* Bouton Play givré au centre */}
                        <div className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="px-1 space-y-0.5">
                        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold block truncate">
                          {trk.category || trk.artist_name}
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {trk.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1.3 SECTION "MOST PLAYED" (Les plus écoutés) */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Most played
                </h3>
                <span className="text-xs font-bold text-[#FF4D6D]">Top Écoutes</span>
              </div>

              <div className="space-y-2.5">
                {filteredTracks.slice(0, 4).map((trk) => (
                  <div
                    key={trk.id}
                    onClick={() => handleSelectTrack(trk)}
                    className="p-3 rounded-2xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                        <img src={trk.cover_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {trk.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                          {trk.artist_name} • {trk.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#FF4D6D] bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/40">
                        ❤️ {trk.loves}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉCRAN 2 : NOW PLAYING HERO CARD, NEXT SOUND QUEUE & RECOMMENDED           */}
        {/* ========================================================================= */}
        {musicScreenTab === 'queue' && (
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* 2.1 HERO CARD DU TITRE EN COURS (Reproduction Écran 2) */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/20 min-h-[300px] flex flex-col justify-between p-5 sm:p-6 bg-[#161622] text-white">
              <img 
                src={currentTrack?.cover_url} 
                alt={currentTrack?.title} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

              {/* Contrôles de lecture en superposition haute */}
              <div className="relative z-10 flex items-center justify-center gap-8 pt-4">
                <button 
                  onClick={handlePrevTrack}
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-transform active:scale-90"
                >
                  <SkipBack className="w-5 h-5 fill-white" />
                </button>

                <button 
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF4D6D] to-[#FF758F] flex items-center justify-center text-white shadow-lg shadow-rose-500/40 transition-transform active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  )}
                </button>

                <button 
                  onClick={handleNextTrack}
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-transform active:scale-90"
                >
                  <SkipForward className="w-5 h-5 fill-white" />
                </button>
              </div>

              {/* Métadonnées & Scrubber en superposition basse */}
              <div className="relative z-10 space-y-3 pt-6">
                <div>
                  <p className="text-xs font-bold text-rose-300">
                    {currentTrack?.artist_name}
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-white drop-shadow">
                    {currentTrack?.title}
                  </h3>
                </div>

                {/* Badge Likes & Écoutes */}
                <div className="flex items-center justify-between text-xs text-white/90">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span className="font-bold">{currentTrack?.loves} likes • {currentTrack?.played} écoutes</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-300">
                    {formatTime(currentSeconds)}
                  </span>
                </div>

                {/* Scrubber bar horizontal */}
                <div 
                  className="relative w-full h-2 bg-white/25 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                    setPlaybackProgress(newProgress);
                  }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF4D6D] to-[#FFAA00] rounded-full transition-all duration-150"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2.2 SECTION "NEXT SOUND" (File d'attente détaillée) */}
            <div className="space-y-3 pt-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Next sound
              </h3>

              <div className="space-y-2.5">
                {filteredTracks.map((trk, idx) => (
                  <div
                    key={trk.id}
                    onClick={() => handleSelectTrack(trk)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      trk.id === currentTrack.id
                        ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50 shadow-sm'
                        : 'bg-white dark:bg-[#161622] border-slate-200 dark:border-white/10 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                        <img src={trk.cover_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          {trk.id === currentTrack.id && isPlaying ? (
                            <Pause className="w-4 h-4 text-white fill-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
                          {trk.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {trk.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400">
                          {trk.duration} • {trk.loves} kifs • {trk.played} écoutes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeTrack(trk.id);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${likedTracks[trk.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewArtistProfile) {
                            const artObj = artists.find(a => a.id === trk.artist_id) || { stage_name: trk.artist_name };
                            onViewArtistProfile(artObj);
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
                        title="Voir l'artiste"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2.3 SECTION "RECOMMENDED" */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Recommended
              </h3>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-rose-500/10 to-amber-500/10 border border-purple-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold uppercase">Recommandation VIP</span>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">Session Acoustique Abidjan Night</h5>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">10k loves • 50k played</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTipModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs shadow-sm flex-shrink-0"
                >
                  Soutenir 🎁
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉCRAN 3 : GRAND LECTEUR VINYLE CONCENTRIQUE & PLAYLIST (Plateforme_Music_0) */}
        {/* ========================================================================= */}
        {musicScreenTab === 'vinyl_player' && (
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Header spécifique Écran 3 */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black tracking-widest text-[#FF4D6D] uppercase">
                Lecteur Haute Fidélité
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                My playlist name
              </h3>
            </div>

            {/* GRAND VINYLE CONCENTRIQUE (Reproduction exacte Écran 3) */}
            <div className="relative py-6 flex items-center justify-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                
                {/* Anneau interne subtil */}
                <div className="absolute inset-3 rounded-full border border-slate-200 dark:border-white/10 pointer-events-none" />

                {/* SVG Orbite concentrique avec progression rose/corail */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="92" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    className="text-slate-200 dark:text-white/10" 
                  />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="92" 
                    fill="none" 
                    stroke="url(#screen3CoralGrad)" 
                    strokeWidth="5.5" 
                    strokeDasharray={2 * Math.PI * 92}
                    strokeDashoffset={2 * Math.PI * 92 * (1 - playbackProgress / 100)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="screen3CoralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4D6D" />
                      <stop offset="50%" stopColor="#FF758F" />
                      <stop offset="100%" stopColor="#FFAA00" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Scrubber Knob (Point corail interactif sur l'orbite) */}
                <div 
                  className="absolute w-4 h-4 rounded-full bg-[#FF4D6D] border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 pointer-events-none"
                  style={{
                    left: `${scrubberCoords.x}%`,
                    top: `${scrubberCoords.y}%`
                  }}
                />

                {/* Le Grand Disque Vinyle Rotatif */}
                <div 
                  className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform duration-500 cursor-pointer ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '20s' }}
                  onClick={togglePlay}
                >
                  <img 
                    src={currentTrack?.cover_url} 
                    alt={currentTrack?.title} 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Effet sillons vinyle */}
                  <div className="absolute inset-0 rounded-full border border-black/25" />
                  <div className="absolute inset-6 rounded-full border border-black/15" />
                  <div className="absolute inset-12 rounded-full border border-black/15" />

                  {/* Trou central Spindle blanc */}
                  <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white shadow-xl border-2 border-slate-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-800" />
                  </div>
                </div>

              </div>
            </div>

            {/* Time code central (ex: 15:30) */}
            <div className="text-center">
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-gray-400">
                {formatTime(currentSeconds)} / {currentTrack?.duration || "03:45"}
              </span>
            </div>

            {/* GRANDS CONTRÔLES DE LECTURE (Reproduction exacte Écran 3) */}
            <div className="flex items-center justify-center gap-7 pt-1">
              <button 
                onClick={handlePrevTrack}
                className="w-12 h-12 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 flex items-center justify-center text-rose-500 hover:scale-105 active:scale-90 shadow-sm transition-all"
                title="Titre précédent"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF4D6D] to-[#FF758F] flex items-center justify-center text-white shadow-lg shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-white" />
                ) : (
                  <Play className="w-7 h-7 fill-white ml-0.5" />
                )}
              </button>

              <button 
                onClick={handleNextTrack}
                className="w-12 h-12 rounded-full bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 flex items-center justify-center text-rose-500 hover:scale-105 active:scale-90 shadow-sm transition-all"
                title="Titre suivant"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Métadonnées du titre en bas */}
            <div className="text-center space-y-1 pt-2">
              <p className="text-xs font-bold text-slate-500 dark:text-gray-400">
                {currentTrack?.artist_name}
              </p>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentTrack?.title}
              </h4>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => toggleLikeTrack(currentTrack.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    isCurrentLiked
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white dark:bg-[#161622] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isCurrentLiked ? 'fill-white' : 'text-rose-500'}`} />
                  <span>{currentTrack?.loves} loves • {currentTrack?.played} played</span>
                </button>
              </div>
            </div>

            {/* Liste "Sound name" en bas (Reproduction Écran 3) */}
            <div className="space-y-2 pt-4 border-t border-slate-200/80 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-500 dark:text-gray-400 tracking-wider">
                  Sound name
                </h4>
                <span className="text-[10px] font-bold text-[#FF4D6D]">Playlist CDAR</span>
              </div>

              {filteredTracks.slice(0, 3).map((trk) => (
                <div
                  key={trk.id}
                  onClick={() => handleSelectTrack(trk)}
                  className="flex items-center justify-between py-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl px-2 transition-colors"
                >
                  <span className="font-bold text-slate-800 dark:text-gray-200 truncate max-w-[200px]">
                    {trk.title}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">{trk.duration}</span>
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* MODALE POURBOIRE MOBILE MONEY RAPIDE */}
      {isTipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161622] rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Pourboire Mobile Money
                </h4>
              </div>
              <button onClick={() => setIsTipModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-300">
              Soutenez directement <strong className="text-rose-500">{currentTrack?.artist_name}</strong> pour ce morceau via Orange Money, Wave ou MTN.
            </p>

            <button
              onClick={() => handleQuickTip(currentTrack?.artist_id || 'artist-didib')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs shadow-glow-orange hover:opacity-95 active:scale-95 transition-all"
            >
              Envoyer 1 000 F CFA
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

