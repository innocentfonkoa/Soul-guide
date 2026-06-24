export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    healing: 'border-clay-500',
    identity: 'border-sage-600',
    grief: 'border-purple-500',
    faith: 'border-indigo-500',
    connection: 'border-teal-500',
    joy: 'border-amber-500',
    stillness: 'border-gray-400',
  };
  return colors[category] || 'border-gray-300';
}

export function categoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    healing: 'bg-clay-50 text-clay-700',
    identity: 'bg-sage-50 text-sage-600',
    grief: 'bg-purple-50 text-purple-700',
    faith: 'bg-indigo-50 text-indigo-700',
    connection: 'bg-teal-50 text-teal-700',
    joy: 'bg-amber-50 text-amber-700',
    stillness: 'bg-gray-50 text-gray-600',
  };
  return colors[category] || 'bg-gray-50 text-gray-600';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
