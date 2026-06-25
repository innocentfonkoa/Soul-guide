import { useNavigate } from 'react-router-dom';

const MONTHLY_URL = 'https://selar.com/s641241t38';
const ANNUAL_URL  = 'https://selar.com/2b3820q571';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#fdfaf7', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>

      <nav style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <span style={{ fontSize: '18px', color: '#1a2e1a', fontWeight: 400 }}>SoulGuide</span>
        <button onClick={() => navigate('/auth')} style={{ fontSize: '13px', color: '#4a7a4a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: '60px 24px 48px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#1a2e1a', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#e8c97a" strokeWidth={1.5} style={{ width: '36px', height: '36px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </div>
        <h1 style={{ fontSize: '32px', lineHeight: 1.25, color: '#1a2e1a', marginBottom: '20px', fontWeight: 400 }}>
          You are not lost.<br />You are in transition.
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7, marginBottom: '36px' }}>
          SoulGuide is a daily companion for women navigating life's harder seasons — divorce, grief, empty nest, identity shifts, and quiet reinvention.
        </p>
        <button
          onClick={() => navigate('/auth')}
          style={{ backgroundColor: '#1a2e1a', color: 'white', border: 'none', borderRadius: '100px', padding: '16px 40px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'block', width: '100%', marginBottom: '12px' }}
        >
          Begin your journey — it's free
        </button>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>3 practices free. No credit card needed.</p>
      </section>

      {/* Install the App */}
      <section style={{ padding: '0 24px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#1a2e1a', borderRadius: '20px', padding: '28px 24px' }}>
          <p style={{ fontSize: '13px', color: '#7ab87a', marginBottom: '8px', fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Install the App</p>
          <h3 style={{ fontSize: '20px', color: 'white', marginBottom: '8px', fontWeight: 400 }}>Add SoulGuide to your phone</h3>
          <p style={{ fontSize: '13px', color: '#c8d9c8', lineHeight: 1.6, marginBottom: '24px' }}>
            SoulGuide works like a native app on your phone — no App Store needed. Install it in seconds.
          </p>

          {/* iPhone */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '22px' }}>🍎</span>
              <p style={{ fontSize: '14px', color: '#e8d5a3', fontWeight: 400 }}>iPhone (Safari)</p>
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 16px' }}>
              {[
                'Open soul-guide-client.vercel.app in Safari',
                'Tap the Share button (□↑) at the bottom',
                'Scroll down and tap "Add to Home Screen"',
                'Tap "Add" — done!',
              ].map((step, i) => (
                <li key={i} style={{ fontSize: '12px', color: '#c8d9c8', lineHeight: 1.7 }}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Android */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '22px' }}>🤖</span>
              <p style={{ fontSize: '14px', color: '#e8d5a3', fontWeight: 400 }}>Android (Chrome)</p>
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 16px' }}>
              {[
                'Open soul-guide-client.vercel.app in Chrome',
                'Tap the 3-dot menu (⋮) at the top right',
                'Tap "Add to Home Screen"',
                'Tap "Add" — done!',
              ].map((step, i) => (
                <li key={i} style={{ fontSize: '12px', color: '#c8d9c8', lineHeight: 1.7 }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ padding: '0 24px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f0f5f0', borderRadius: '20px', padding: '28px 24px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#e8c97a', fontSize: '16px' }}>★</span>)}
          </div>
          <p style={{ color: '#2c2c2c', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>
            "I am so grateful for SoulGuide. It takes all the things I have been trying to include in my mindfulness practice and makes them accessible in one place."
          </p>
          <p style={{ color: '#4a7a4a', fontSize: '13px' }}>— Sarah M., navigating divorce</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '0 24px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', color: '#1a2e1a', marginBottom: '28px', fontWeight: 400, textAlign: 'center' }}>How SoulGuide works</h2>
        {[
          { num: '01', title: 'Tell us where you are', body: 'A gentle 5-minute onboarding that helps us understand your specific season — not a generic questionnaire.' },
          { num: '02', title: 'We build your path', body: 'Your personal 30-day practice sequence, selected by AI and shaped around your exact transition and intention.' },
          { num: '03', title: 'Show up daily', body: 'Guided audio practices, a wise AI companion to think out loud with, and monthly reflections on your growth.' },
        ].map(step => (
          <div key={step.num} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e6ede6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', color: '#4a7a4a', fontFamily: 'sans-serif', fontWeight: 500 }}>{step.num}</span>
            </div>
            <div>
              <p style={{ fontSize: '15px', color: '#1a2e1a', marginBottom: '4px' }}>{step.title}</p>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{step.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* What's inside */}
      <section style={{ padding: '0 24px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', color: '#1a2e1a', marginBottom: '24px', fontWeight: 400, textAlign: 'center' }}>What's inside</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '🎧', title: '20+ guided practices', body: 'Across healing, grief, identity, faith, joy and stillness' },
            { icon: '🤖', title: 'AI companion', body: 'A wise presence available whenever you need to think out loud' },
            { icon: '🌱', title: 'Daily rituals', body: 'A new anchor practice every morning' },
            { icon: '📓', title: 'Growth Mirror', body: 'A personal monthly letter on how you have grown' },
            { icon: '🗺️', title: '30-day path', body: 'A personalized sequence built around your transition' },
            { icon: '💡', title: 'Reflections', body: 'Guided prompts after each practice' },
          ].map(f => (
            <div key={f.title} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
              <p style={{ fontSize: '13px', color: '#1a2e1a', marginBottom: '4px' }}>{f.title}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '0 24px 48px', maxWidth: '480px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', color: '#1a2e1a', marginBottom: '8px', fontWeight: 400, textAlign: 'center' }}>Simple, honest pricing</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginBottom: '24px' }}>Start free. Upgrade when you're ready.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Free</p>
            <p style={{ fontSize: '28px', color: '#1a2e1a', marginBottom: '12px', fontWeight: 400 }}>$0</p>
            {['3 guided practices', 'Daily ritual', 'Onboarding path'].map(f => (
              <p key={f} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>✓ {f}</p>
            ))}
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Monthly</p>
            <p style={{ fontSize: '28px', color: '#1a2e1a', marginBottom: '4px', fontWeight: 400 }}>$9.99</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>per month</p>
            {['All 20+ practices', 'AI companion', '30-day path', 'Reflections'].map(f => (
              <p key={f} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>✓ {f}</p>
            ))}
            <a href={MONTHLY_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', marginTop: '16px', padding: '10px', borderRadius: '12px', border: '1px solid #1a2e1a', color: '#1a2e1a', fontSize: '12px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Georgia, serif' }}>
              Get monthly
            </a>
          </div>
        </div>

        <div style={{ backgroundColor: '#1a2e1a', borderRadius: '16px', padding: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#e8c97a', color: '#1a2e1a', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
            BEST VALUE — SAVE 42%
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#7ab87a', marginBottom: '4px' }}>Annual</p>
              <p style={{ fontSize: '32px', color: 'white', fontWeight: 400 }}>$69.99</p>
              <p style={{ fontSize: '11px', color: '#7ab87a' }}>per year · just $5.83/month</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {['All 20+ practices', 'AI companion', 'Growth Mirror', '30-day path', 'Reflections'].map(f => (
                <p key={f} style={{ fontSize: '12px', color: '#c8d9c8', marginBottom: '4px' }}>✓ {f}</p>
              ))}
            </div>
          </div>
          <a href={ANNUAL_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: '14px', borderRadius: '12px', backgroundColor: '#e8c97a', color: '#1a2e1a', fontSize: '15px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Georgia, serif' }}>
            Get Annual Access — $69.99/year
          </a>
        </div>
        <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '12px' }}>
          Secure payment via Selar · Instant access after payment
        </p>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '0 24px 48px', maxWidth: '480px', margin: '0 auto' }}>
        {[
          { quote: 'A beautiful reprieve from the anxiety that can hijack my thoughts. A truly worthy investment.', name: 'Margaret T.' },
          { quote: 'I LOVE the SoulGuide app! It has changed my life.', name: 'Jennifer K.' },
        ].map(t => (
          <div key={t.name} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0', marginBottom: '12px' }}>
            <div style={{ marginBottom: '10px' }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#e8c97a', fontSize: '14px' }}>★</span>)}</div>
            <p style={{ fontSize: '14px', color: '#2c2c2c', lineHeight: 1.6, marginBottom: '10px', fontStyle: 'italic' }}>"{t.quote}"</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>— {t.name}</p>
          </div>
        ))}
      </section>

      {/* Final CTA */}
      <section style={{ padding: '0 24px 80px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '26px', color: '#1a2e1a', marginBottom: '16px', fontWeight: 400 }}>
          You showed up.<br />That's everything.
        </h2>
        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, marginBottom: '32px' }}>
          Begin with 3 free practices. No credit card. No commitment.
        </p>
        <button
          onClick={() => navigate('/auth')}
          style={{ backgroundColor: '#1a2e1a', color: 'white', border: 'none', borderRadius: '100px', padding: '18px 40px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'block', width: '100%', marginBottom: '12px' }}
        >
          Start for free
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <a href={MONTHLY_URL} target="_blank" rel="noopener noreferrer"
            style={{ backgroundColor: 'transparent', color: '#4a7a4a', border: '1px solid #4a7a4a', borderRadius: '100px', padding: '14px 16px', fontSize: '13px', fontFamily: 'Georgia, serif', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Monthly — $9.99
          </a>
          <a href={ANNUAL_URL} target="_blank" rel="noopener noreferrer"
            style={{ backgroundColor: '#4a7a4a', color: 'white', border: 'none', borderRadius: '100px', padding: '14px 16px', fontSize: '13px', fontFamily: 'Georgia, serif', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Annual — $69.99
          </a>
        </div>
      </section>

      <footer style={{ padding: '24px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>© 2026 SoulGuide. Built with care for women in transition.</p>
      </footer>

    </div>
  );
}
