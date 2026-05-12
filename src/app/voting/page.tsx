'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, ChevronUp, Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import './Voting.css';



export default function Voting() {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState<any[]>([]);
  const [votedTrackId, setVotedTrackId] = useState<string | null>(null);
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const guestId = typeof window !== 'undefined'
    ? (localStorage.getItem('echoir-guest-id') || (() => {
        const id = `guest-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('echoir-guest-id', id);
        return id;
      })())
    : 'guest';

  const [freshFallback, setFreshFallback] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/vote');
        const data = await res.json();
        if (data.success) {
          setTracks(data.tracks);
          setMonth(data.month);
          // Check if this guest has already voted
          const voted = data.tracks.find((t: any) => t.votes?.some((v: any) => v.userId === guestId));
          if (voted) setVotedTrackId(voted.id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLeaderboard();
  }, [guestId]);

  // Fetch fresh Deezer previews for fallback nominees
  useEffect(() => {
    const loadFreshFallback = async () => {
      try {
        const res = await fetch('/api/featured');
        const data = await res.json();
        if (data.success && data.tracks.length > 0) {
          // Take first 3 as nominees
          setFreshFallback(
            data.tracks.slice(0, 3).map((t: any, i: number) => ({
              id: `f${i + 1}`,
              rank: i + 1,
              name: t.artist,
              track: t.title,
              genre: t.genre,
              votes: [18420, 15200, 12840][i] || 0,
              coverUrl: t.coverUrl,
              audioUrl: t.audioUrl || '', // Use Deezer URL directly
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFreshFallback();
  }, []);


  const handleVote = async (trackId: string) => {
    if (votedTrackId) return;
    setLoading(trackId);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, guestId }),
      });
      const data = await res.json();
      if (data.success) {
        setVotedTrackId(trackId);
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId ? { ...t, _count: { votes: (t._count?.votes || 0) + 1 } } : t
          )
        );
      } else {
        alert(data.error || 'Vote failed.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  // Fallback for empty DB — use fresh previews if available
  const nominees = tracks.length > 0
    ? tracks.map((t, i) => ({
        id: t.id,
        rank: i + 1,
        name: t.musicianName || t.artist?.name || 'Unknown',
        track: t.title,
        genre: t.genre,
        votes: t._count?.votes || 0,
        coverUrl: t.coverUrl,
        audioUrl: t.audioUrl || '',
      }))
    : freshFallback.length > 0
    ? freshFallback
    : [
        { id: 'f1', rank: 1, name: 'Lizzy McAlpine', track: 'ceilings', genre: 'Indie Folk', votes: 18420, audioUrl: '', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg' },
        { id: 'f2', rank: 2, name: 'Daniel Caesar', track: 'Best Part', genre: 'R&B / Neo-Soul', votes: 15200, audioUrl: '', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4dff56488d13d0b5e96d93d895c9624b/500x500-000000-80-0-0.jpg' },
        { id: 'f3', rank: 3, name: 'NIKI', track: 'Indigo', genre: 'Indie Pop', votes: 12840, audioUrl: '', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/28aeea0a18458309de3004f0bb3cda59/500x500-000000-80-0-0.jpg' },
      ];


  return (
    <div className="voting-container">
      {/* Header Banner */}
      <div className="glass voting-banner">
        <div className="banner-bg-icon"><Trophy size={300} /></div>
        <div className="banner-content">
          <div className="banner-month">
            <Star size={16} fill="currentColor" /> {month || 'This Month'}
          </div>
          <h1 className="banner-title">Indie Artist of the Month</h1>
          <p className="banner-subtitle">
            Vote for your favorite undiscovered talents. The winner gets featured on the main dashboard and reviewed by partner labels.
          </p>
          {votedTrackId && (
            <div className="voted-notice">✅ You&apos;ve cast your vote for this month. Results update in real time!</div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2 className="leaderboard-title">Current Standings</h2>
        <div className="nominee-list">
          {nominees.map((artist) => {
            const isVoted = votedTrackId === artist.id;
            const isLoading = loading === artist.id;
            return (
              <div key={artist.id} className={`glass nominee-card ${isVoted ? 'voted' : ''}`}>
                <div className="nominee-rank">#{artist.rank}</div>

                <div className="nominee-play-box" onClick={() => playTrack({ id: artist.id, title: artist.track, artist: artist.name, audioUrl: artist.audioUrl, coverUrl: artist.coverUrl })}>
                  {artist.coverUrl && <img src={artist.coverUrl} alt={artist.track} className="nominee-img" />}
                  <div className="play-box-overlay"></div>
                  <Play size={20} fill="currentColor" className="play-box-icon" />
                </div>

                <div className="nominee-info">
                  <h3 className="nominee-name">{artist.name}</h3>
                  <p className="nominee-track">{artist.track} • {artist.genre}</p>
                </div>

                <div className="nominee-votes">
                  <div className="votes-count">{typeof artist.votes === 'number' ? artist.votes.toLocaleString() : artist.votes}</div>
                  <div className="votes-label">Votes</div>
                </div>

                <button
                  className={`btn-primary btn-vote ${isVoted ? 'voted-btn' : ''}`}
                  onClick={() => handleVote(artist.id)}
                  disabled={!!votedTrackId || isLoading}
                >
                  <ChevronUp size={20} />
                  {isLoading ? '...' : isVoted ? 'Voted!' : 'Vote'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
