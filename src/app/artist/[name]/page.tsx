'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Users, Music, MessageSquare } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';
import './ArtistProfile.css';

const artistData: Record<string, any> = {
  'Lizzy McAlpine': { name: 'Lizzy McAlpine', genre: 'Indie Folk', followers: '2.1M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg' },
  'Daniel Caesar': { name: 'Daniel Caesar', genre: 'R&B / Neo-Soul', followers: '5.4M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg' },
  'NIKI': { name: 'NIKI', genre: 'Indie Pop', followers: '3.2M', avatarUrl: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg' },
};

export default function ArtistProfile() {
  const { name } = useParams();
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [tracks, setTracks] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);

  const artistName = decodeURIComponent(name as string);
  const artist = artistData[artistName] || { name: artistName, genre: 'Artist', followers: '10K', avatarUrl: '' };

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [tracksRes, forumRes] = await Promise.all([
          fetch('/api/tracks'),
          fetch('/api/forum')
        ]);
        
        const tracksData = await tracksRes.json();
        if (tracksData.success) {
          const artistTracks = tracksData.tracks.filter((t: any) =>
            (t.musicianName && t.musicianName.toLowerCase() === artistName.toLowerCase()) || 
            (t.artist?.name && t.artist.name.toLowerCase() === artistName.toLowerCase())
          );
          setTracks(artistTracks);
        }

        const forumData = await forumRes.json();
        if (forumData.success) {
          const artistThreads = forumData.threads.filter((t: any) => 
            t.musicianName && t.musicianName.toLowerCase() === artistName.toLowerCase()
          );
          setDiscussions(artistThreads);
        }
      } catch (error) {
        console.error('Failed to fetch artist data:', error);
      }
    };
    fetchArtistData();
  }, [artistName]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      const queueTracks = tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.musicianName || t.artist?.name || 'Unknown Artist',
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
                  artist: track.musicianName || track.artist?.name || 'Unknown',
                  audioUrl: track.audioUrl,
                  coverUrl: track.coverUrl
                }, tracks.map(t => ({ id: t.id, title: t.title, artist: t.musicianName || t.artist?.name || 'Unknown', audioUrl: t.audioUrl, coverUrl: t.coverUrl })))}
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
                  <p className="track-card-artist">{track.musicianName || track.artist?.name || 'Unknown Artist'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="artist-main" style={{ marginTop: '2rem' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} /> Discussions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {discussions.length === 0 && (
            <p className="text-secondary">No discussions related to this artist yet.</p>
          )}
          {discussions.map((thread) => (
            <div key={thread.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="thread-category" style={{ display: 'inline-block', marginBottom: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>{thread.category}</span>
                <Link href={`/forum/${thread.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', cursor: 'pointer' }}>{thread.title}</h3>
                </Link>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Posted by {thread.author?.name || 'Unknown'} • {new Date(thread.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MessageSquare size={16} /> {thread.replies ?? 0}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={16} /> {thread.views ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
