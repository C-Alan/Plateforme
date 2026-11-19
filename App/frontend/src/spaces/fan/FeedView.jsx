import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Lock, Play, Pause, Heart, MessageCircle, Gift, Sparkles, Check, 
  Flame, Star, Volume2, ShieldCheck, X, Music, Video, Image, 
  FileText, Radio, Filter, UserCheck, ArrowRight, CornerDownRight,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { apiSendTip, apiGetArtists, apiGetActiveLives } from '../../api';
import FanMusicPlayerView from './FanMusicPlayerView';
import FanVideoPlayerView from './FanVideoPlayerView';

export default function FeedView({ 
  posts = [], 
  onUnlockPost, 
  currentFan, 
  onGoToLives, 
  onSubscribeArtist,
  onGoToVipChat,
  initialContentType = 'ALL',
  initialArtistId = null,
  onViewArtistProfile
}) {
  const [likedPosts, setLikedPosts] = useState({});
  const [tipSuccess, setTipSuccess] = useState(null);

  // Recherche & Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState(initialContentType); // ALL | music | video | image | text | podcast | story
  const [selectedVisibility, setSelectedVisibility] = useState('ALL');   // ALL | free | subscribers | ppv
  const [selectedArtistId, setSelectedArtistId] = useState(initialArtistId);
  const [activeViewTab, setActiveViewTab] = useState('feed');            // 'feed' | 'artists'

  // Maintien de la synchronisation avec les props
  useEffect(() => {
    if (initialContentType) {
      setSelectedContentType(initialContentType);
    }
  }, [initialContentType]);

  useEffect(() => {
    if (initialArtistId !== undefined) {
      setSelectedArtistId(initialArtistId);
    }
  }, [initialArtistId]);

  // Liste des artistes & Lives actifs
  const [artists, setArtists] = useState([]);
  const [activeLives, setActiveLives] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const cardsScrollRef = useRef(null);

  useEffect(() => {
    const fetchArtistsAndLives = async () => {
      setLoadingArtists(true);
      try {
        const [artistsRes, livesRes] = await Promise.allSettled([
          apiGetArtists(),
          apiGetActiveLives()
        ]);
        if (artistsRes.status === 'fulfilled') {
          setArtists(artistsRes.value || []);
        }
        if (livesRes.status === 'fulfilled') {
          setActiveLives(livesRes.value || []);
        }
      } catch (err) {
        console.error("Erreur chargement artistes/lives:", err);
      } finally {
        setLoadingArtists(false);
      }
    };
    fetchArtistsAndLives();
  }, []);

  // Définition des cartes inspirées de Plateforme_Option_0.png (Lives en direct & Stories)
  const cardRotations = ['-rotate-3', 'rotate-1', 'rotate-3', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3'];

  const scrollingCards = useMemo(() => {
    const list = [];

    // 1. Lives en direct en tête de liste
    if (activeLives && activeLives.length > 0) {
      activeLives.forEach((live) => {
        const matchedArtist = artists.find(a => a.id === live.artist_id || a.stage_name === live.artist_name);
        list.push({
          id: `live-${live.id}`,
          type: 'live',
          isLive: true,
          artistName: live.artist_name || 'Artiste en direct',
          title: live.title || 'Session Live Exclusive',
          image: matchedArtist?.avatar_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
          viewers: live.current_viewers || 142,
          artist: matchedArtist,
          liveId: live.id
        });
      });
    }

    // 2. Stories et coulisses exclusives des artistes
    const baseStories = [
      {
        name: 'Didi B',
        title: 'Répétition Concert Événement 🔥',
        caption: "Derniers réglages avec l'orchestre avant le show au Palais de la Culture d'Abidjan ! Soyez prêts la conspiration 💥",
        timeAgo: 'Il y a 35 min',
        soundTrack: 'Didi B - Yeye (Live Session)',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80',
        live: !activeLives.some(l => l.artist_name?.toLowerCase().includes('didi')),
        viewers: 384
      },
      {
        name: 'Josey',
        title: 'Session acoustique studio 🎙️',
        caption: 'Enregistrement guitare-voix ce soir... Le titre sortira en avant-première pour les abonnés VIP ce vendredi ✨',
        timeAgo: 'Il y a 1h',
        soundTrack: 'Josey - Tout Laisse (Acoustic Unplugged)',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&q=80',
        live: false,
        viewers: null
      },
      {
        name: 'Suspect 95',
        title: 'Nouveau son en direct du lab ⚡',
        caption: 'Session beatmaking nocturne. Validez-vous ce tempo ? Laissez vos avis les syndiqués 🎹🔥',
        timeAgo: 'Il y a 2h',
        soundTrack: 'Suspect 95 - Société Suspecte',
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&q=80',
        live: false,
        viewers: null
      },
      {
        name: 'Roseline Layo',
        title: 'Coulisses de la tournée 🌟',
        caption: 'Abidjan -> Bouaké ! Merci pour cet accueil de folie ce soir. Rendez-vous demain pour la suite !',
        timeAgo: 'Il y a 3h',
        soundTrack: 'Roseline Layo - Mogo Fariman',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80',
        live: false,
        viewers: null
      },
      {
        name: 'Fally Ipupa',
        title: 'Répétitions Stade Live 🌍',
        caption: 'Les Warriors, la scénographie est prête. 60 000 personnes attendues ce week-end 👑',
        timeAgo: 'Il y a 4h',
        soundTrack: 'Fally Ipupa - Mayday',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=80',
        live: false,
        viewers: null
      },
      {
        name: 'Wizkid',
        title: 'Backstage vibes & teasing 🎵',
        caption: 'Late night studio session cooking pure African magic. Nouveau titre bientôt en exclusivité 🚀',
        timeAgo: 'Il y a 5h',
        soundTrack: 'Wizkid - Essence Live',
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&q=80',
        live: false,
        viewers: null
      },
      {
        name: 'Burna Boy',
        title: 'World Tour Soundcheck 🎚️',
        caption: 'Soundcheck à guichets fermés. Prêts à enflammer la scène européenne ce soir 🔥',
        timeAgo: 'Il y a 6h',
        soundTrack: 'Burna Boy - City Boys',
        image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
        fullMedia: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=900&q=80',
        live: false,
        viewers: null
      }
    ];

    baseStories.forEach((st, idx) => {
      if (!list.some(item => item.artistName.toLowerCase() === st.name.toLowerCase())) {
        const matchedArtist = artists.find(a => 
          a.stage_name?.toLowerCase().includes(st.name.toLowerCase()) || 
          a.display_name?.toLowerCase().includes(st.name.toLowerCase())
        );
        list.push({
          id: `story-${idx}`,
          type: st.live ? 'live' : 'story',
          isLive: st.live,
          artistName: st.name,
          title: st.title,
          caption: st.caption,
          timeAgo: st.timeAgo,
          soundTrack: st.soundTrack,
          image: matchedArtist?.avatar_url || st.image,
          fullMedia: st.fullMedia,
          viewers: st.viewers,
          artist: matchedArtist
        });
      }
    });

    return list;
  }, [activeLives, artists]);

  // Extraction exclusive des stories pour la visionneuse
  const storiesOnly = useMemo(() => {
    return scrollingCards.filter(c => !c.isLive);
  }, [scrollingCards]);

  // États pour la visionneuse de story immersive plein écran
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const currentStory = storiesOnly[activeStoryIndex] || storiesOnly[0];

  // Progression automatique des stories (5 secondes par story)
  useEffect(() => {
    if (!isStoryViewerOpen || storiesOnly.length === 0) {
      setStoryProgress(0);
      return;
    }

    if (isStoryPaused) return;

    const interval = 50;
    const step = 100 / (5000 / interval);

    const timer = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          setActiveStoryIndex(curr => {
            if (curr < storiesOnly.length - 1) {
              return curr + 1;
            } else {
              setIsStoryViewerOpen(false);
              return 0;
            }
          });
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isStoryViewerOpen, isStoryPaused, activeStoryIndex, storiesOnly.length]);

  // Navigation clavier pour la visionneuse
  useEffect(() => {
    if (!isStoryViewerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsStoryViewerOpen(false);
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === 'ArrowRight') handleNextStory();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStoryViewerOpen, storiesOnly.length]);

  const handlePrevStory = () => {
    setStoryProgress(0);
    setActiveStoryIndex(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextStory = () => {
    setStoryProgress(0);
    setActiveStoryIndex(prev => {
      if (prev < storiesOnly.length - 1) {
        return prev + 1;
      }
      setIsStoryViewerOpen(false);
      return 0;
    });
  };

  const handleSendReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFloatingHearts(prev => [...prev, { id, emoji, left: 30 + Math.random() * 40 }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(item => item.id !== id));
    }, 1800);
  };

  const scrollCards = (direction) => {
    if (cardsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      cardsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Clic sur une carte : rejoindre le live ou ouvrir la visionneuse de story
  const handleHeroCardClick = (card) => {
    if (card.isLive) {
      if (onGoToLives) {
        onGoToLives(card.liveId);
      }
    } else {
      // Ouvre immédiatement la visionneuse de story sans aucune recherche
      const foundIdx = storiesOnly.findIndex(s => s.id === card.id || s.artistName === card.artistName);
      setActiveStoryIndex(foundIdx >= 0 ? foundIdx : 0);
      setStoryProgress(0);
      setIsStoryPaused(false);
      setIsStoryViewerOpen(true);
    }
  };

  const toggleLike = (postId) => {
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleQuickTip = async (artistId) => {
    try {
      await apiSendTip({
        artist_id: artistId,
        amount_cfa: 1000,
        payment_method: 'orange_money'
      });
      setTipSuccess(`✨ Pourboire de 1 000 F CFA envoyé avec succès à l'artiste !`);
      setTimeout(() => setTipSuccess(null), 3500);
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtrage combiné côté client pour une réactivité instantanée
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // 1. Filtre par artiste sélectionné
      if (selectedArtistId && post.artist_id !== selectedArtistId) {
        return false;
      }

      // 2. Filtre par type de contenu
      if (selectedContentType !== 'ALL' && post.content_type?.toLowerCase() !== selectedContentType.toLowerCase()) {
        return false;
      }

      // 3. Filtre par type d'accès
      if (selectedVisibility !== 'ALL' && post.visibility?.toLowerCase() !== selectedVisibility.toLowerCase()) {
        return false;
      }

      // 4. Recherche texte multi-champs (Artiste, Titre, Légende, Catégorie)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = post.title?.toLowerCase().includes(q);
        const matchCaption = post.caption?.toLowerCase().includes(q);
        const matchArtist = post.artist_name?.toLowerCase().includes(q);
        const matchCat = post.artist_category?.toLowerCase().includes(q);
        return matchTitle || matchCaption || matchArtist || matchCat;
      }

      return true;
    });
  }, [posts, searchQuery, selectedContentType, selectedVisibility, selectedArtistId]);

  // Filtrage des artistes pour l'annuaire
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return artists;
    const q = searchQuery.trim().toLowerCase();
    return artists.filter(art => 
      art.stage_name?.toLowerCase().includes(q) ||
      art.category?.toLowerCase().includes(q) ||
      art.bio?.toLowerCase().includes(q)
    );
  }, [artists, searchQuery]);

  const selectedArtistObj = useMemo(() => {
    if (!selectedArtistId) return null;
    return artists.find(a => a.id === selectedArtistId) || 
      (posts.find(p => p.artist_id === selectedArtistId) ? { stage_name: posts.find(p => p.artist_id === selectedArtistId).artist_name } : null);
  }, [selectedArtistId, artists, posts]);

  const contentTypes = [
    { id: 'ALL', label: 'Tous', icon: Sparkles },
    { id: 'music', label: 'Musique', icon: Music },
    { id: 'video', label: 'Vidéos', icon: Video },
    { id: 'podcast', label: 'Podcasts', icon: Volume2 },
    { id: 'image', label: 'Photos', icon: Image },
  ];

  const visibilityTypes = [
    { id: 'ALL', label: 'Tout' },
    { id: 'free', label: '✓ Gratuit' },
    { id: 'subscribers', label: '💎 VIP' },
    { id: 'ppv', label: '🎟️ PPV' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      
      {/* Toast Notification Pourboire Lumineuse */}
      {tipSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs font-black px-5 py-3 rounded-full shadow-glow-emerald flex items-center gap-2.5 animate-bounce border border-emerald-400/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{tipSuccess}</span>
        </div>
      )}

      {/* 1. BARRE DE NAVIGATION & FILTRES ERGONOMIQUES */}
      {(selectedContentType === 'music' || selectedContentType === 'video') ? (
        /* En mode Lecteur Musique ou Vidéo : Barre supérieure épurée et immersive */
        <div className="glass-panel rounded-2xl p-3 sm:p-3.5 border border-slate-200 dark:border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-2.5 transition-colors">
          <button
            onClick={() => setSelectedContentType('ALL')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-extrabold text-xs transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-[#FF7A00]" />
            <span>« Retour au fil complet</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedContentType('music')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                selectedContentType === 'music'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow-orange'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Studio Musique</span>
            </button>

            <button
              onClick={() => setSelectedContentType('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                selectedContentType === 'video'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow-orange'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vidéothèque</span>
            </button>
          </div>
        </div>
      ) : (
        /* En mode Fil d'actualité : Barre de commande compacte et fluide */
        <div className="glass-panel rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl space-y-3 transition-colors">
          
          {/* Ligne 1 : Recherche + Switcher Publications / Artistes */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Champ de recherche texte */}
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-amber-500 dark:text-amber-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher artistes, titres, actualités..."
                className="w-full bg-slate-100 dark:bg-[#12121E] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Switcher d'affichage : Publications vs Artistes */}
            <div className="flex bg-slate-100 dark:bg-[#0E0E18] p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner flex-shrink-0">
              <button
                onClick={() => setActiveViewTab('feed')}
                className={`py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
                  activeViewTab === 'feed'
                    ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Publications ({filteredPosts.length})</span>
              </button>

              <button
                onClick={() => setActiveViewTab('artists')}
                className={`py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
                  activeViewTab === 'artists'
                    ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white shadow-glow-orange'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Artistes ({filteredArtists.length})</span>
              </button>
            </div>
          </div>

          {/* Ligne 2 : Type de Contenu & Filtre d'Accès rapide */}
          {activeViewTab === 'feed' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-0.5">
              {/* Chips Catégories de média avec scroll horizontal */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 items-center flex-1">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedContentType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedContentType(type.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow-orange font-black'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Filtre Accès rapide compact */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0 bg-slate-100/70 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
                <Filter className="w-3 h-3 text-slate-400 dark:text-gray-500 ml-1 mr-0.5" />
                {visibilityTypes.map((vis) => (
                  <button
                    key={vis.id}
                    onClick={() => setSelectedVisibility(vis.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      selectedVisibility === vis.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black shadow-sm'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {vis.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Badge Filtre Actif par Artiste */}
          {selectedArtistId && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 dark:border-orange-500/30 text-xs">
              <span className="text-orange-600 dark:text-amber-300 font-bold flex items-center gap-1.5">
                <span>🎤 Filtré sur :</span>
                <strong className="text-slate-900 dark:text-white font-black">{selectedArtistObj?.stage_name || 'Artiste'}</strong>
              </span>
              <button
                onClick={() => setSelectedArtistId(null)}
                className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline ml-2"
              >
                Afficher tous les artistes ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. HERO CARDS DÉFILANTES AVEC EFFET PERSPECTIVE (STYLE PLATEFORME_OPTION_0) */}
      {activeViewTab === 'feed' && !selectedArtistId && selectedContentType === 'ALL' && !searchQuery.trim() && (
        <div 
          className="relative rounded-[28px] overflow-hidden border border-white/20 shadow-2xl min-h-[350px] sm:min-h-[380px] flex flex-col justify-between p-4 sm:p-5 bg-cover bg-center select-none transition-all"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(12, 14, 24, 0.45) 0%, rgba(12, 14, 24, 0.2) 35%, rgba(12, 14, 24, 0.85) 85%), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80')`
          }}
        >
          {/* Titre Serif Iconique (Plateforme_Option_0) */}
          <div className="text-center pt-2 sm:pt-3 z-10 space-y-0.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal tracking-wide drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              A brand New Scene
            </h2>
            <p className="text-xl sm:text-2xl font-serif text-white/95 font-light tracking-wide italic drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">
              Beyond Ordinary
            </p>
          </div>

          {/* Rangée défilante de cartes avec perspective et bordures blanches */}
          <div className="relative z-10 my-auto py-1 group/carousel">
            {/* Boutons de défilement Desktop */}
            <button
              onClick={() => scrollCards('left')}
              className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center border border-white/20 backdrop-blur-md transition-all opacity-0 group-hover/carousel:opacity-100 shadow-xl"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCards('right')}
              className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center border border-white/20 backdrop-blur-md transition-all opacity-0 group-hover/carousel:opacity-100 shadow-xl"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Conteneur de défilement horizontal */}
            <div 
              ref={cardsScrollRef}
              className="flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-4 px-2 items-end snap-x snap-mandatory"
            >
              {scrollingCards.map((card, idx) => {
                const rotationClass = cardRotations[idx % cardRotations.length];
                return (
                  <div
                    key={card.id || idx}
                    onClick={() => handleHeroCardClick(card)}
                    className={`group relative flex-shrink-0 w-28 sm:w-32 h-44 sm:h-50 rounded-[20px] border-[2px] border-white shadow-2xl overflow-hidden cursor-pointer transform ${rotationClass} hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-300 snap-center bg-[#12121E]`}
                  >
                    {/* Image pleine hauteur */}
                    <img 
                      src={card.image} 
                      alt={card.artistName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    
                    {/* Dégradé vignette sombre en bas */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 group-hover:from-black/75 transition-colors" />

                    {/* Badge Haut : LIVE ou STORY */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      {card.isLive ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-lg animate-pulse border border-rose-300/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          LIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white/90 backdrop-blur-md border border-white/20">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          STORY
                        </span>
                      )}

                      {card.viewers && (
                        <span className="text-[8px] font-bold text-white/90 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
                          👥 {card.viewers}
                        </span>
                      )}
                    </div>

                    {/* Bas de carte : Artiste & Description */}
                    <div className="absolute bottom-2 left-2 right-2 text-white pointer-events-none">
                      <p className="text-xs font-black truncate group-hover:text-amber-300 transition-colors drop-shadow">
                        {card.artistName}
                      </p>
                      <p className="text-[10px] text-white/80 line-clamp-1 font-medium leading-tight">
                        {card.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barre flottante Capsule Pill en bas (Plateforme_Option_0) */}
          <div className="relative z-10 flex justify-center pb-1">
            <div className="inline-flex items-center gap-4 sm:gap-6 px-5 sm:px-7 py-2 rounded-full bg-white/95 backdrop-blur-xl shadow-2xl border border-white text-gray-700">
              <button 
                onClick={() => { setSelectedContentType('ALL'); setSelectedArtistId(null); }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-rose-600 transition-colors"
                title="Découvrir tout"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Explorer</span>
              </button>

              <button 
                onClick={() => onGoToLives && onGoToLives()}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:scale-105 transition-transform"
                title="Accéder aux Lives en direct"
              >
                <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span className="font-extrabold">Directs</span>
              </button>

              <button 
                onClick={() => setActiveViewTab('feed')}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-amber-500 transition-colors"
                title="Fil d'actualité"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">À la Une</span>
              </button>

              <button 
                onClick={() => setActiveViewTab('artists')}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-purple-600 transition-colors"
                title="Annuaire Artistes"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Artistes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VUE ANNUAIRE ARTISTES (GRILLE FLUIDE RESPONSIVE) */}
      {activeViewTab === 'artists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Artistes & Créateurs En Vedette ({filteredArtists.length})
            </h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
              Monétisation Directe Mobile Money
            </span>
          </div>

          {filteredArtists.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-2 border border-slate-200 dark:border-white/10">
              <p className="text-slate-700 dark:text-gray-300 text-sm font-bold">Aucun artiste ne correspond à votre recherche "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-orange-500 font-bold hover:underline"
              >
                Effacer la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="glass-panel glass-panel-hover rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl transition-all space-y-3.5 bg-white/80 dark:bg-[#12121E]/80 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div 
                      onClick={() => {
                        if (onViewArtistProfile) {
                          onViewArtistProfile(artist);
                        } else {
                          setSelectedArtistId(artist.id);
                          setActiveViewTab('feed');
                        }
                      }}
                      className="flex items-start space-x-3 cursor-pointer group"
                      title="Voir le profil complet"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-[#FF7A00] to-yellow-400 shadow-md group-hover:scale-105 transition-transform">
                          <img
                            src={artist.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                            alt={artist.stage_name}
                            className="w-full h-full object-cover rounded-[14px]"
                          />
                        </div>
                        {artist.kyc_status === 'verified' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-[#12121E] flex items-center justify-center text-white text-[8px] font-black">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#FF7A00] transition-colors truncate">
                            {artist.stage_name}
                          </h4>
                          {artist.kyc_status === 'verified' && (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                              VÉRIFIÉ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold mt-0.5">
                          {artist.category || "Musique"} • {artist.country || "CI"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {artist.bio || "Découvrez mes exclusivités, titres inédits et masterclass sur CDAR."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Rapides pour cet Artiste */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">
                      {artist.post_count || 4} contenus
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (onViewArtistProfile) {
                            onViewArtistProfile(artist);
                          } else {
                            setSelectedArtistId(artist.id);
                            setActiveViewTab('feed');
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Profil</span>
                        <ArrowRight className="w-3 h-3 text-orange-500" />
                      </button>

                      {onSubscribeArtist && (
                        <button
                          onClick={() => onSubscribeArtist(artist)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF8C00] text-white font-black text-xs shadow-glow-orange hover:brightness-110 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>VIP</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. VUE FLUX PUBLICATIONS (OU LECTEUR MUSICAL / VIDÉO SELON LE FILTRE DE CONTENU) */}
      {activeViewTab === 'feed' && (
        <div className="space-y-6">
          {selectedContentType === 'music' ? (
            <FanMusicPlayerView
              posts={posts}
              artists={artists}
              selectedArtistId={selectedArtistId}
              onClearArtistFilter={() => setSelectedArtistId(null)}
              onUnlockPost={onUnlockPost}
              onSubscribeArtist={onSubscribeArtist}
              onViewArtistProfile={onViewArtistProfile}
              currentFan={currentFan}
              onBackToAllFeed={() => setSelectedContentType('ALL')}
            />
          ) : selectedContentType === 'video' ? (
            <FanVideoPlayerView
              posts={posts}
              artists={artists}
              selectedArtistId={selectedArtistId}
              onClearArtistFilter={() => setSelectedArtistId(null)}
              onUnlockPost={onUnlockPost}
              onSubscribeArtist={onSubscribeArtist}
              onViewArtistProfile={onViewArtistProfile}
              currentFan={currentFan}
              onBackToAllFeed={() => setSelectedContentType('ALL')}
            />
          ) : filteredPosts.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 text-center space-y-3 border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-800 dark:text-gray-200 text-sm font-bold">Aucune publication ne correspond à vos filtres.</p>
              <p className="text-slate-500 dark:text-gray-400 text-xs max-w-sm mx-auto">
                {searchQuery ? `Aucun contenu trouvé pour "${searchQuery}".` : "Modifiez les filtres de type de contenu ou d'accès."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContentType('ALL');
                  setSelectedVisibility('ALL');
                  setSelectedArtistId(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs transition-colors border border-slate-200 dark:border-white/10"
              >
                Réinitialiser tous les filtres
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = likedPosts[post.id];
              const artistName = post.artist_name || "Artiste Officiel";
              const artistCat = post.artist_category || "Musique";
              const artistAvatar = post.artist_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

              return (
                <article key={post.id} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden shadow-md dark:shadow-2xl border border-slate-200 dark:border-white/10 transition-all">
                  
                  {/* Header Artiste (Dynamique & Cliquable) */}
                  <div className="p-4 flex items-center justify-between">
                    <div 
                      onClick={() => {
                        const artObj = artists.find(a => a.id === post.artist_id) || {
                          id: post.artist_id,
                          stage_name: post.artist_name || artistName,
                          category: post.artist_category || artistCat,
                          avatar_url: post.artist_avatar || artistAvatar
                        };
                        if (onViewArtistProfile) {
                          onViewArtistProfile(artObj);
                        } else {
                          setSelectedArtistId(post.artist_id);
                        }
                      }}
                      className="flex items-center space-x-3.5 cursor-pointer group"
                      title={`Voir le profil complet de ${artistName}`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#FFB703] p-0.5 shadow-md shadow-orange-500/20 flex-shrink-0">
                        <img
                          src={artistAvatar}
                          alt={artistName}
                          className="w-full h-full rounded-[14px] object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                            {artistName}
                          </h4>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/30 uppercase tracking-wider flex items-center gap-1">
                            {post.content_type === 'music' && <Music className="w-2.5 h-2.5" />}
                            {post.content_type === 'video' && <Video className="w-2.5 h-2.5" />}
                            {post.content_type === 'image' && <Image className="w-2.5 h-2.5" />}
                            {post.content_type === 'text' && <FileText className="w-2.5 h-2.5" />}
                            <span>{post.content_type}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
                          {artistCat} • {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>

                    {post.visibility !== 'free' ? (
                      <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-glow-amber">
                        <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-300" />
                        {post.visibility === 'ppv' ? `PPV (${post.price_cfa} F)` : 'VIP Exclusif'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ✓ Gratuit
                      </span>
                    )}
                  </div>

                  {/* Titre & Description */}
                  {post.title && (
                    <div className="px-5 pb-3">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">{post.title}</h3>
                      {post.caption && <p className="text-xs text-slate-600 dark:text-gray-300 mt-1 leading-relaxed">{post.caption}</p>}
                    </div>
                  )}

                  {/* Conteneur Média Luminous */}
                  <div className="relative aspect-video w-full bg-[#09090F] overflow-hidden flex items-center justify-center border-y border-white/[0.06]">
                    {post.is_locked ? (
                      // Cadenas Lumineux & Déverrouillage Mobile Money
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#181828]/95 via-[#10101C]/95 to-[#0A0A12]/98 backdrop-blur-md">
                        
                        <div className="relative mb-3">
                          <div className="absolute -inset-3 bg-gradient-to-r from-[#FF5500] to-amber-400 rounded-3xl blur-lg opacity-40 animate-pulse"></div>
                          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF4500] to-[#FFAA00] flex items-center justify-center text-white shadow-xl">
                            <Lock className="w-7 h-7" />
                          </div>
                        </div>

                        <h4 className="text-base font-black text-white tracking-wide">
                          {post.visibility === 'ppv' ? 'Contenu à la Carte (PPV)' : 'Contenu Exclusif Réservé VIP'}
                        </h4>
                        <p className="text-xs text-gray-300/80 max-w-xs mt-1.5 mb-4 leading-relaxed">
                          {post.visibility === 'ppv' 
                            ? `Débloquez ce contenu exclusif à l'unité pour ${post.price_cfa} F CFA via Mobile Money.`
                            : `Rejoignez les abonnés VIP de ${artistName} pour débloquer l'écoute et le visionnage illimités.`}
                        </p>

                        <button
                          onClick={() => onUnlockPost(post)}
                          className="group relative px-6 py-3 rounded-xl font-black text-xs text-white overflow-hidden shadow-glow-orange active:scale-95 transition-all"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500] via-[#FF7A00] to-[#FFB703] group-hover:brightness-110 transition-all"></div>
                          <div className="relative z-10 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
                            <span className="tracking-wide">
                              {post.visibility === 'ppv' ? `Acheter pour ${post.price_cfa} F CFA` : 'Débloquer (Orange / Wave / MTN)'}
                            </span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      // Média Déverrouillé avec Watermark
                      <div className="relative w-full h-full group">
                        {post.content_type === 'video' ? (
                          <div className="w-full h-full bg-black flex items-center justify-center relative cursor-pointer">
                            <img
                              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800"
                              alt="Media Preview"
                              className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#FFAA00] text-white flex items-center justify-center shadow-glow-orange group-hover:scale-110 transition-transform">
                                <Play className="w-7 h-7 fill-white ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : post.content_type === 'music' ? (
                          <div className="w-full h-full bg-gradient-to-br from-[#1C172E] to-[#0E0C18] flex items-center justify-center p-6 text-center relative">
                            <div className="space-y-3">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-glow-purple">
                                <Volume2 className="w-8 h-8 animate-pulse" />
                              </div>
                              <p className="text-sm font-black text-white">Lecture Audio HD</p>
                              <p className="text-xs text-purple-300 font-medium">Flux audio haute fidélité déverrouillé</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={post.media_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"}
                            alt="Unlocked"
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Watermark dynamique anti-piratage élégant */}
                        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-[10px] text-amber-200/90 font-mono px-2.5 py-1 rounded-lg border border-white/10 pointer-events-none shadow-lg">
                          PROTÉGÉ CDAR • ID: {currentFan?.id?.slice(0, 8) || 'FAN-ABONNÉ'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions Lumineux */}
                  <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-[#12121E]/60 transition-colors">
                    <div className="flex items-center space-x-5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                          isLiked ? 'text-rose-500 scale-105' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
                        <span>{isLiked ? 43 : 42}</span>
                      </button>

                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>18</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleQuickTip(post.artist_id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/35 rounded-xl text-xs font-black transition-all shadow-glow-amber active:scale-95"
                    >
                      <Gift className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span>Envoyer 1 000 F (Tip)</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* 5. VISIONNEUSE DE STORY PLEIN ÉCRAN (STYLE INSTAGRAM / TIKTOK) */}
      {isStoryViewerOpen && currentStory && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 select-none"
        >
          {/* Style des animations flottantes de réactions */}
          <style>{`
            @keyframes storyFloatUp {
              0% { transform: translateY(0) scale(0.8); opacity: 1; }
              50% { transform: translateY(-70px) scale(1.3); opacity: 0.95; }
              100% { transform: translateY(-150px) scale(1.5); opacity: 0; }
            }
            .animate-story-float {
              animation: storyFloatUp 1.8s ease-out forwards;
            }
          `}</style>

          <div 
            className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[90vh] sm:max-h-[840px] rounded-none sm:rounded-[36px] overflow-hidden bg-black shadow-2xl flex flex-col justify-between border-0 sm:border-2 sm:border-white/20"
          >
            {/* Barre de progression & Header en haut */}
            <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 sm:pt-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent space-y-2.5">
              {/* Segments de progression */}
              <div className="flex gap-1.5 w-full px-1">
                {storiesOnly.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${storyProgress}%` : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* En-tête Artiste & Contrôles */}
              <div className="flex items-center justify-between text-white px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#FF7A00] to-[#FF0055] shadow-glow-orange flex-shrink-0">
                    <img 
                      src={currentStory.image} 
                      alt={currentStory.artistName}
                      className="w-full h-full rounded-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-white drop-shadow">
                        {currentStory.artistName}
                      </span>
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-300">
                      <span>{currentStory.timeAgo || 'Récent'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Music className="w-2.5 h-2.5 animate-pulse" />
                        <span className="truncate max-w-[130px]">{currentStory.soundTrack || 'Exclusivité CDAR'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsStoryPaused(!isStoryPaused)}
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-colors"
                    title={isStoryPaused ? 'Reprendre' : 'Pause'}
                  >
                    {isStoryPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => setIsStoryViewerOpen(false)}
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-colors"
                    title="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Média de la Story en plein écran */}
            <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={currentStory.fullMedia || currentStory.image} 
                alt={currentStory.title}
                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isStoryPaused ? 'scale-100' : 'scale-105'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/30" />
            </div>

            {/* Zones de navigation tactiles Gauche / Droite */}
            <div 
              className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
              onClick={handlePrevStory}
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
              title="Story précédente"
            />
            <div 
              className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
              onClick={handleNextStory}
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
              title="Story suivante"
            />

            {/* Émojis / Réactions flottantes animées */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {floatingHearts.map(fh => (
                <span
                  key={fh.id}
                  className="absolute bottom-24 text-3xl animate-story-float select-none"
                  style={{ left: `${fh.left}%` }}
                >
                  {fh.emoji}
                </span>
              ))}
            </div>

            {/* Bas de Story : Caption & Actions Interactives */}
            <div className="relative z-30 p-4 sm:p-5 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent">
              {/* Titre & Texte de la Story */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Exclusivité Fans • CDAR</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white drop-shadow">
                  {currentStory.title}
                </h3>
                <p className="text-xs text-gray-200 line-clamp-3 leading-relaxed">
                  {currentStory.caption}
                </p>
              </div>

              {/* Réactions Emojis rapides */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {['🔥', '❤️', '👏', '🎵', '🤩'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-125 backdrop-blur-md flex items-center justify-center text-xl transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Pourboire Rapide Mobile Money & Accès Profil */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    handleQuickTip(currentStory.artist?.id || 'artist-default');
                    handleSendReaction('🎁');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-glow-orange hover:opacity-95 active:scale-95 transition-all"
                >
                  <Gift className="w-4 h-4 text-slate-950" />
                  <span>Pourboire 1 000 F CFA (Tip)</span>
                </button>

                {currentStory.artist && onViewArtistProfile && (
                  <button
                    onClick={() => {
                      setIsStoryViewerOpen(false);
                      onViewArtistProfile(currentStory.artist);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1 backdrop-blur-md border border-white/10 transition-colors"
                    title="Voir le profil de l'artiste"
                  >
                    <span>Profil</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
