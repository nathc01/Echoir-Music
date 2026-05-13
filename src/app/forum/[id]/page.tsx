'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Send, User, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import '../Forum.css';

export default function ThreadDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/forum/${id}`);
        const data = await res.json();
        if (data.success) {
          setThread(data.thread);
          setReplies(data.thread.replies || []);
        } else {
          setError(data.error || 'Failed to load thread');
        }
      } catch (err) {
        setError('Error loading thread');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchThread();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    if (!session?.user) {
      alert('You must be logged in to reply.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newReply,
          authorId: (session.user as any).id
        })
      });
      const data = await res.json();
      if (data.success) {
        setReplies([...replies, data.reply]);
        setNewReply('');
      } else {
        alert(data.error || 'Failed to post reply');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while posting reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="forum-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading thread...</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="forum-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#f87171' }}>{error || 'Thread not found'}</p>
        <Link href="/forum" className="btn-outline" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="forum-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <button className="btn-back" onClick={() => router.back()} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Main Thread */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <span className="thread-category" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>{thread.category}</span>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{thread.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {thread.author?.image ? (
                <img src={thread.author.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
              ) : (
                <User size={16} />
              )}
              <span>Posted by <strong><Link href={`/user/${thread.author?.id || ''}`} style={{ color: 'inherit', textDecoration: 'none' }}>{thread.author?.name || 'Unknown'}</Link></strong></span>
              <span>•</span>
              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
              {thread.musicianName && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--accent-primary)' }}>Artist: {thread.musicianName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginTop: '1.5rem' }}>
          {thread.content}
        </div>
      </div>

      {/* Replies Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} /> Replies ({replies.length})
        </h3>
        
        {replies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
            No replies yet. Be the first to reply!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {replies.map(reply => (
              <div key={reply.id} className="glass" style={{ padding: '1.5rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  {reply.author?.image ? (
                    <img src={reply.author.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  ) : (
                    <User size={16} />
                  )}
                  <strong><Link href={`/user/${reply.author?.id || ''}`} style={{ color: 'inherit', textDecoration: 'none' }}>{reply.author?.name || 'Unknown'}</Link></strong>
                  <span style={{ color: 'var(--text-muted)' }}>• {new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {reply.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {session?.user ? (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              placeholder="Write your reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              required
              rows={4}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting || !newReply.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
              >
                <Send size={16} /> {submitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You must be logged in to reply.</p>
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Log In to Reply
          </Link>
        </div>
      )}
    </div>
  );
}
