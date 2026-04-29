'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Mic2, UserPlus } from 'lucide-react';
import '../auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'LISTENER' | 'ARTIST'>('LISTENER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Registration failed.');
      setLoading(false);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="glass auth-card">
        <div className="auth-brand">echoir</div>
        <h1 className="auth-title">Join Echoir</h1>
        <p className="auth-subtitle">Become part of the indie music movement</p>

        {error && <div className="auth-error">{error}</div>}

        {/* Role Selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'LISTENER' ? 'active' : ''}`}
            onClick={() => setRole('LISTENER')}
          >
            <User size={18} /> Listener
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'ARTIST' ? 'active' : ''}`}
            onClick={() => setRole('ARTIST')}
          >
            <Mic2 size={18} /> Artist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label flex-icon"><User size={14} /> Display Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your name or artist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label flex-icon"><Mail size={14} /> Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label flex-icon"><Lock size={14} /> Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
