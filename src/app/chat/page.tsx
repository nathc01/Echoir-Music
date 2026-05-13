'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Send, User } from 'lucide-react';
import Link from 'next/link';

export default function Chat() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('user');

  const [friends, setFriends] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Friends
  useEffect(() => {
    if (!currentUserId) return;
    const fetchFriends = async () => {
      const res = await fetch(`/api/friends?userId=${currentUserId}`);
      const data = await res.json();
      if (data.success) {
        const accepted = data.friendships
          .filter((f: any) => f.status === 'ACCEPTED')
          .map((f: any) => f.senderId === currentUserId ? f.receiver : f.sender);
        setFriends(accepted);
        
        if (initialUserId) {
          const userToSelect = accepted.find((u: any) => u.id === initialUserId);
          if (userToSelect) setSelectedUser(userToSelect);
        }
      }
    };
    fetchFriends();
  }, [currentUserId, initialUserId]);

  // Fetch Messages for selected user
  const fetchMessages = async () => {
    if (!currentUserId || !selectedUser) return;
    const res = await fetch(`/api/messages?userId1=${currentUserId}&userId2=${selectedUser.id}`);
    const data = await res.json();
    if (data.success) {
      setMessages(data.messages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedUser.id,
          content: newMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) return <div style={{ textAlign: 'center', paddingTop: '4rem' }}>Please log in to use chat.</div>;

  return (
    <div className="container" style={{ padding: '2rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar: Friends List */}
        <div className="glass" style={{ width: '300px', borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={20} /> Messages
            </h2>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {friends.length === 0 ? (
              <p style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>No friends yet. <Link href="/network" style={{color: 'var(--accent-primary)'}}>Find friends</Link></p>
            ) : (
              friends.map(friend => (
                <div 
                  key={friend.id} 
                  onClick={() => setSelectedUser(friend)}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    cursor: 'pointer',
                    background: selectedUser?.id === friend.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {friend.image ? (
                    <img src={friend.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                  )}
                  <span style={{ fontWeight: 600 }}>{friend.name || 'Unknown'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="glass" style={{ flex: 1, borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedUser ? (
            <>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 {selectedUser.image ? (
                    <img src={selectedUser.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                  )}
                <h3 style={{ fontSize: '1.25rem' }}>{selectedUser.name}</h3>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>
                    Send a message to start the conversation!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <div style={{ 
                          padding: '0.75rem 1rem', 
                          borderRadius: '1rem', 
                          background: isMine ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                          color: 'white',
                          borderBottomRightRadius: isMine ? '0.25rem' : '1rem',
                          borderBottomLeftRadius: isMine ? '1rem' : '0.25rem'
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: isMine ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: '1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                />
                <button type="submit" className="btn-primary" style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <Send size={20} style={{ marginLeft: '-2px' }} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
              <MessageCircle size={48} opacity={0.5} />
              <p>Select a friend to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
