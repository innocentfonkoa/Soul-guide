import { Practice } from '../store/useStore';
import { categoryColor, categoryBgColor } from '../lib/utils';

interface PracticeCardProps {
  practice: Practice;
  onClick?: () => void;
  compact?: boolean;
}

export default function PracticeCard({ practice, onClick, compact = false }: PracticeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border-l-4 ${categoryColor(practice.category)} shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 ${compact ? 'min-w-[200px]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-charcoal text-sm leading-snug line-clamp-2">{practice.title}</h3>
          {!compact && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{practice.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryBgColor(practice.category)}`}>
          {practice.category}
        </span>
        <span className="text-xs text-gray-400">{practice.durationMin} min</span>
        {practice.guideBy && (
          <span className="text-xs text-gray-400 truncate">with {practice.guideBy}</span>
        )}
      </div>
    </div>
  );
}
