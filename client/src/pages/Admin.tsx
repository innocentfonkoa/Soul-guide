// client/src/pages/Admin.tsx
// NEW FILE — password protected admin dashboard

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboardingDone: boolean;
  subscriptionActive: boolean;
  subscriptionExpiry: string | null;
}

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  freeUsers: number;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const API = (import.meta as any).env?.VITE_API_URL || 'https://soul-guide-production.up.railway.app';
  const ADMIN_PASSWORD = 'Innocent@12345';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setWrongPassword(false);
    } else {
      setWrongPassword(true);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { 'x-admin-key': ADMIN_PASSWORD },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch {
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (userId: string, activate: boolean) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API}/api/admin/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_PASSWORD },
        body: JSON.stringify({ userId, activate }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, subscriptionActive: activate, subscriptionExpiry: data.expiry } : u
        ));
        setMessage(`${activate ? '✅ Activated' : '❌ Deactivated'} successfully`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (authed) fetchUsers();
  }, [authed]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Login screen ──
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fdfaf7', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1a2e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ fontSize: '24px' }}>🔐</span>
          </div>
          <h1 style={{ fontSize: '22px', color: '#1a2e1a', marginBottom: '8px', fontWeight: 400 }}>Admin Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>SoulGuide · Restricted Access</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1px solid ${wrongPassword ? '#ef4444' : '#e5e7eb'}`, fontSize: '15px', fontFamily: 'Georgia, serif', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: 'white' }}
          />
          {wrongPassword && <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px' }}>Incorrect password</p>}
          <button
            onClick={handleLogin}
            style={{ width: '100%', padding: '14px', borderRadius: '100px', backgroundColor: '#1a2e1a', color: 'white', border: 'none', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1a2e1a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#7ab87a', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>SoulGuide</p>
          <h1 style={{ color: 'white', fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 400 }}>Admin Dashboard</h1>
        </div>
        <button onClick={fetchUsers} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {/* Toast message */}
      {message && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 24px', textAlign: 'center', fontSize: '14px', color: '#166534' }}>
          {message}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: '#1a2e1a' },
              { label: 'Active Subscribers', value: stats.activeSubscribers, color: '#16a34a' },
              { label: 'Free Users', value: stats.freeUsers, color: '#6b7280' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '28px', fontWeight: 700, color: s.color, marginBottom: '4px' }}>{s.value}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {/* Users table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading users...</div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Name', 'Email', 'Joined', 'Onboarded', 'Subscription', 'Expiry', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1a2e1a', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '100px', backgroundColor: u.onboardingDone ? '#dcfce7' : '#f3f4f6', color: u.onboardingDone ? '#16a34a' : '#6b7280' }}>
                        {u.onboardingDone ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '100px', backgroundColor: u.subscriptionActive ? '#dcfce7' : '#fef9ec', color: u.subscriptionActive ? '#16a34a' : '#92710a', fontWeight: 600 }}>
                        {u.subscriptionActive ? '✓ Active' : 'Free'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9ca3af' }}>
                      {u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => toggleSubscription(u.id, !u.subscriptionActive)}
                        disabled={actionLoading === u.id}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: 600,
                          backgroundColor: u.subscriptionActive ? '#fee2e2' : '#dcfce7',
                          color: u.subscriptionActive ? '#dc2626' : '#16a34a',
                          opacity: actionLoading === u.id ? 0.5 : 1,
                        }}
                      >
                        {actionLoading === u.id ? '...' : u.subscriptionActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', fontSize: '14px' }}>
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
