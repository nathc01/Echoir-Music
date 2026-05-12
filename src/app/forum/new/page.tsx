'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const CATEGORIES = ['General Discussion', 'Production', 'Collaboration', 'Gear & Tech', 'Business'];

export default function NewDiscussion() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General Discussion');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!session?.user) {
      setError('Kamu harus login untuk membuat diskusi.');
      return;
    }

    const authorId = (session.user as any).id as string;
    if (!authorId) {
      setError('Sesi tidak valid. Coba logout dan login kembali.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          authorId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/forum');
      } else {
        setError(data.error || 'Gagal membuat diskusi.');
      }
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="forum-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="forum-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
        <Link href="/forum" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', textDecoration: 'none', marginBottom: '2rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Forum
        </Link>
        <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
          <LogIn size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Login Diperlukan</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Kamu harus login untuk membuat diskusi baru di forum.
          </p>
          <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: '9999px', textDecoration: 'none' }}>
            <LogIn size={18} /> Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/forum" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Forum
        </Link>
        <h1 className="forum-title" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare className="icon-violet" size={32} />
          Start a Discussion
        </h1>
        <p className="forum-subtitle">Ask a question, share a tip, or start a collaboration.</p>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Category</label>
            <select 
              className="form-select" 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
            >
              {CATEGORIES.map((c) => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="What do you want to discuss?" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              required 
              autoFocus
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Content</label>
            <textarea 
              className="form-textarea" 
              placeholder="Share your thoughts in detail..." 
              value={newContent} 
              onChange={(e) => setNewContent(e.target.value)} 
              required 
              rows={6}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={submitting}
            style={{ padding: '1rem', marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}
          >
            {submitting ? 'Posting...' : 'Post Discussion'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
