'use client';

import { useEffect } from 'react';
import { X, Mic2 } from 'lucide-react';
import './LyricsModal.css';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  lyrics?: string;
  coverUrl?: string;
}

export default function LyricsModal({ isOpen, onClose, title, artist, lyrics, coverUrl }: LyricsModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lyrics-overlay" onClick={onClose}>
      <div className="lyrics-modal glass" onClick={(e) => e.stopPropagation()}>
        
        {/* Background blur image */}
        {coverUrl && (
          <div
            className="lyrics-bg"
            style={{ backgroundImage: `url(${coverUrl})` }}
          />
        )}

        {/* Header */}
        <div className="lyrics-header">
          <div className="lyrics-track-info">
            <div className="lyrics-cover">
              {coverUrl ? (
                <img src={coverUrl} alt={title} />
              ) : (
                <div className="lyrics-cover-placeholder">
                  <Mic2 size={20} />
                </div>
              )}
            </div>
            <div>
              <h3 className="lyrics-title">{title}</h3>
              <p className="lyrics-artist">{artist}</p>
            </div>
          </div>
          <button className="lyrics-close-btn" onClick={onClose} aria-label="Close lyrics">
            <X size={20} />
          </button>
        </div>

        {/* Lyrics Body */}
        <div className="lyrics-body">
          {lyrics ? (
            <pre className="lyrics-text">{lyrics}</pre>
          ) : (
            <div className="lyrics-empty">
              <Mic2 size={40} className="lyrics-empty-icon" />
              <p>Lirik tidak tersedia untuk lagu ini.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
