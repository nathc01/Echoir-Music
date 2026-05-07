'use client';

import { useState, useEffect } from 'react';
import { Play, TrendingUp, Music } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';


const featuredArtists = [
  { id: 1, name: 'Lizzy McAlpine', genre: 'Indie Folk', followers: '2.1M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg' },
  { id: 2, name: 'Daniel Caesar', genre: 'R&B / Neo-Soul', followers: '5.4M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg' },
  { id: 3, name: 'NIKI', genre: 'Indie Pop', followers: '3.2M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg' },
];

export default function Dashboard() {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const dbRes = await fetch('/api/tracks');
        const dbData = await dbRes.json();
        if (dbData.success && dbData.tracks.length > 0) {
          setTracks(dbData.tracks);
          return;
        }

        const featuredRes = await fetch('/api/featured');
        const featuredData = await featuredRes.json();
        if (featuredData.success && featuredData.tracks.length > 0) {
          setTracks(
            featuredData.tracks.map((t: any) => ({
              ...t,
              artist: { name: t.artist },
              audioUrl: t.audioUrl,
            }))
          );
          return;
        }
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      }
    };
    fetchTracks();
  }, []);

  const handlePlayTop50 = () => {
    if (tracks.length > 0) {
      const queueTracks = tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name || 'Unknown Artist',
        audioUrl: t.audioUrl,
        coverUrl: t.coverUrl
      }));
      playTrack(queueTracks[0], queueTracks);
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* Hero Section */}
      <section className="hero-section glass">
        <div className="hero-overlay"></div>
        <div className="hero-bg"></div>
        <div className="hero-content">
          <span className="hero-badge">
            Talent Spotlight
          </span>
          <h1 className="hero-title">
            Discover the Undiscovered.
          </h1>
          <p className="hero-subtitle">
            Dive into the fresh sounds of independent artists pushing the boundaries of music.
          </p>
          <div className="hero-actions">
            <button className="btn-primary flex items-center" onClick={handlePlayTop50}>
              <Play fill="currentColor" size={18} style={{ marginRight: '8px' }} />
              Play Top 50
            </button>
            <button className="btn-outline">
              Explore Labels
            </button>
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
            {tracks.map((track, i) => (
              <div 
                key={track.id} 
                className="track-item"
                onClick={() => playTrack({
                  id: track.id,
                  title: track.title,
                  artist: track.artist?.name || 'Unknown Artist',
                  audioUrl: track.audioUrl,
                  coverUrl: track.coverUrl
                }, tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist?.name || 'Unknown', audioUrl: t.audioUrl, coverUrl: t.coverUrl })))}
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
                  <p className="track-artist-name">{track.artist?.name || 'Unknown Artist'}</p>
                </div>
                <div className="track-time">
                  -
                </div>
              </div>
            ))}
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
                      <span className="artist-genre">
                        {artist.genre}
                      </span>
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
