// client/src/pages/Activate.tsx
// NEW FILE — subscription activation page after Selar payment

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'not_found';

export default function Activate() {
  const navigate = useNavigate();
  const { user, token, setUser } = useStore();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const API = (import.meta as any).env?.VITE_API_URL || 'https://soul-guide-production.up.railway.app';

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleActivate = async () => {
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API}/api/subscription/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (res.status === 404) { setStatus('not_found'); return; }
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong'); setStatus('error'); return; }

      if (token && user) {
        setUser({ ...user, subscriptionActive: true, subscriptionExpiry: data.expiry });
      }

      setStatus('success');
    } catch {
      setErrorMsg('Could not reach the server. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fdfaf7', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1a2e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#e8c97a" strokeWidth={1.5} style={{ width: '32px', height: '32px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      </div>

      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>

        {status === 'success' ? (
          <div>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontSize: '26px', color: '#1a2e1a', marginBottom: '12px', fontWeight: 400 }}>You're in!</h1>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, marginBottom: '32px' }}>
              Your SoulGuide subscription is now active. Welcome to your full journey.
            </p>
            <button
              onClick={() => navigate(token ? '/home' : '/auth')}
              style={{ backgroundColor: '#1a2e1a', color: 'white', border: 'none', borderRadius: '100px', padding: '16px 40px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Georgia, serif', width: '100%' }}
            >
              {token ? 'Go to my journey →' : 'Sign in to start →'}
            </button>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '26px', color: '#1a2e1a', marginBottom: '12px', fontWeight: 400 }}>Activate your access</h1>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, marginBottom: '32px' }}>
              Thank you for your payment! Enter the email you used on Selar to activate your subscription instantly.
            </p>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email you used on Selar"
              onKeyDown={e => e.key === 'Enter' && handleActivate()}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', fontFamily: 'Georgia, serif', color: '#1a2e1a', backgroundColor: 'white', marginBottom: '12px', boxSizing: 'border-box' }}
            />

            {status === 'not_found' && (
              <div style={{ backgroundColor: '#fef9ec', borderRadius: '12px', padding: '12px', marginBottom: '12px', textAlign: 'left' }}>
                <p style={{ fontSize: '13px', color: '#92710a', lineHeight: 1.5 }}>
                  No account found with that email. Make sure you use the same email for SoulGuide and Selar, then{' '}
                  <span style={{ color: '#4a7a4a', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/auth')}>sign up first</span>.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626' }}>{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={status === 'loading' || !email.trim()}
              style={{ backgroundColor: '#1a2e1a', color: 'white', border: 'none', borderRadius: '100px', padding: '16px 40px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Georgia, serif', width: '100%', opacity: status === 'loading' || !email.trim() ? 0.6 : 1 }}
            >
              {status === 'loading' ? 'Activating...' : 'Activate my subscription'}
            </button>

            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
              Paid but no account yet?{' '}
              <span style={{ color: '#4a7a4a', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/auth')}>Sign up first</span>
              , then come back here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
