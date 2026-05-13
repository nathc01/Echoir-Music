'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Users, ThumbsUp, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import './Forum.css';

const CATEGORIES = ['General Discussion', 'Production', 'Collaboration', 'Gear & Tech', 'Business'];

const FALLBACK_THREADS = [
  { id: 'f1', title: 'Tips for mixing indie folk vocals?', author: { name: 'LunaTunes' }, replies: 24, views: 1200, category: 'Production', createdAt: new Date().toISOString() },
  { id: 'f2', title: 'Looking for a synth player for a collab', author: { name: 'Neon Horizons' }, replies: 8, views: 340, category: 'Collaboration', createdAt: new Date().toISOString() },
  { id: 'f3', title: 'How to pitch your music to indie labels?', author: { name: 'AudioJunkie' }, replies: 56, views: 4500, category: 'Business', createdAt: new Date().toISOString() },
];

export default function Forum() {
  const [threads, setThreads] = useState<any[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await fetch('/api/forum');
        const data = await res.json();
        if (data.success && data.threads.length > 0) {
          setThreads(data.threads);
          setIsFallback(false);
        } else {
          setThreads(FALLBACK_THREADS);
          setIsFallback(true);
        }
      } catch {
        setThreads(FALLBACK_THREADS);
        setIsFallback(true);
      }
    };
    fetchThreads();
  }, []);

  // POST is now handled in /forum/new/page.tsx

  const handleDelete = async (threadId: string | number) => {
    const id = String(threadId);
    if (isFallback || typeof threadId === 'number') {
      setThreads((prev) => prev.filter((t) => String(t.id) !== id));
      return;
    }
    setDeleting(id);
    try {
      const res = await fetch('/api/forum', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setThreads((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const formatViews = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

  return (
    <div className="forum-container">
      <div className="forum-header">
        <div>
          <h1 className="forum-title"><MessageSquare className="icon-violet" size={32} />Community Forum</h1>
          <p className="forum-subtitle">Connect with other indie musicians, share tips, and collaborate.</p>
        </div>
        <Link href="/forum/new" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <Plus size={18} style={{ marginRight: '6px' }} />
          New Discussion
        </Link>
      </div>

      <div className="forum-grid">
        <div className="forum-feed">
          {threads.map((thread) => (
            <div key={thread.id} className="thread-card glass">
              <div className="thread-content-wrapper">
                <div className="thread-info">
                  <div className="thread-meta">
                    <span className="thread-category">{thread.category}</span>
                    <span className="thread-author-label">Posted by <Link href={`/user/${thread.author?.id || ''}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }} className="thread-author">{thread.author?.name || 'Unknown'}</Link></span>
                  </div>
                  <Link href={`/forum/${thread.id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="thread-title" style={{ cursor: 'pointer' }}>{thread.title}</h3>
                  </Link>
                </div>
                <div className="thread-actions">
                  <div className="thread-stats">
                    <div className="stat-item"><MessageSquare size={16} /><span>{thread.replies ?? 0}</span></div>
                    <div className="stat-item"><Users size={16} /><span>{formatViews(thread.views ?? 0)}</span></div>
                  </div>
                  <button
                    className="thread-delete-btn"
                    onClick={() => handleDelete(thread.id)}
                    disabled={deleting === String(thread.id)}
                    title="Delete thread"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {threads.length === 0 && (
            <p className="no-threads">No discussions yet. Be the first to start one!</p>
          )}
        </div>

        <div className="forum-sidebar">
          <div className="glass forum-widget">
            <h3 className="widget-title">Popular Categories</h3>
            <ul className="category-list">
              {CATEGORIES.map((cat) => (
                <li key={cat} className="category-item">
                  <span>{cat}</span>
                  <span className="category-count">{threads.filter((t) => t.category === cat).length}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass forum-widget highlight-widget">
            <h3 className="widget-title flex-icon"><ThumbsUp size={18} className="icon-cyan" /> Community Guidelines</h3>
            <p className="guidelines-text">Be respectful, share your knowledge, and support fellow indie artists. Spam will be removed.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
