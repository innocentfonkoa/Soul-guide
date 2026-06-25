// client/src/pages/Journey.tsx
// Full replacement

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { journeyApi } from '../lib/api';

interface Practice {
  id: string;
  title: string;
  category: string;
  durationMin: number;
}

interface PathItem {
  id: string;
  dayNumber: number;
  completed: boolean;   // matches schema field name
  practice: Practice;
}

interface PathData {
  id: string;
  title: string;
  intention: string;
  startDate: string;
  endDate: string;
  items: PathItem[];
}

interface PathResponse {
  path: PathData;
  currentDay: number;
  progress: { completed: number; total: number };
}

interface Stats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  topThemes: { theme: string; count: number }[];
}

const PHASE_LABELS: Record<string, string> = {
  intro:     'Getting Started',
  build:     'Building Momentum',
  deepen:    'Going Deeper',
  integrate: 'Integration',
};

function getPhase(day: number): string {
  if (day <= 5)  return 'intro';
  if (day <= 14) return 'build';
  if (day <= 24) return 'deepen';
  return 'integrate';
}

const PHASE_PILL: Record<string, string> = {
  intro:     'bg-purple-100 text-purple-600',
  build:     'bg-rose-100 text-rose-600',
  deepen:    'bg-amber-100 text-amber-600',
  integrate: 'bg-emerald-100 text-emerald-600',
};

export default function Journey() {
  const navigate = useNavigate();
  const { token } = useStore();
  const API = import.meta.env.VITE_API_URL || 'https://soul-guide-production.up.railway.app';

  const [tab, setTab] = useState<'stats' | 'path'>('stats');

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Path
  const [pathData, setPathData] = useState<PathResponse | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pathFetched, setPathFetched] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/journey/stats`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  };

  const fetchPath = async () => {
    setPathLoading(true);
    setPathError('');
    try {
      const res = await fetch(`${API}/api/path`, { headers });
      if (res.status === 404) { setPathData(null); }
      else if (!res.ok) throw new Error('Could not load your path');
      else setPathData(await res.json());
    } catch (e: any) {
      setPathError(e.message || 'Something went wrong');
    } finally {
      setPathLoading(false);
      setPathFetched(true);
    }
  };

  const generatePath = async () => {
    setGenerating(true);
    setPathError('');
    try {
      const res = await fetch(`${API}/api/path/generate`, { method: 'POST', headers });
      if (!res.ok) throw new Error('Could not generate your path');
      setPathData(await res.json());
    } catch (e: any) {
      setPathError(e.message || 'Generation failed');
    } finally { setGenerating(false); }
  };

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'path' && !pathFetched) fetchPath();
  }, [tab]);

  // Group 30 items into weeks
  const weeks = pathData
    ? [0, 1, 2, 3].map(wi =>
        pathData.path.items.filter(
          i => i.dayNumber >= wi * 7 + 1 && i.dayNumber <= wi * 7 + 7
        )
      ).filter(w => w.length > 0)
    : [];

  const topTheme = stats?.topThemes?.[0]?.theme || '—';

  return (
    <div className="min-h-screen pb-24" style={{ background: '#fdf8f6' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-serif text-2xl text-charcoal">Your Journey</h1>
        <p className="text-sm text-gray-400 mt-1">Watch yourself grow, one practice at a time</p>
      </div>

      {/* Tab switcher */}
      <div className="px-5 mb-5">
        <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {(['stats', 'path'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-charcoal text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'stats' ? 'Stats' : 'My Path'}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS TAB ── */}
      {tab === 'stats' && (
        <div className="px-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total practices', value: statsLoading ? '…' : stats?.totalCompleted ?? 0, color: 'text-charcoal' },
              { label: 'Day streak 🔥',   value: statsLoading ? '…' : stats?.currentStreak ?? 0,  color: 'text-teal-600' },
              { label: 'Longest streak',  value: statsLoading ? '…' : stats?.longestStreak ?? 0,  color: 'text-charcoal' },
              { label: 'Top theme',       value: statsLoading ? '…' : topTheme,                   color: 'text-orange-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
                <p className={`font-bold text-3xl ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Growth Mirror */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Growth Mirror</p>
            <div className="flex flex-col items-center py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                <span className="text-xl">🤍</span>
              </div>
              <p className="font-semibold text-charcoal text-lg">Your Growth Mirror</p>
              <p className="text-sm text-purple-500 mt-2 leading-relaxed max-w-xs">
                Your monthly reflection letter unlocks at the end of each month.<br />
                Keep practicing — it's watching.
              </p>
            </div>
          </div>

          {/* CTA to path tab */}
          <button
            onClick={() => setTab('path')}
            className="w-full rounded-2xl p-5 shadow-md text-left"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #e11d48)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-base">Your 30-Day Path</p>
                <p className="text-white/80 text-sm mt-0.5">See your personalised practice plan →</p>
              </div>
              <span className="text-3xl">🗺️</span>
            </div>
          </button>
        </div>
      )}

      {/* ── MY PATH TAB ── */}
      {tab === 'path' && (
        <div className="px-5">

          {pathLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Loading your path...</p>
            </div>
          )}

          {!pathLoading && pathError && (
            <div className="bg-red-50 rounded-2xl p-5 text-center">
              <p className="text-red-500 text-sm mb-3">{pathError}</p>
              <button onClick={fetchPath} className="text-sm text-red-600 underline">Try again</button>
            </div>
          )}

          {!pathLoading && !pathError && !pathData && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 text-center">
              <div className="text-5xl mb-4">🌿</div>
              <h2 className="font-serif text-xl text-charcoal mb-2">Your Path Awaits</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Generate your personalised 30-day wellbeing journey based on your focus areas.
              </p>
              <button
                onClick={generatePath}
                disabled={generating}
                className="bg-charcoal text-white px-8 py-3 rounded-2xl font-semibold text-sm disabled:opacity-50 hover:bg-gray-700 transition"
              >
                {generating
                  ? <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating your path...
                    </span>
                  : 'Begin My 30-Day Journey'}
              </button>
            </div>
          )}

          {!pathLoading && !pathError && pathData && (() => {
            const { path, currentDay, progress } = pathData;
            const pct = Math.round((progress.completed / progress.total) * 100);
            return (
              <div className="space-y-5">

                {/* Progress bar */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-charcoal">Day {currentDay} of 30</p>
                      <p className="text-xs text-gray-400">{progress.completed} practices completed</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{pct}%</p>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: 'linear-gradient(to right,#7c3aed,#e11d48)' }}
                    />
                  </div>
                </div>

                {/* Weeks */}
                {weeks.map((week, wi) => {
                  const phase = getPhase(week[0]?.dayNumber ?? 1);
                  return (
                    <div key={wi}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Week {wi + 1}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${PHASE_PILL[phase]}`}>
                          {PHASE_LABELS[phase]}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {week.map(item => {
                          const isToday  = item.dayNumber === currentDay;
                          const isFuture = item.dayNumber > currentDay;
                          const isDone   = item.completed;
                          return (
                            <div
                              key={item.id}
                              onClick={() => !isFuture && navigate(`/library/${item.practice.id}`)}
                              className={`
                                flex items-center gap-4 p-4 rounded-2xl border transition-all
                                ${isDone   ? 'bg-emerald-50 border-emerald-100' : ''}
                                ${isToday && !isDone ? 'bg-purple-50 border-purple-200 shadow-md' : ''}
                                ${!isToday && !isDone && !isFuture ? 'bg-white border-gray-100' : ''}
                                ${isFuture ? 'bg-white/50 border-gray-50 opacity-50' : 'cursor-pointer'}
                              `}
                            >
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                                ${isDone   ? 'bg-emerald-500 text-white' : ''}
                                ${isToday && !isDone ? 'bg-charcoal text-white' : ''}
                                ${!isToday && !isDone ? 'bg-gray-100 text-gray-500' : ''}
                              `}>
                                {isDone ? '✓' : item.dayNumber}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${isToday ? 'text-purple-800' : 'text-charcoal'}`}>
                                  {item.practice.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.practice.category} · {item.practice.durationMin} min
                                </p>
                              </div>
                              {!isFuture && <span className="text-gray-300 text-lg shrink-0">›</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="text-center pb-4">
                  <button
                    onClick={generatePath}
                    disabled={generating}
                    className="text-xs text-gray-400 underline hover:text-gray-600 disabled:opacity-50"
                  >
                    {generating ? 'Regenerating...' : 'Regenerate my path'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
