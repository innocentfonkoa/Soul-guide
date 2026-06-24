import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Practice } from '../store/useStore';
import { practicesApi } from '../lib/api';
import { categoryColor, categoryBgColor } from '../lib/utils';
import PracticeCard from '../components/PracticeCard';
import AudioPlayer from '../components/AudioPlayer';

const categories = ['all', 'healing', 'identity', 'grief', 'faith', 'connection', 'joy', 'stillness'];

function PracticeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (!id) return;
    practicesApi.getById(id).then(setPractice).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-500">Practice not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-8">
      <div className={`h-2 ${categoryColor(practice.category).replace('border-', 'bg-')}`} />

      <div className="px-5 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-charcoal transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBgColor(practice.category)} mb-4 inline-block`}>
          {practice.category}
        </span>

        <h1 className="font-serif text-2xl text-charcoal mb-3">{practice.title}</h1>
        <p className="text-gray-600 leading-relaxed mb-4">{practice.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span>{practice.durationMin} minutes</span>
          {practice.guideBy && <span>with {practice.guideBy}</span>}
          <span className="capitalize">{practice.theme}</span>
        </div>

        <button
          onClick={() => setShowPlayer(true)}
          className="w-full py-4 rounded-2xl bg-sage-600 text-white font-medium text-lg flex items-center justify-center gap-3 hover:bg-sage-900 transition-colors shadow-md"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
          Begin practice
        </button>
      </div>

      {showPlayer && (
        <AudioPlayer
          practice={practice}
          onClose={() => setShowPlayer(false)}
          onComplete={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
}

export default function Library() {
  const navigate = useNavigate();
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

  if (id) {
    return <PracticeDetail />;
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-charcoal mb-4">Library</h1>

        <div className="relative mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search practices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? 'bg-sage-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-sage-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {loading && practices.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {practices.map((p) => (
                <PracticeCard
                  key={p.id}
                  practice={p}
                  onClick={() => navigate(`/library/${p.id}`)}
                />
              ))}
            </div>

            {practices.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No practices found</p>
              </div>
            )}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-sage-400 hover:text-sage-600 transition-colors"
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
