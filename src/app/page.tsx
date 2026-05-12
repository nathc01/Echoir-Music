'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, TrendingUp, Music, Trash2, X, AlertTriangle } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import './Dashboard.css';

const featuredArtists = [
  { id: 1, name: 'Lizzy McAlpine', genre: 'Indie Folk', followers: '2.1M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg' },
  { id: 2, name: 'Daniel Caesar', genre: 'R&B / Neo-Soul', followers: '5.4M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg' },
  { id: 3, name: 'NIKI', genre: 'Indie Pop', followers: '3.2M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg' },
];

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Dashboard() {
  const { playTrack } = usePlayer();
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<any[]>([]);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const detectedRef = useRef<Set<string>>(new Set());

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  useEffect(() => {
    fetchTracks();
  }, []);

  // Client-side duration detection for tracks without stored duration
  useEffect(() => {
    tracks.forEach(track => {
      if (track.duration || detectedRef.current.has(track.id)) return;
      detectedRef.current.add(track.id);

      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = track.audioUrl;
      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDurations(prev => ({ ...prev, [track.id]: audio.duration }));
        }
        audio.src = '';
      });
      audio.addEventListener('error', () => {
        audio.src = '';
      });
    });
  }, [tracks]);

  const fetchTracks = async () => {
    try {
      const dbRes = await fetch('/api/tracks');
      const dbData = await dbRes.json();
      if (dbData.success) {
        // Tag setiap track sebagai fromDB agar tombol delete hanya muncul untuk track DB
        setTracks(dbData.tracks.map((t: any) => ({ ...t, fromDB: true })));
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tracks/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTracks(prev => prev.filter(t => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert('Gagal menghapus lagu: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus lagu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlayTop50 = () => {
    if (tracks.length > 0) {
      const queueTracks = tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.musicianName || t.artist?.name || 'Unknown Artist',
        audioUrl: t.audioUrl,
        coverUrl: t.coverUrl,
        lyrics: t.lyrics,
      }));
      playTrack(queueTracks[0], queueTracks);
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="delete-modal-overlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="delete-modal glass" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <AlertTriangle size={32} color="#f59e0b" />
            </div>
            <h3 className="delete-modal-title">Hapus Lagu?</h3>
            <p className="delete-modal-desc">
              Apakah kamu yakin ingin menghapus <strong>&quot;{deleteTarget.title}&quot;</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="delete-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                <X size={16} /> Batal
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section glass">
        <div className="hero-overlay"></div>
        <div className="hero-bg"></div>
        <div className="hero-content">
          <span className="hero-badge">Talent Spotlight</span>
          <h1 className="hero-title">Discover the Undiscovered.</h1>
          <p className="hero-subtitle">
            Dive into the fresh sounds of independent artists pushing the boundaries of music.
          </p>
          <div className="hero-actions">
            <button className="btn-primary flex items-center" onClick={handlePlayTop50}>
              <Play fill="currentColor" size={18} style={{ marginRight: '8px' }} />
              Play Top 50
            </button>
            <button className="btn-outline">Explore Labels</button>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        
        {/* Left Column: Trending Tracks */}
        <div className="main-col">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp className="icon-cyan" /> 
              Trending This Week
            </h2>
            <button className="see-all-btn">See All</button>
          </div>
          
          <div className="track-list">
            {tracks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎵</div>
                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Belum ada lagu yang tersedia.</p>
                <p style={{ fontSize: '0.85rem' }}>Upload lagu pertamamu lewat menu <strong style={{ color: 'var(--accent-primary)' }}>Upload</strong>.</p>
              </div>
            ) : (
              tracks.map((track, i) => {
                const displayDuration = track.duration
                  ? formatDuration(track.duration)
                  : durations[track.id]
                    ? formatDuration(durations[track.id])
                    : '—';

                return (
                  <div 
                    key={track.id} 
                    className="track-item"
                    onClick={() => playTrack({
                      id: track.id,
                      title: track.title,
                      artist: track.musicianName || track.artist?.name || 'Unknown Artist',
                      audioUrl: track.audioUrl,
                      coverUrl: track.coverUrl,
                      lyrics: track.lyrics,
                    }, tracks.map(t => ({
                      id: t.id,
                      title: t.title,
                      artist: t.musicianName || t.artist?.name || 'Unknown',
                      audioUrl: t.audioUrl,
                      coverUrl: t.coverUrl,
                      lyrics: t.lyrics,
                    })))}
                  >
                    <div className="track-index-box">
                      <span className="track-index">{i + 1}</span>
                      <Play size={16} fill="currentColor" className="track-play-icon" />
                    </div>
                    <div className="track-cover-sm">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="cover-img" />
                      ) : (
                        <div className="cover-placeholder"><Music size={16} /></div>
                      )}
                    </div>
                    <div className="track-info">
                      <h4 className="track-name">{track.title}</h4>
                      <p className="track-artist-name">{track.musicianName || track.artist?.name || 'Unknown Artist'}</p>
                    </div>
                    <div className="track-time">
                      {displayDuration}
                    </div>
                    {/* Delete button — hanya untuk track dari DB dan user ADMIN */}
                    {isAdmin && track.fromDB && (
                      <button
                        className="track-delete-btn"
                        title="Hapus lagu"
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteTarget({ id: track.id, title: track.title });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Featured Artists */}
        <div className="side-col">
          <div className="section-header">
            <h2 className="section-title">
              <Music className="icon-violet" /> 
              Rising Artists
            </h2>
          </div>
          
          <div className="artist-list">
            {featuredArtists.map((artist) => (
              <Link href={`/artist/${encodeURIComponent(artist.name)}`} key={artist.id}>
                <div className="artist-card glass">
                  <div className="artist-avatar">
                    {artist.avatarUrl && <img src={artist.avatarUrl} alt={artist.name} className="artist-img" />}
                  </div>
                  <div className="artist-info">
                    <h4 className="artist-name">{artist.name}</h4>
                    <div className="artist-meta">
                      <span className="artist-genre">{artist.genre}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
