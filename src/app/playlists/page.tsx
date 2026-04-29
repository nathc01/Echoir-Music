import { ListMusic, Plus, Play, MoreHorizontal } from 'lucide-react';

const playlists = [
  { id: 1, name: 'Late Night Drives', tracks: 24, type: 'Public', coverColor: 'linear-gradient(to bottom right, #2563eb, #312e81)' },
  { id: 2, name: 'Indie Discoveries', tracks: 52, type: 'Private', coverColor: 'linear-gradient(to bottom right, #10b981, #115e59)' },
  { id: 3, name: 'Synthwave Essentials', tracks: 18, type: 'Public', coverColor: 'linear-gradient(to bottom right, #c026d3, #581c87)' },
  { id: 4, name: 'Acoustic Chill', tracks: 31, type: 'Public', coverColor: 'linear-gradient(to bottom right, #f97316, #7f1d1d)' },
];

export default function Playlists() {
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
        <button className="btn-primary flex-icon">
          <Plus size={18} /> New Playlist
        </button>
      </div>

      <div className="playlists-grid">
        
        {/* Create New Playlist Card */}
        <div className="glass create-playlist-card">
          <div className="create-icon-wrapper">
            <Plus size={32} />
          </div>
          <h3 className="create-text">Create New</h3>
        </div>

        {/* Existing Playlists */}
        {playlists.map((playlist) => (
          <div key={playlist.id} className="glass playlist-card">
            <div 
              className="playlist-cover"
              style={{ background: playlist.coverColor }}
            >
              <div className="cover-play-overlay">
                <div className="play-btn-circle">
                  <Play size={24} fill="currentColor" className="play-icon-offset" />
                </div>
              </div>
              <ListMusic size={48} className="cover-bg-icon" />
            </div>
            
            <div className="playlist-info-row">
              <div>
                <h3 className="playlist-name">{playlist.name}</h3>
                <p className="playlist-meta">{playlist.tracks} tracks • {playlist.type}</p>
              </div>
              <button className="btn-more">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}
