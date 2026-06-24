import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Practice, useStore } from '../store/useStore';
import { practicesApi } from '../lib/api';
import { categoryColor, categoryBgColor } from '../lib/utils';
import PracticeCard from '../components/PracticeCard';
import AudioPlayer from '../components/AudioPlayer';

const FREE_PRACTICE_LIMIT = 3;
const categories = ['all', 'healing', 'identity', 'grief', 'faith', 'connection', 'joy', 'stillness'];

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-3xl w-full mx-4 p-6 text-center" style={{ backgroundColor: '#fdfaf7', maxWidth: '400px' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e6ede6' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#4a7a4a" strokeWidth={1.5} className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 className="font-serif text-xl mb-2" style={{ color: '#2c2c2c' }}>
          You've explored 3 free practices
        </h3>
        <p className="text-sm mb-6" style={{ color: '#6b7280', lineHeight: 1.6 }}>
          Unlock all 20 practices, your AI companion, and monthly Growth Mirror for just $69.99/year.
        </p>
        <button
          onClick={() => { window.location.href = 'https://selar.com/2b3820q571'; }}
          className="w-full py-4 rounded-2xl text-white font-medium mb-3"
          style={{ backgroundColor: '#1a2e1a' }}
        >
          Unlock full access — $69.99/year
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm"
          style={{ color: '#6b7280' }}
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
              style={{ backgroundColor: '#1a2e1a' }}
            >
              Unlock all practices — $69.99/year
            </button>
          </div>
        ) : (
          <button
            onClick={handleBegin}
            className="w-full py-4 rounded-2xl text-white font-medium text-lg flex items-center justify-center gap-3 shadow-md"
            style={{ backgroundColor: '#4a7a4a' }}
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
                    <PracticeCard
                      practice={p}
                      onClick={() => navigate(`/library/${p.id}`)}
                    />
                    {isLocked && (
                      <div
                        className="absolute inset-0 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                      >
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