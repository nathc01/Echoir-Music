'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Check, X, Users, MessageCircle, Search } from 'lucide-react';
import Link from 'next/link';

export default function Network() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  
  const [friendships, setFriendships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchFriends = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/friends?userId=${currentUserId}`);
      const data = await res.json();
      if (data.success) {
        setFriendships(data.friendships);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUserId]);

  const handleAction = async (friendshipId: string, action: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, friendshipId })
      });
      if (res.ok) fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        // Exclude self from search results
        setSearchResults(data.users.filter((u: any) => u.id !== currentUserId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!session) return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Please log in to view your network.</div>;
  if (loading) return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading...</div>;

  const pendingReceived = friendships.filter(f => f.status === 'PENDING' && f.receiverId === currentUserId);
  const pendingSent = friendships.filter(f => f.status === 'PENDING' && f.senderId === currentUserId);
  const accepted = friendships.filter(f => f.status === 'ACCEPTED');

  const FriendCard = ({ rel, isPendingReceived = false }: { rel: any, isPendingReceived?: boolean }) => {
    const otherUser = rel.senderId === currentUserId ? rel.receiver : rel.sender;
    
    return (
      <div className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Link href={`/user/${otherUser.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
          {otherUser.image ? (
             <img src={otherUser.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          ) : (
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <User size={20} />
             </div>
          )}
          <span style={{ fontWeight: 600 }}>{otherUser.name || 'Unknown User'}</span>
        </Link>
        
        {isPendingReceived ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={() => handleAction(rel.id, 'accept')} style={{ padding: '0.5rem' }} title="Accept">
              <Check size={16} />
            </button>
            <button className="btn-outline" onClick={() => handleAction(rel.id, 'reject')} style={{ padding: '0.5rem' }} title="Reject">
              <X size={16} />
            </button>
          </div>
        ) : rel.status === 'ACCEPTED' ? (
          <Link href={`/chat?user=${otherUser.id}`} className="btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <MessageCircle size={16} /> Message
          </Link>
        ) : (
           <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending</span>
        )}
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <Users size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Network</h1>
      </div>

      {/* Search Section */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} /> Find Friends
        </h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {searchResults.map(user => (
              <Link key={user.id} href={`/user/${user.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'background 0.2s', cursor: 'pointer' }}>
                  {user.image ? (
                     <img src={user.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <User size={20} />
                     </div>
                  )}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.role}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Friend Requests ({pendingReceived.length})</h2>
          {pendingReceived.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending requests.</p> : null}
          {pendingReceived.map(f => <FriendCard key={f.id} rel={f} isPendingReceived />)}
          
          {pendingSent.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Sent Requests</h3>
              {pendingSent.map(f => <FriendCard key={f.id} rel={f} />)}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Friends ({accepted.length})</h2>
          {accepted.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>You haven't added any friends yet.</p> : null}
          {accepted.map(f => <FriendCard key={f.id} rel={f} />)}
        </div>
      </div>
    </div>
  );
}
