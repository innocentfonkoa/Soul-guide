import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const transitionLabels: Record<string, string> = {
  divorce: 'Divorce or separation',
  loss: 'Loss or grief',
  'empty-nest': 'Empty nest',
  retirement: 'Retirement',
  career: 'Career change',
  health: 'Health journey',
};

const intentionLabels: Record<string, string> = {
  'find-peace': 'Find inner peace',
  'heal-grief': 'Heal through grief',
  'rediscover-self': 'Rediscover who I am',
  'rebuild-joy': 'Rebuild joy',
  'deepen-faith': 'Deepen my faith',
  'build-resilience': 'Build resilience',
};

export default function Profile() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-serif text-2xl text-charcoal">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-xl text-sage-600">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <h2 className="font-serif text-xl text-charcoal">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-xs text-gray-300 mt-0.5">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Journey summary */}
      <div className="px-5 mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Your Journey</p>
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          {user?.transitionType && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Life transition</span>
              <span className="text-sm font-medium text-charcoal">
                {transitionLabels[user.transitionType] || user.transitionType}
              </span>
            </div>
          )}
          {user?.primaryIntention && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Intention</span>
              <span className="text-sm font-medium text-charcoal">
                {intentionLabels[user.primaryIntention] || user.primaryIntention}
              </span>
            </div>
          )}
          {user?.morningOrEvening && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Practice time</span>
              <span className="text-sm font-medium text-charcoal capitalize">{user.morningOrEvening}</span>
            </div>
          )}
          {user?.practiceMinutes && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Session length</span>
              <span className="text-sm font-medium text-charcoal">{user.practiceMinutes} minutes</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-red-100 text-red-400 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
