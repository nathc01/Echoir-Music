'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Upload, Trophy, ListMusic, Compass, User, LogOut, LogIn } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import './Sidebar.css';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Discover', path: '/discover', icon: Compass },
  { name: 'Forum', path: '/forum', icon: MessageSquare },
  { name: 'Upload', path: '/upload', icon: Upload },
  { name: 'Voting', path: '/voting', icon: Trophy },
  { name: 'Playlists', path: '/playlists', icon: ListMusic },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  return (
    <aside className="sidebar glass">
      <div className="sidebar-top">
        <Link href="/" className="sidebar-brand">
          <h1 className="brand-text">echoir</h1>
        </Link>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
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
                <p className="user-action">{session.user.email}</p>
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
