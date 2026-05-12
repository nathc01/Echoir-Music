'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Music2, Trash2, X, AlertTriangle } from 'lucide-react';
import './Admin.css';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  _count: { tracks: number; threads: number };
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || userRole !== 'ADMIN') {
      router.replace('/');
      return;
    }
    fetchUsers();
  }, [status, session, userRole]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="admin-loading">
        <ShieldCheck size={32} className="admin-loading-icon" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (userRole !== 'ADMIN') return null;

  const roleBadgeClass: Record<string, string> = {
    ADMIN: 'role-pill role-admin',
    ARTIST: 'role-pill role-artist',
    LISTENER: 'role-pill role-listener',
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-title">
          <ShieldCheck size={28} className="admin-icon" />
          <div>
            <h1 className="admin-title text-gradient">Admin Panel</h1>
            <p className="admin-subtitle">Kelola user dan privilege platform Echoir.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card glass">
            <Users size={20} className="stat-icon" />
            <div>
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{users.length}</p>
            </div>
          </div>
          <div className="admin-stat-card glass">
            <Music2 size={20} className="stat-icon" />
            <div>
              <p className="stat-label">Total Tracks</p>
              <p className="stat-value">{users.reduce((sum, u) => sum + u._count.tracks, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="admin-table-wrapper glass">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Tracks</th>
              <th>Bergabung</th>
              <th>Ubah Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.id === (session?.user as any)?.id ? 'current-user-row' : ''}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-sm">{(user.name || user.email || '?')[0].toUpperCase()}</div>
                    <span className="user-cell-name">{user.name || '(no name)'}</span>
                    {user.id === (session?.user as any)?.id && <span className="you-badge">You</span>}
                  </div>
                </td>
                <td className="email-cell">{user.email || '—'}</td>
                <td>
                  <span className={roleBadgeClass[user.role] || 'role-pill role-listener'}>
                    {user.role}
                  </span>
                </td>
                <td className="count-cell">{user._count.tracks}</td>
                <td className="date-cell">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                <td>
                  <select
                    className="role-select"
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    disabled={updating === user.id || user.id === (session?.user as any)?.id}
                  >
                    <option value="LISTENER">LISTENER</option>
                    <option value="ARTIST">ARTIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
