'use client';

import { useState, useEffect } from 'react';
import { Play, Search, Filter } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import './Discover.css';



const GENRES = ['All', 'Indie Pop', 'Shoegaze', 'Synthwave', 'Indie Rock', 'Dream Pop', 'Alternative', 'R&B / Neo-Soul', 'Indie Folk', 'Lo-Fi Beats'];

// Fallback tracks for when the DB is empty
const FALLBACK_TRACKS = [
  { id: 't1', title: 'ceilings', genre: 'Indie Folk', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/0/7/f/0/07fd77af15bc3b6f05ab683b89805d30.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg', artist: { name: 'Lizzy McAlpine' } },
  { id: 't2', title: 'Evergreen', genre: 'Indie Folk', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/0/7/f/0/07fd77af15bc3b6f05ab683b89805d30.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg', artist: { name: 'Lizzy McAlpine' } },
  { id: 't3', title: 'five seconds flat', genre: 'Indie Folk', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/0/7/f/0/07fd77af15bc3b6f05ab683b89805d30.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg', artist: { name: 'Lizzy McAlpine' } },
  { id: 't4', title: 'Best Part', genre: 'R&B', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/a/1/2/0/a122fc6c633aa6a2547c318bc3dcd4ef.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4dff56488d13d0b5e96d93d895c9624b/500x500-000000-80-0-0.jpg', artist: { name: 'Daniel Caesar' } },
  { id: 't5', title: 'Get You', genre: 'R&B', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/c/4/5/0/c45b5eaa64b82de1d6f186adc4dbc53e.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/282e45bef1995c2c6f2901e34c4ab560/500x500-000000-80-0-0.jpg', artist: { name: 'Daniel Caesar' } },
  { id: 't6', title: 'Superposition', genre: 'R&B', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/a/1/2/0/a122fc6c633aa6a2547c318bc3dcd4ef.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4dff56488d13d0b5e96d93d895c9624b/500x500-000000-80-0-0.jpg', artist: { name: 'Daniel Caesar' } },
  { id: 't7', title: 'Indigo', genre: 'Indie Pop', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/0/f/4/0/0f467ab1320e9a09d8b2f279a5e5a26b.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/28aeea0a18458309de3004f0bb3cda59/500x500-000000-80-0-0.jpg', artist: { name: 'NIKI' } },
  { id: 't8', title: 'Before', genre: 'Indie Pop', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/8/1/4/0/8144527cbb5fe1ea76a5c1926092c615.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/3f61783ca024dfd8f5cffdf92c55cf19/500x500-000000-80-0-0.jpg', artist: { name: 'NIKI' } },
  { id: 't9', title: 'Backburner', genre: 'Indie Pop', audioUrl: 'https://cdnt-preview.dzcdn.net/api/1/1/8/1/4/0/8144527cbb5fe1ea76a5c1926092c615.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/3f61783ca024dfd8f5cffdf92c55cf19/500x500-000000-80-0-0.jpg', artist: { name: 'NIKI' } },
];

export default function Discover() {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [tracks, setTracks] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        const data = await res.json();
        if (data.success && data.tracks.length > 0) {
          setTracks(data.tracks);
          return;
        }

        // Fallback: fresh preview URLs from Deezer via our server-side route
        const featuredRes = await fetch('/api/featured');
        const featuredData = await featuredRes.json();
        if (featuredData.success && featuredData.tracks.length > 0) {
          // Use Deezer preview URLs directly — they are CORS-enabled for browser playback
          setTracks(
            featuredData.tracks.map((t: any) => ({
              ...t,
              artist: { name: t.artist },
              audioUrl: t.audioUrl,
            }))
          );
          return;
        }

        // Last resort: static fallback (no audio)
        setTracks(FALLBACK_TRACKS);
      } catch {
        setTracks(FALLBACK_TRACKS);
      }
    };
    fetchTracks();
  }, []);

  const filtered = tracks.filter((t) => {
    const matchGenre = activeGenre === 'All' || t.genre === activeGenre;
    const matchQuery = t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist?.name?.toLowerCase().includes(query.toLowerCase());
    return matchGenre && matchQuery;
  });

  return (
    <div className="discover-container">
      {/* Header */}
      <div className="discover-header">
        <div>
          <h1 className="discover-title text-gradient">Discover</h1>
          <p className="discover-subtitle">Explore all indie tracks on the platform.</p>
        </div>
      </div>

      {/* Search */}
      <div className="discover-search-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by track or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Genre Filter */}
      <div className="genre-filter">
        <Filter size={16} className="filter-icon" />
        {GENRES.map((g) => (
          <button
            key={g}
            className={`genre-chip ${activeGenre === g ? 'active' : ''}`}
            onClick={() => setActiveGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Track Grid */}
      <div className="track-grid">
        {filtered.length === 0 && (
          <p className="no-results">No tracks found. Try a different search or genre.</p>
        )}
        {filtered.map((track) => {
          const isActive = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              className={`track-card glass ${isActive ? 'playing' : ''}`}
              onClick={() => playTrack({ id: track.id, title: track.title, artist: track.artist?.name || 'Unknown', audioUrl: track.audioUrl, coverUrl: track.coverUrl })}
            >
              <div className="track-card-cover">
                {track.coverUrl && <img src={track.coverUrl} alt={track.title} className="track-card-img" />}
                <div className="track-card-overlay">
                  <div className="track-card-play-btn">
                    <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />
                  </div>
                </div>
                {isActive && isPlaying && (
                  <div className="playing-bars">
                    <span /><span /><span />
                  </div>
                )}
              </div>
              <div className="track-card-info">
                <h4 className="track-card-title">{track.title}</h4>
                <p className="track-card-artist">{track.artist?.name || 'Unknown Artist'}</p>
                <span className="track-card-genre">{track.genre}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
