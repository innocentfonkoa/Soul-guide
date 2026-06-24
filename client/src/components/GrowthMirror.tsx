interface GrowthMirrorProps {
  insight: {
    insight: string;
    themes: string[];
    practiceCount: number;
    month: number;
    year: number;
  } | null;
  locked?: boolean;
}

export default function GrowthMirror({ insight, locked = false }: GrowthMirrorProps) {
  const monthName = insight
    ? new Date(insight.year, insight.month - 1, 1).toLocaleString('default', { month: 'long' })
    : '';

  if (locked || !insight) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center">
        <div className="w-12 h-12 rounded-full bg-clay-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-clay-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h4 className="font-serif text-lg text-charcoal mb-1">Your Growth Mirror</h4>
        <p className="text-gray-500 text-sm">
          Your monthly reflection letter unlocks at the end of each month. Keep practicing — it's watching.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-clay-50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-clay-500" />
        <span className="text-xs font-medium text-clay-700 uppercase tracking-wider">
          {monthName} {insight.year} · Growth Mirror
        </span>
      </div>

      <div className="font-serif text-charcoal text-sm leading-relaxed whitespace-pre-wrap mb-4">
        {insight.insight}
      </div>

      <div className="border-t border-clay-200 pt-4">
        <div className="flex items-center justify-between text-xs text-clay-700">
          <span>{insight.practiceCount} practice{insight.practiceCount !== 1 ? 's' : ''} this month</span>
          <div className="flex gap-1 flex-wrap justify-end">
            {insight.themes.slice(0, 3).map((theme) => (
              <span key={theme} className="bg-clay-100 text-clay-700 px-2 py-0.5 rounded-full">
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
