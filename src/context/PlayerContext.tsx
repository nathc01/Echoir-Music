'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  lyrics?: string;
};

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  playTrack: (track: Track, queueList?: Track[]) => void;
  togglePlayPause: () => void;
  seek: (percentage: number) => void;
  setVolumeLevel: (level: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      // Loop single track if repeat is on
      // Or go to next
      setIsPlaying(false);
      setProgress(0);
      handleTrackEnd();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleTrackEnd = () => {
    // Note: React state in event listener might be stale if not careful.
    // So we use a ref or just call skipNext which might need fresh state.
    // Actually, setting up handleEnded inside a useEffect with dependencies is better,
    // but a ref for states is safer. Let's just emit an event or use a state ref.
  };

  // We need an effect that runs when isRepeat/isShuffle/queue changes to bind correct handleEnded
  const stateRef = useRef({ isRepeat, isShuffle, queue, currentIndex });
  useEffect(() => {
    stateRef.current = { isRepeat, isShuffle, queue, currentIndex };
  }, [isRepeat, isShuffle, queue, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => {
      const state = stateRef.current;
      if (state.isRepeat && audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
        setIsPlaying(true);
      } else {
        skipNextRef.current();
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const skipNextRef = useRef<() => void>(() => {});

  const skipNext = () => {
    const state = stateRef.current;
    if (state.queue.length === 0) return;
    
    let nextIndex = state.currentIndex + 1;
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      nextIndex = 0; // Loop back to start queue
      setIsPlaying(false); // Stop playing if reached end, unless you want infinite loop
      // If we want infinite queue loop:
      // setIsPlaying(true);
    }
    
    const nextTrack = state.queue[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack, state.queue);
    }
  };
  
  skipNextRef.current = skipNext;

  const skipPrevious = () => {
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    const state = stateRef.current;
    if (state.queue.length === 0) return;
    
    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) prevIndex = state.queue.length - 1;
    
    const prevTrack = state.queue[prevIndex];
    if (prevTrack) {
      playTrack(prevTrack, state.queue);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(newQueue.findIndex(t => t.id === track.id));
    } else if (queue.length === 0) {
      setQueue([track]);
      setCurrentIndex(0);
    } else {
      // Just playing a track, update index if it's in the queue
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) setCurrentIndex(idx);
    }

    if (!currentTrack || currentTrack.id !== track.id) {
      audioRef.current.pause();
      audioRef.current.src = track.audioUrl;
      setCurrentTrack(track);
      setIsPlaying(true);
      audioRef.current.load();
      audioRef.current.play().catch(e => {
        if (e?.name !== 'AbortError') {
          console.error('Playback failed:', e);
        }
      });
    } else {
      togglePlayPause();
    }
  };

  const togglePlayPause = () => {
    if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (percentage: number) => {
    if (audioRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const setVolumeLevel = (level: number) => {
    setVolume(Math.max(0, Math.min(1, level)));
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        isShuffle,
        isRepeat,
        queue,
        playTrack,
        togglePlayPause,
        seek,
        setVolumeLevel,
        skipNext,
        skipPrevious,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
