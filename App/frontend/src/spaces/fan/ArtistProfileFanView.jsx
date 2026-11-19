import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Share2, Sparkles, ShieldCheck, Play, Lock, Music,
  Video, Radio, MessageCircle, Gift, ChevronDown, ChevronUp,
  Menu, X, Check, Eye, Heart
} from 'lucide-react';
import { useAudioPlayer } from './AudioPlayerContext';

export default function ArtistProfileFanView({
  artist,
  posts = [],
  onBack,
  onUnlockPost,
  onSubscribeArtist,
  onGoToVipChat,
  onGoToLives,
  currentFan
}) {
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'NEW' | 'VIP' | 'PPV'
  const [bioExpanded, setBioExpanded] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(null);
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  if (!artist) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-sm">Aucun profil d'artiste sélectionné.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
        >
          Retour à la découverte
        </button>
      </div>
    );
  }

  // Filtrer les publications de cet artiste
  const artistPosts = useMemo(() => {
    const raw = posts.filter(p =>
      p.artist_id === artist.id ||
      p.artist_id === artist.artist_id ||
      p.artist_name?.toLowerCase() === artist.stage_name?.toLowerCase()
    );

    // Si l'artiste n'a pas encore de posts dans la base, générer les exclusivités de vitrine
    if (raw.length === 0) {
      return [
        {
          id: `${artist.id || 'art'}_post_1`,
          title: 'Session Studio Minuit & Maquette',
          caption: 'Découvrez les premières prises de voix brutes enregistrées en exclusivité.',
          content_type: 'music',
          visibility: 'subscribers',
          media_url: artist.portrait_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
          artist_name: artist.stage_name,
          tag: 'AUDIO'
        },
        {
          id: `${artist.id || 'art'}_post_2`,
          title: 'Teaser & Clip Exclusif 4K',
          caption: 'Avant-première réservée aux membres de la communauté CDAR.',
          content_type: 'video',
          visibility: 'free',
          media_url: artist.portrait_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
          artist_name: artist.stage_name,
          tag: 'VIDÉO'
        },
        {
          id: `${artist.id || 'art'}_post_3`,
          title: 'Coulisses & Balances de Tournée',
          caption: 'Moments intimes avant de monter sur scène.',
          content_type: 'video',
          visibility: 'ppv',
          price_cfa: 2000,
          media_url: artist.portrait_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
          artist_name: artist.stage_name,
          tag: 'BACKSTAGE'
        }
      ];
    }

    return raw;
  }, [posts, artist]);

  // Appliquer le filtre (new, up to / vip, etc.)
  const filteredPosts = useMemo(() => {
    if (filterMode === 'NEW') {
      return [...artistPosts].slice(0, 3);
    }
    if (filterMode === 'VIP') {
      return artistPosts.filter(p => p.visibility === 'subscribers');
    }
    if (filterMode === 'PPV') {
      return artistPosts.filter(p => p.visibility === 'ppv');
    }
    return artistPosts;
  }, [artistPosts, filterMode]);

  // Image Hero de l'artiste (grande carte arrondie)
  const heroImage = artist.hero_image || artist.portrait_url || artist.avatar_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200';

  return (
    <div className="w-full max-w-lg mx-auto pb-28 pt-2 animate-in fade-in duration-300">

      {/* CADRE SMARTPHONE & DESIGN STRICTEMENT CONFORME À PLATEFORME_VIEW_ARTIST_FAN_0.PNG */}
      <div className="bg-[#FAFBFD] dark:bg-[#0D0D14] rounded-[44px] p-5 sm:p-7 border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] space-y-5 transition-colors relative">

        {/* 1. STATUS BAR DE SMARTPHONE (09:40 + DYNAMIC ISLAND + SIGNAUX) */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-bold text-slate-800 dark:text-gray-300 font-mono tracking-tight">
            09:40
          </span>
          <div className="w-24 sm:w-28 h-5 bg-black rounded-full shadow-inner flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-gray-300">
            <span className="text-[10px] font-mono font-bold">5G</span>
            <div className="w-4 h-2 border border-current rounded-sm p-[1px]">
              <div className="w-full h-full bg-current rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* 2. TOP BRANDING BAR (YOUR LOGO & menu —) */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white uppercase font-mono">
              YOUR LOGO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]"></span>
          </div>

          {/* Bouton retour / menu — */}
          <button
            onClick={onBack}
            className="text-[11px] font-bold text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white uppercase tracking-widest font-mono flex items-center gap-1 transition-colors"
          >
            <span>menu —</span>
          </button>
        </div>

        {/* 3. SUBHEADER ACCORDION : COMPOSITION, CARE & ORIGIN */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-2">
          <button
            onClick={() => setBioExpanded(!bioExpanded)}
            className="w-full flex items-center justify-between text-left group"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-gray-300 font-mono group-hover:text-[#FF7A00] transition-colors">
              COMPOSITION, CARE & ORIGIN
            </span>
            {bioExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-gray-400" />
            )}
          </button>

          {/* Bio et infos détaillées lorsque l'accordéon est ouvert */}
          {bioExpanded && (
            <div className="pt-2.5 pb-1 space-y-2 text-xs text-slate-600 dark:text-gray-300 leading-relaxed animate-in fade-in duration-200">
              <p>
                {artist.bio || `Artiste certifié CDAR — Origine Côte d'Ivoire. Tous droits de diffusion réservés.`}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 pt-1">
                <span>CERTIFICATION : {artist.kyc_status === 'verified' ? 'VÉRIFIÉ KYC ✓' : 'CDAR CERTIFIED'}</span>
                <span>•</span>
                <span>ORIGINE : {artist.country || 'CÔTE D\'IVOIRE'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. GRANDE CARTE HERO VISUELLE (EXACTEMENT COMME DANS PLATEFORME_VIEW_ARTIST_FAN_0.PNG) */}
        <div className="relative rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.18)] border border-slate-200/60 dark:border-white/10 bg-slate-950 aspect-[4/3] sm:aspect-[16/11]">
          <img
            src={heroImage}
            alt={artist.stage_name}
            className="w-full h-full object-cover object-center brightness-95 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>

          {/* Badge Vérifié discret en haut à droite */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 flex items-center gap-1.5 text-white text-[10px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">OFFICIAL</span>
          </div>

          {/* Bouton retour tactile flottant sur l'image */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            title="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 5. TITRE ÉDITORIAL & MÉTADONNÉES DE L'ARTISTE */}
        <div className="flex items-start justify-between px-1 pt-1">
          <div className="space-y-0.5">
            {/* Tag Catégorie en haut (ex: HIGH-HEEL -> RAP IVOIRE) */}
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 font-mono">
              {artist.category ? artist.category.toUpperCase() : 'RAP IVOIRE • CRÉATEUR'}
            </p>
            {/* Nom en grand titre gras (ex: Fabric Slingback Shoes -> Didi B) */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tight font-sans leading-tight">
              {artist.stage_name}
            </h1>
          </div>

          {/* Micro-texte technique à droite */}
          <div className="text-right">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-gray-400 block font-mono">
              EXCLUSIVE CONTENT
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
              CDAR VERIFIED • {artistPosts.length} ITEMS
            </span>
          </div>
        </div>

        {/* 6. BARRE D'ACTIONS ET FILTRES PILULES (filters, new, up to, icon) */}
        <div className="flex items-center justify-between gap-2 pt-1 px-1">
          {/* Bouton Pilule Noire "filters" */}
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${filterMode === 'ALL'
              ? 'bg-black dark:bg-[#FF7A00] text-white shadow-glow-orange'
              : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-gray-300'
              }`}
          >
            filters
          </button>

          {/* Pilule Blanche "new" */}
          <button
            onClick={() => setFilterMode(filterMode === 'NEW' ? 'ALL' : 'NEW')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold border transition-all shadow-sm ${filterMode === 'NEW'
              ? 'bg-black text-white border-black'
              : 'bg-white dark:bg-[#161622] text-slate-800 dark:text-gray-300 border-slate-300 dark:border-white/15 hover:border-slate-800'
              }`}
          >
            new
          </button>

          {/* Pilule Blanche "up to" (VIP / PPV) */}
          <button
            onClick={() => setFilterMode(filterMode === 'VIP' ? 'ALL' : 'VIP')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold border transition-all shadow-sm ${filterMode === 'VIP'
              ? 'bg-black text-white border-black'
              : 'bg-white dark:bg-[#161622] text-slate-800 dark:text-gray-300 border-slate-300 dark:border-white/15 hover:border-slate-800'
              }`}
          >
            up to
          </button>

          {/* Bouton Cercle d'action / Partage / Pourboire */}
          <button
            onClick={() => {
              if (onSubscribeArtist) {
                onSubscribeArtist({
                  id: artist.artist_id || artist.id,
                  stage_name: artist.stage_name,
                  min_tier_price_cfa: artist.min_tier_price_cfa || 5000
                });
              }
            }}
            className="w-9 h-9 rounded-full border border-slate-300 dark:border-white/15 bg-white dark:bg-[#161622] flex items-center justify-center text-slate-700 dark:text-gray-300 hover:border-slate-800 dark:hover:border-white shadow-sm flex-shrink-0"
            title="S'abonner VIP"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* 7. CARROUSEL DES PUBLICATIONS (EXACTE DISPOSITION EN CARTES VERTICALES) */}
        {/* Style "Block Heel Shoes", "Flat Clogs Track Soles", "Animal Ballerina..." */}
        <div className="pt-2">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-1 px-1 snap-x scroll-smooth">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 w-full">
                Aucun contenu ne correspond à ce filtre.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isMusic = post.content_type === 'music';
                const isVideo = post.content_type === 'video';
                const isFree = post.visibility === 'free';
                const isPPV = post.visibility === 'ppv';
                const canView = post.can_view !== false;

                const mediaImage = post.teaser_media_url || post.media_url || heroImage;
                const tagLabel = post.tag || (isMusic ? 'AUDIO' : isVideo ? 'VIDÉO' : isFree ? 'GRATUIT' : 'EXCLUSIF');

                return (
                  <div
                    key={post.id}
                    onClick={() => {
                      if (canView) {
                        // Si le post est audio/musique ou a un média, lancer dans le lecteur audio global
                        playTrack({
                          id: post.id,
                          title: post.title,
                          artist_name: artist.stage_name,
                          artist_id: artist.id,
                          cover_url: mediaImage,
                          media_url: post.media_url,
                          audio_preview_url: post.media_url,
                          is_exclusive: !isFree
                        });
                      } else if (!canView && isPPV) {
                        onUnlockPost && onUnlockPost(post);
                      } else if (!canView) {
                        onSubscribeArtist && onSubscribeArtist({
                          id: artist.artist_id || artist.id,
                          stage_name: artist.stage_name,
                          min_tier_price_cfa: artist.min_tier_price_cfa || 5000
                        });
                      }
                    }}
                    className="w-[140px] sm:w-[160px] h-[225px] sm:h-[255px] flex-shrink-0 snap-start relative rounded-[24px] overflow-hidden shadow-md hover:shadow-xl border border-slate-200/60 dark:border-white/10 group cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-slate-900"
                  >
                    {/* Image média plein cadre */}
                    <img
                      src={mediaImage}
                      alt={post.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dégradé sombre inférieur */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>

                    {/* Badge Accès en haut */}
                    {!canView && (
                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/20">
                        <Lock className="w-3 h-3 text-amber-400" />
                      </div>
                    )}

                    {/* Contenu textuel en bas à gauche et icône circulaire en bas à droite */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-1.5">
                      <div className="min-w-0 pr-1 space-y-0.5">
                        <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest font-mono block">
                          {tagLabel}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md">
                          {post.title}
                        </h4>
                      </div>

                      {/* Icône circulaire ( > ) identique au mockup Plateforme_View_Artist_Fan_0.png */}
                      <div className="w-6 h-6 rounded-full border border-white/40 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white flex-shrink-0 group-hover:bg-[#FF7A00] group-hover:border-[#FF7A00] transition-colors">
                        {canView ? (
                          <Play className="w-2.5 h-2.5 fill-white" />
                        ) : (
                          <span className="text-[10px] font-black font-mono leading-none">&gt;</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 8. BANNIÈRE D'ABONNEMENT VIP & MESSAGERIE DIRECTE */}
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-slate-900 to-[#1A1A2E] text-white border border-white/10 flex items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider block">
              COMMUNAUTÉ OFFICIELLE
            </span>
            <p className="text-xs font-black truncate">
              Abonnement VIP à {artist.stage_name}
            </p>
            <p className="text-[10px] text-gray-400">
              Dès {(artist.min_tier_price_cfa || 5000).toLocaleString('fr-FR')} F CFA / mois
            </p>
          </div>

          <button
            onClick={() => {
              if (onSubscribeArtist) {
                onSubscribeArtist({
                  id: artist.artist_id || artist.id,
                  stage_name: artist.stage_name,
                  min_tier_price_cfa: artist.min_tier_price_cfa || 5000
                });
              }
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs shadow-glow-orange flex items-center gap-1.5 flex-shrink-0 hover:scale-105 active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>S'abonner</span>
          </button>
        </div>

        {/* 9. BOTTOM BAR (Catalogue & menu hamburger identiquement à Plateforme_View_Artist_Fan_0.png) */}
        <div className="flex items-center justify-between pt-4 px-2 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onBack}
            className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider font-mono hover:text-[#FF7A00] transition-colors"
          >
            Catalogue
          </button>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 dark:text-gray-300"
          >
            <span className="text-[10px] font-bold font-mono text-gray-400">
              {artistPosts.length} EXCLUSIVITÉS
            </span>
            <Menu className="w-4 h-4 text-slate-700 dark:text-gray-300" />
          </button>
        </div>

      </div>

    </div>
  );
}

