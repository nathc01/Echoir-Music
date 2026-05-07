'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Users, Music } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import './ArtistProfile.css';

const artistData: Record<string, any> = {
  'Lizzy McAlpine': { name: 'Lizzy McAlpine', genre: 'Indie Folk', followers: '2.1M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg' },
  'Daniel Caesar': { name: 'Daniel Caesar', genre: 'R&B / Neo-Soul', followers: '5.4M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg' },
  'NIKI': { name: 'NIKI', genre: 'Indie Pop', followers: '3.2M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg' },
  'beabadoobee': { name: 'beabadoobee', genre: 'Indie Rock', followers: '1.8M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/11c2105e468307b2759a2245c614b64b/500x500-000000-80-0-0.jpg' },
};

export default function ArtistProfile() {
  const { name } = useParams();
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [tracks, setTracks] = useState<any[]>([]);

  const artistName = decodeURIComponent(name as string);
  const artist = artistData[artistName] || { name: artistName, genre: 'Artist', followers: '10K', avatarUrl: '' };

  useEffect(() => {
    const fetchArtistTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        const data = await res.json();
        if (data.success) {
          const artistTracks = data.tracks.filter((t: any) => t.artist?.name === artistName);
          setTracks(artistTracks);
        }
      } catch (error) {
        console.error('Failed to fetch artist tracks:', error);
      }
    };
    fetchArtistTracks();
  }, [artistName]);

  const handlePlayAll = () => {
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
    <div className="artist-profile-container">
      <button className="btn-back" onClick={() => router.back()}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="artist-hero">
        <div className="artist-hero-bg" style={{ backgroundImage: `url(${artist.avatarUrl})` }}></div>
        <div className="artist-hero-overlay"></div>
        <div className="artist-hero-content">
          {artist.avatarUrl && <img src={artist.avatarUrl} alt={artist.name} className="artist-avatar-large" />}
          <div className="artist-hero-info">
            <h1 className="artist-hero-name">{artist.name}</h1>
            <div className="artist-hero-meta">
              <span className="meta-item"><Users size={16} /> {artist.followers} Followers</span>
              <span className="meta-item"><Music size={16} /> {artist.genre}</span>
            </div>
            <div className="artist-actions">
              <button className="btn-primary flex items-center" onClick={handlePlayAll}>
                <Play fill="currentColor" size={18} style={{ marginRight: '8px' }} />
                Play All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="artist-main">
        <h2 className="section-title">Popular Tracks</h2>
        <div className="track-grid">
          {tracks.length === 0 && (
            <p className="text-secondary">No tracks available for this artist yet.</p>
          )}
          {tracks.map((track) => {
            const isActive = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`track-card glass ${isActive ? 'playing' : ''}`}
                onClick={() => playTrack({
                  id: track.id,
                  title: track.title,
                  artist: track.artist?.name || 'Unknown',
                  audioUrl: track.audioUrl,
                  coverUrl: track.coverUrl
                }, tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist?.name || 'Unknown', audioUrl: t.audioUrl, coverUrl: t.coverUrl })))}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
