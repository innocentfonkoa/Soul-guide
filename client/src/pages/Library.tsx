import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Practice, useStore } from '../store/useStore';
import { practicesApi } from '../lib/api';
import { categoryColor, categoryBgColor } from '../lib/utils';
import PracticeCard from '../components/PracticeCard';
import AudioPlayer from '../components/AudioPlayer';

const FREE_PRACTICE_LIMIT = 3;
const MONTHLY_URL = 'https://selar.com/s641241t38';
const ANNUAL_URL  = 'https://selar.com/2b3820q571';
const categories = ['all', 'healing', 'identity', 'grief', 'faith', 'connection', 'joy', 'stillness'];

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-3xl w-full p-6" style={{ backgroundColor: '#fdfaf7', maxWidth: '480px' }}>

        {/* Header */}
        <div className="text-center mb-6">
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌸</div>
          <h3 className="font-serif text-xl mb-2" style={{ color: '#1a2e1a' }}>Unlock Full Access</h3>
          <p className="text-sm" style={{ color: '#6b7280', lineHeight: 1.6 }}>
            You've completed your 3 free practices.<br />Choose a plan to continue your journey.
          </p>
        </div>

        {/* Monthly option */}
        <a
          href={MONTHLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '10px', textDecoration: 'none', backgroundColor: 'white' }}
        >
          <div>
            <p style={{ fontSize: '15px', color: '#1a2e1a', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>Monthly</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Renew anytime · no lock-in</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '20px', color: '#1a2e1a', fontFamily: 'Georgia, serif' }}>$9.99</p>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>/month</p>
          </div>
        </a>

        {/* Annual option — highlighted */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '16px', backgroundColor: '#e8c97a', color: '#1a2e1a', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', fontFamily: 'sans-serif' }}>
            BEST VALUE — SAVE 42%
          </div>
          <a
            href={ANNUAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', border: '2px solid #1a2e1a', textDecoration: 'none', backgroundColor: '#f0f5f0' }}
          >
            <div>
              <p style={{ fontSize: '15px', color: '#1a2e1a', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>Annual</p>
              <p style={{ fontSize: '12px', color: '#4a7a4a' }}>Just $5.83/month</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '20px', color: '#1a2e1a', fontFamily: 'Georgia, serif' }}>$69.99</p>
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>/year</p>
            </div>
          </a>
        </div>

        {/* After payment note */}
        <div style={{ backgroundColor: '#fef9ec', borderRadius: '12px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#92710a', lineHeight: 1.5 }}>
            After payment, <strong>log out and log back in</strong> to activate your access instantly.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm"
          style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

function PracticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!id) return;
    practicesApi.getById(id).then(setPractice).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleBegin = () => {
    if (user?.subscriptionActive) {
      setShowPlayer(true);
      return;
    }
    const usedPractices = parseInt(localStorage.getItem('sg_free_used') || '0');
    if (usedPractices >= FREE_PRACTICE_LIMIT) {
      setShowPaywall(true);
    } else {
      setShowPlayer(true);
    }
  };

  const handleComplete = () => {
    if (!user?.subscriptionActive) {
      const used = parseInt(localStorage.getItem('sg_free_used') || '0');
      localStorage.setItem('sg_free_used', String(used + 1));
    }
    setShowPlayer(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdfaf7' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4a7a4a', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdfaf7' }}>
        <p style={{ color: '#6b7280' }}>Practice not found</p>
      </div>
    );
  }

  const usedPractices = parseInt(localStorage.getItem('sg_free_used') || '0');
  const isLocked = !user?.subscriptionActive && usedPractices >= FREE_PRACTICE_LIMIT;

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#fdfaf7' }}>
      <div className={`h-2 ${categoryColor(practice.category).replace('border-', 'bg-')}`} />
      <div className="px-5 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: '#6b7280' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBgColor(practice.category)} mb-4 inline-block`}>
          {practice.category}
        </span>

        <h1 className="font-serif text-2xl mb-3" style={{ color: '#2c2c2c' }}>{practice.title}</h1>
        <p className="leading-relaxed mb-4" style={{ color: '#6b7280' }}>{practice.description}</p>

        <div className="flex items-center gap-4 text-sm mb-8" style={{ color: '#9ca3af' }}>
          <span>{practice.durationMin} minutes</span>
          {practice.guideBy && <span>with {practice.guideBy}</span>}
          <span className="capitalize">{practice.theme}</span>
        </div>

        {isLocked ? (
          <div>
            <div className="w-full py-4 rounded-2xl text-center mb-3" style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
              🔒 Practice locked
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-4 rounded-2xl text-white font-medium"
              style={{ backgroundColor: '#1a2e1a', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '15px' }}
            >
              Unlock all practices
            </button>
          </div>
        ) : (
          <button
            onClick={handleBegin}
            className="w-full py-4 rounded-2xl text-white font-medium text-lg flex items-center justify-center gap-3 shadow-md"
            style={{ backgroundColor: '#4a7a4a', border: 'none', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
            Begin practice
          </button>
        )}

        {!user?.subscriptionActive && !isLocked && (
          <p className="text-center text-xs mt-3" style={{ color: '#9ca3af' }}>
            {FREE_PRACTICE_LIMIT - usedPractices} free {FREE_PRACTICE_LIMIT - usedPractices === 1 ? 'practice' : 'practices'} remaining
          </p>
        )}
      </div>

      {showPlayer && (
        <AudioPlayer
          practice={practice}
          onClose={() => setShowPlayer(false)}
          onComplete={handleComplete}
        />
      )}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const { user } = useStore();
  const { id } = useParams<{ id?: string }>();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setPractices([]);
    loadPractices(1, true);
  }, [search, activeCategory]);

  const loadPractices = async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum };
      if (search) params.search = search;
      if (activeCategory !== 'all') params.category = activeCategory;
      const result = await practicesApi.getAll(params);
      if (reset) {
        setPractices(result.practices);
      } else {
        setPractices((prev) => [...prev, ...result.practices]);
      }
      setHasMore(pageNum < result.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPractices(next);
  };

  const usedPractices = parseInt(localStorage.getItem('sg_free_used') || '0');
  if (id) return <PracticeDetail />;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#fdfaf7' }}>
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-2xl" style={{ color: '#2c2c2c' }}>Library</h1>
          {!user?.subscriptionActive && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#e6ede6', color: '#4a7a4a' }}>
              {Math.max(0, FREE_PRACTICE_LIMIT - usedPractices)} free left
            </span>
          )}
        </div>

        <div className="relative mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search practices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: '#e5e7eb', backgroundColor: 'white', color: '#2c2c2c' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors"
              style={{
                backgroundColor: activeCategory === cat ? '#4a7a4a' : 'white',
                color: activeCategory === cat ? 'white' : '#6b7280',
                border: `1px solid ${activeCategory === cat ? '#4a7a4a' : '#e5e7eb'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {loading && practices.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4a7a4a', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {practices.map((p, index) => {
                const isLocked = !user?.subscriptionActive && index >= FREE_PRACTICE_LIMIT && usedPractices >= FREE_PRACTICE_LIMIT;
                return (
                  <div key={p.id} className="relative">
                    <PracticeCard practice={p} onClick={() => navigate(`/library/${p.id}`)} />
                    {isLocked && (
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                        <span style={{ fontSize: '24px' }}>🔒</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {practices.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: '#9ca3af' }}>No practices found</p>
              </div>
            )}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl border text-sm transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
