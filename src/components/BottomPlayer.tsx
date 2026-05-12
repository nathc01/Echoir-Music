'use client';

import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Mic2, FileText } from 'lucide-react';
import './BottomPlayer.css';
import { usePlayer } from '@/context/PlayerContext';
import { useRef, useState, useEffect } from 'react';
import LyricsModal from './LyricsModal';

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function BottomPlayer() {
  const { currentTrack, isPlaying, progress, duration, volume, togglePlayPause, seek, setVolumeLevel, skipNext, skipPrevious, toggleShuffle, toggleRepeat, isShuffle, isRepeat } = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = (clickX / rect.width) * 100;
      seek(percentage);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const level = clickX / rect.width;
      setVolumeLevel(level);
    }
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="player-container glass">
      
      {/* Track Info */}
      <div className="player-track-info">
        <div className="track-cover">
          <div className="track-cover-overlay"></div>
          {currentTrack?.coverUrl ? (
             <img src={currentTrack.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Mic2 size={24} className="track-icon" />
          )}
        </div>
        <div className="track-details">
          <h4 className="track-title">{currentTrack?.title || 'No track playing'}</h4>
          <p className="track-artist">{currentTrack?.artist || 'Select a track to play'}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="controls-buttons">
          <button className={`control-btn secondary ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle} style={{ color: isShuffle ? '#8b5cf6' : 'inherit' }}><Shuffle size={18} /></button>
          <button className="control-btn primary" onClick={skipPrevious}><SkipBack size={22} fill="currentColor" /></button>
          <button 
            className="play-btn"
            onClick={togglePlayPause}
            disabled={!mounted || !currentTrack}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="play-icon-offset" />}
          </button>
          <button className="control-btn primary" onClick={skipNext}><SkipForward size={22} fill="currentColor" /></button>
          <button className={`control-btn secondary ${isRepeat ? 'active' : ''}`} onClick={toggleRepeat} style={{ color: isRepeat ? '#8b5cf6' : 'inherit' }}><Repeat size={18} /></button>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <span className="progress-time">{formatTime(progress)}</span>
          <div className="progress-bar-wrapper" ref={progressRef} onClick={handleProgressClick}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
              <div className="progress-bar-handle"></div>
            </div>
          </div>
          <span className="progress-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extras (Volume, etc) */}
      <div className="player-extras">
        <Volume2 size={20} className="volume-icon" />
        <div className="volume-bar-wrapper" ref={volumeRef} onClick={handleVolumeClick}>
          <div className="volume-bar-fill" style={{ width: `${volumePercent}%` }}></div>
        </div>
        <button
          className={`lyrics-toggle-btn ${showLyrics ? 'active' : ''}`}
          onClick={() => setShowLyrics(prev => !prev)}
          title="Tampilkan Lirik"
          disabled={!mounted || !currentTrack}
        >
          <FileText size={18} />
        </button>
      </div>

      <LyricsModal
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        title={currentTrack?.title || ''}
        artist={currentTrack?.artist || ''}
        lyrics={currentTrack?.lyrics}
        coverUrl={currentTrack?.coverUrl}
      />
      
    </div>
  );
}
