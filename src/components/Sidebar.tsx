'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Upload, Trophy, ListMusic, Compass, User, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  const role = (session?.user as any)?.role as string | undefined;
  const isAdmin = role === 'ADMIN';
  const isArtistOrAdmin = role === 'ARTIST' || role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home, show: true },
    { name: 'Discover', path: '/discover', icon: Compass, show: true },
    { name: 'Forum', path: '/forum', icon: MessageSquare, show: true },
    { name: 'Upload', path: '/upload', icon: Upload, show: isArtistOrAdmin },
    { name: 'Voting', path: '/voting', icon: Trophy, show: true },
    { name: 'Playlists', path: '/playlists', icon: ListMusic, show: true },
    { name: 'Admin Panel', path: '/admin', icon: ShieldCheck, show: isAdmin },
  ];

  const roleBadgeLabel: Record<string, string> = {
    ADMIN: 'Admin',
    ARTIST: 'Artist',
    LISTENER: 'Listener',
  };

  const roleBadgeClass: Record<string, string> = {
    ADMIN: 'role-badge role-admin',
    ARTIST: 'role-badge role-artist',
    LISTENER: 'role-badge role-listener',
  };

  return (
    <aside className="sidebar glass">
      <div className="sidebar-top">
        <Link href="/" className="sidebar-brand">
          <span className="brand-wordmark">echoir</span>
        </Link>
        
        <nav className="sidebar-nav">
          {navItems.filter(item => item.show).map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`nav-item ${isActive ? 'active' : ''} ${item.name === 'Admin Panel' ? 'nav-item-admin' : ''}`}
              >
                <item.icon size={20} className="nav-icon" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        {status === 'authenticated' && session?.user ? (
          <div className="user-profile-area">
            <div className="user-profile-info">
              <div className="user-avatar">
                {session.user.image ? (
                  <img src={session.user.image} alt="avatar" className="avatar-img" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="user-info">
                <p className="user-name">{session.user.name || 'User'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {role && (
                    <span className={roleBadgeClass[role] || 'role-badge role-listener'}>
                      {roleBadgeLabel[role] || role}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="user-profile-btn" onClick={() => router.push('/login')}>
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <p className="user-name">Guest</p>
              <p className="user-action flex-icon" style={{ gap: '4px', display: 'flex', alignItems: 'center' }}>
                <LogIn size={12} /> Sign In
              </p>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
