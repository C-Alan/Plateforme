import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioPlayerContext = createContext(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};

export function AudioPlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(true);

  // Balise audio HTML5 globale
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      // Passer automatiquement au morceau suivant
      handleNext();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [playlist, currentTrack]);

  // Jouer une piste spécifique
  const playTrack = (track, newPlaylist = null) => {
    if (!track) return;

    if (newPlaylist && Array.isArray(newPlaylist) && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    } else if (playlist.length === 0) {
      setPlaylist([track]);
    }

    setCurrentTrack(track);
    setIsMiniPlayerVisible(true);

    const audio = audioRef.current;
    const mediaSource = track.audio_preview_url || track.media_url;

    if (mediaSource && !mediaSource.startsWith('http') && !mediaSource.startsWith('data:audio') && !mediaSource.startsWith('blob:')) {
      // URL fictive de démo
      audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    } else if (mediaSource) {
      audio.src = mediaSource;
    } else {
      audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn("Audio autoplay blocked or failed, waiting for user gesture:", err);
      setIsPlaying(false);
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.warn);
    }
  };

  const handleNext = () => {
    if (!playlist || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex], playlist);
  };

  const handlePrevious = () => {
    if (!playlist || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex], playlist);
  };

  const seekTo = (percent) => {
    const audio = audioRef.current;
    if (audio.duration && !isNaN(audio.duration)) {
      audio.currentTime = (percent / 100) * audio.duration;
      setCurrentTime(audio.currentTime);
    }
  };

  const setAudioVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      setIsMuted(clamped === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.85;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const closeMiniPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const value = {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isMiniPlayerVisible,
    setIsMiniPlayerVisible,
    playTrack,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setAudioVolume,
    toggleMute,
    closeMiniPlayer
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
export default AudioPlayerContext;
