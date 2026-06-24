import { useEffect, useState } from 'react';
import { journeyApi, insightsApi } from '../lib/api';
import GrowthMirror from '../components/GrowthMirror';
import { Practice } from '../store/useStore';

interface PathItem {
  id: string;
  dayNumber: number;
  completed: boolean;
  practice: Practice;
}

interface PracticePath {
  id: string;
  title: string;
  intention: string;
  startDate: string;
  endDate: string;
  items: PathItem[];
}

interface Stats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  topThemes: { theme: string; count: number }[];
  topCategories: { category: string; count: number }[];
}

interface Insight {
  id: string;
  insight: string;
  themes: string[];
  practiceCount: number;
  month: number;
  year: number;
}

interface Reflection {
  id: string;
  prompt: string;
  response: string;
  themes: string[];
  createdAt: string;
}

export default function Journey() {
  const [path, setPath] = useState<PracticePath | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReflections, setShowReflections] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pathData, statsData, insightData, historyData] = await Promise.all([
          journeyApi.getPath().catch(() => null),
          journeyApi.getStats().catch(() => null),
          insightsApi.getMonthly().catch(() => null),
          journeyApi.getHistory().catch(() => ({})),
        ]);
        setPath(pathData);
        setStats(statsData);
        setInsight(insightData);

        // Flatten history into reflections (simplified — using completed practices as proxy)
        const allReflections: Reflection[] = [];
        Object.values(historyData as Record<string, unknown[]>).forEach((week) => {
          (week as Reflection[]).forEach((item) => {
            if (item.prompt) allReflections.push(item);
          });
        });
        setReflections(allReflections.slice(0, 10));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentDay = path
    ? Math.floor((new Date().getTime() - new Date(path.startDate).getTime()) / 86400000) + 1
    : 0;

  const completedCount = path?.items.filter((i) => i.completed).length || 0;
  const progressPercent = path ? (completedCount / 30) * 100 : 0;

  const now = new Date();
  const isMonthEnd = now.getDate() >= 28;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-charcoal mb-1">Your Journey</h1>
        <p className="text-gray-400 text-sm">Watch yourself grow, one practice at a time</p>
      </div>

      {/* Path progress */}
      {path && (
        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Your Path</p>
                <h3 className="font-serif text-lg text-charcoal">{path.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-sage-600">{Math.min(currentDay, 30)}</p>
                <p className="text-xs text-gray-400">of 30 days</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-sage-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{completedCount} practices completed</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {stats && (
        <div className="px-5 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-3xl font-semibold text-charcoal">{stats.totalCompleted}</p>
              <p className="text-xs text-gray-400 mt-1">Total practices</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-3xl font-semibold text-sage-600">{stats.currentStreak}</p>
              <p className="text-xs text-gray-400 mt-1">Day streak 🔥</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-3xl font-semibold text-charcoal">{stats.longestStreak}</p>
              <p className="text-xs text-gray-400 mt-1">Longest streak</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-lg font-semibold text-clay-500 capitalize">
                {stats.topThemes[0]?.theme || '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Top theme</p>
            </div>
          </div>
        </div>
      )}

      {/* Growth Mirror */}
      <div className="px-5 mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Growth Mirror</p>
        <GrowthMirror insight={insight} locked={!insight && !isMonthEnd} />
      </div>

      {/* Reflection history */}
      {reflections.length > 0 && (
        <div className="px-5">
          <button
            onClick={() => setShowReflections(!showReflections)}
            className="flex items-center justify-between w-full mb-3"
          >
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Reflections ({reflections.length})
            </p>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`w-4 h-4 text-gray-400 transition-transform ${showReflections ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showReflections && (
            <div className="space-y-3">
              {reflections.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1 italic">{r.prompt}</p>
                  <p className="text-sm text-charcoal leading-relaxed">{r.response}</p>
                  {r.themes.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {r.themes.map((t) => (
                        <span key={t} className="text-xs bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
