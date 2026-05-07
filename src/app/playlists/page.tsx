'use client';

import { useState, useEffect } from 'react';
import { ListMusic, Plus, Play, MoreHorizontal, X, Music } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import './Playlists.css';

const defaultPlaylists = [
  { id: 1, name: 'Late Night Drives', tracks: [], type: 'Public', coverColor: 'linear-gradient(to bottom right, #2563eb, #312e81)' },
  { id: 2, name: 'Indie Discoveries', tracks: [], type: 'Private', coverColor: 'linear-gradient(to bottom right, #10b981, #115e59)' },
  { id: 3, name: 'Synthwave Essentials', tracks: [], type: 'Public', coverColor: 'linear-gradient(to bottom right, #c026d3, #581c87)' },
  { id: 4, name: 'Acoustic Chill', tracks: [], type: 'Public', coverColor: 'linear-gradient(to bottom right, #f97316, #7f1d1d)' },
];

export default function Playlists() {
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);

  useEffect(() => {
    // Load tracks from API
    const loadData = async () => {
      try {
        const res = await fetch('/api/tracks');
        const data = await res.json();
        let fetchedTracks = [];
        if (data.success && data.tracks.length > 0) {
          fetchedTracks = data.tracks;
        } else {
          // Fallback to featured
          const fRes = await fetch('/api/featured');
          const fData = await fRes.json();
          if (fData.success) {
            fetchedTracks = fData.tracks.map((t: any) => ({
              id: t.id || Math.random().toString(),
              title: t.title,
              artist: { name: t.artist },
              coverUrl: t.coverUrl,
              audioUrl: t.audioUrl,
              genre: t.genre
            }));
          }
        }
        setAllTracks(fetchedTracks);

        // Prepopulate default playlists with these tracks
        if (fetchedTracks.length > 0) {
          const populated = defaultPlaylists.map(pl => ({
            ...pl,
            tracks: [...fetchedTracks].sort(() => 0.5 - Math.random()).slice(0, Math.max(1, Math.floor(Math.random() * fetchedTracks.length)))
          }));
          setPlaylists(populated);
        } else {
          setPlaylists(defaultPlaylists);
        }
      } catch (e) {
        console.error(e);
        setPlaylists(defaultPlaylists);
      }
    };
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPl = {
      id: Date.now(),
      name: newPlaylistName,
      tracks: allTracks.length > 0 ? [...allTracks].sort(() => 0.5 - Math.random()).slice(0, 3) : [], // auto add some songs for demo
      type: 'Private',
      coverColor: 'linear-gradient(to bottom right, #db2777, #9d174d)'
    };

    setPlaylists([newPl, ...playlists]);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handlePlayPlaylist = (e: React.MouseEvent, pl: any) => {
    e.stopPropagation();
    if (pl.tracks && pl.tracks.length > 0) {
      const queueTracks = pl.tracks.map((t: any) => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name || 'Unknown',
        audioUrl: t.audioUrl,
        coverUrl: t.coverUrl
      }));
      playTrack(queueTracks[0], queueTracks);
    } else {
      alert("This playlist is empty!");
    }
  };

  if (selectedPlaylist) {
    return (
      <div className="playlists-container">
        <div className="playlists-header" style={{ marginBottom: '2rem' }}>
          <div>
            <button className="btn-outline" onClick={() => setSelectedPlaylist(null)} style={{ marginBottom: '1rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>&larr; Back to Playlists</button>
            <h1 className="playlists-title">
              {selectedPlaylist.name}
            </h1>
            <p className="playlists-subtitle">{selectedPlaylist.tracks?.length || 0} tracks • {selectedPlaylist.type}</p>
          </div>
          <button className="btn-primary flex-icon" onClick={(e) => handlePlayPlaylist(e, selectedPlaylist)}>
            <Play size={18} fill="currentColor" /> Play All
          </button>
        </div>

        <div className="track-list">
          {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
            selectedPlaylist.tracks.map((track: any, i: number) => (
              <div 
                key={track.id + '-' + i} 
                className="track-item"
                onClick={() => {
                  const queueTracks = selectedPlaylist.tracks.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    artist: t.artist?.name || 'Unknown',
                    audioUrl: t.audioUrl,
                    coverUrl: t.coverUrl
                  }));
                  playTrack(queueTracks[i], queueTracks);
                }}
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
                  <p className="track-artist-name">{track.artist?.name || 'Unknown'}</p>
                </div>
                <div className="track-time">
                  -
                </div>
              </div>
            ))
          ) : (
            <p className="text-secondary">No tracks in this playlist.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="playlists-container">
      
      <div className="playlists-header">
        <div>
          <h1 className="playlists-title">
            <ListMusic className="icon-cyan" size={32} />
            Your Playlists
          </h1>
          <p className="playlists-subtitle">Curate your perfect indie collections.</p>
        </div>
        <button className="btn-primary flex-icon" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> New Playlist
        </button>
      </div>

      <div className="playlists-grid">
        
        <div className="glass create-playlist-card" onClick={() => setShowCreateModal(true)}>
          <div className="create-icon-wrapper">
            <Plus size={32} />
          </div>
          <h3 className="create-text">Create New</h3>
        </div>

        {playlists.map((playlist) => (
          <div key={playlist.id} className="glass playlist-card" onClick={() => setSelectedPlaylist(playlist)}>
            <div 
              className="playlist-cover"
              style={{ background: playlist.coverColor }}
            >
              <div className="cover-play-overlay">
                <div className="play-btn-circle" onClick={(e) => handlePlayPlaylist(e, playlist)}>
                  <Play size={24} fill="currentColor" className="play-icon-offset" />
                </div>
              </div>
              <ListMusic size={48} className="cover-bg-icon" />
            </div>
            
            <div className="playlist-info-row">
              <div>
                <h3 className="playlist-name">{playlist.name}</h3>
                <p className="playlist-meta">{playlist.tracks?.length || 0} tracks • {playlist.type}</p>
              </div>
              <button className="btn-more" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}

      </div>

      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Create New Playlist</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Playlist Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Morning Coffee Vibes" 
                  value={newPlaylistName} 
                  onChange={(e) => setNewPlaylistName(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary">Create</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
