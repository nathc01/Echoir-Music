'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, UserPlus, UserCheck, Clock, MessageCircle, ArrowLeft } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [user, setUser] = useState<any>(null);
  const [friendship, setFriendship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserId = (session?.user as any)?.id;
  const isSelf = currentUserId === id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`/api/users/${id}`);
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.user);
        }

        if (currentUserId && !isSelf) {
          const friendsRes = await fetch(`/api/friends?userId=${currentUserId}`);
          const friendsData = await friendsRes.json();
          if (friendsData.success) {
            const rel = friendsData.friendships.find((f: any) => f.senderId === id || f.receiverId === id);
            setFriendship(rel);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, currentUserId, isSelf]);

  const handleFriendAction = async (action: string) => {
    if (!currentUserId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          senderId: currentUserId,
          receiverId: id,
          friendshipId: friendship?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'request' || action === 'accept') {
          setFriendship(data.friendship);
        } else {
          setFriendship(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Loading...</div>;
  if (!user) return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>User not found.</div>;

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <button className="btn-back" onClick={() => router.back()} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          {user.image ? (
            <img src={user.image} alt="" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '4px solid var(--accent-primary)' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '4px solid var(--accent-primary)' }}>
              <User size={60} color="var(--text-secondary)" />
            </div>
          )}
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{user.name || 'Unknown User'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>Joined {new Date(user.createdAt).toLocaleDateString()}</p>

        {currentUserId && !isSelf && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {!friendship ? (
              <button 
                className="btn-primary" 
                onClick={() => handleFriendAction('request')}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <UserPlus size={18} /> Add Friend
              </button>
            ) : friendship.status === 'ACCEPTED' ? (
              <>
                <button className="btn-outline" disabled style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                  <UserCheck size={18} /> Friends
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => router.push(`/chat?user=${id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <MessageCircle size={18} /> Message
                </button>
              </>
            ) : friendship.senderId === currentUserId ? (
              <button className="btn-outline" disabled style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
                <Clock size={18} /> Request Sent
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={() => handleFriendAction('accept')}
                disabled={actionLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <UserCheck size={18} /> Accept Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
