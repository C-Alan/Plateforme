import React from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, 
  Disc, Sparkles, Heart, Maximize2 
} from 'lucide-react';
import { useAudioPlayer } from './AudioPlayerContext';

export default function GlobalMiniAudioPlayer({ onOpenFullPlayer }) {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    handleNext, 
    handlePrevious, 
    currentTime, 
    duration, 
    seekTo,
    isMuted,
    toggleMute,
    volume,
    setAudioVolume,
    closeMiniPlayer
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-16 md:bottom-4 left-2 right-2 sm:left-4 sm:right-4 md:left-auto md:right-6 md:w-[460px] z-50 animate-in slide-in-from-bottom duration-300">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950/95 dark:bg-[#12111E]/95 backdrop-blur-xl border border-orange-500/40 text-white p-3 shadow-2xl shadow-orange-500/20">
        
        {/* Ligne de progression supérieure cliquable */}
        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            seekTo(clickPos * 100);
          }}
          className="absolute top-0 left-0 right-0 h-1 bg-white/10 hover:h-1.5 cursor-pointer transition-all group"
        >
          <div 
            className="h-full bg-gradient-to-r from-[#FF5500] via-[#FF7A00] to-yellow-400 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-md"></div>
          </div>
        </div>

        {/* Contenu principal du mini player */}
        <div className="flex items-center justify-between gap-3 pt-1">
          
          {/* 1. Pochette & Métadonnées Piste */}
          <div 
            onClick={onOpenFullPlayer} 
            className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
            title="Cliquer pour afficher le grand lecteur"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/20 shadow-md">
              <img 
                src={currentTrack.cover_url || currentTrack.media_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200"} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : ''}`}
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <Disc className={`w-4 h-4 text-white/80 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                  {currentTrack.title || "Titre musical"}
                </h4>
                {currentTrack.is_exclusive && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate">
                {currentTrack.artist_name || "Artiste CDAR"}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration || currentTrack.duration_seconds || 220)}</span>
              </div>
            </div>
          </div>

          {/* 2. Commandes de manipulation (Previous, Play/Pause, Next) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handlePrevious}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              title="Morceau précédent"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5500] to-[#FFAA00] hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transition-transform"
              title={isPlaying ? "Mettre en pause" : "Reprendre la lecture"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              title="Morceau suivant"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* 3. Bouton volume & Fermer */}
          <div className="flex items-center gap-1 flex-shrink-0 pl-1 border-l border-white/10">
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={closeMiniPlayer}
              className="w-7 h-7 rounded-full hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-gray-400 transition-colors"
              title="Fermer le lecteur"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
