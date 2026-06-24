import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import PracticeCard from '../components/PracticeCard';
import AudioPlayer from '../components/AudioPlayer';

const API_URL = 'https://soul-guide-production.up.railway.app';

interface Practice {
  id: string;
  title: string;
  description: string;
  category: string;
  theme: string;
  durationMin: number;
  audioUrl?: string;
  guideBy?: string;
  isPremium: boolean;
  isDaily: boolean;
}

export default function Home() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [dailyPractice, setDailyPractice] = useState<Practice | null>(null);
  const [forYouPractices, setForYouPractices] = useState<Practice[]>([]);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);

  const getToken = () => {
    try {
      return JSON.parse(localStorage.getItem('soulguide-store') || '{}')?.state?.token;
    } catch {
      return null;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  useEffect(() => {
    const fetchPractices = async () => {
      const token = getToken();
      try {
        const [dailyRes, forYouRes] = await Promise.all([
          fetch(`${API_URL}/api/practices/daily`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/practices/for-you`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (dailyRes.ok) setDailyPractice(await dailyRes.json());
        if (forYouRes.ok) setForYouPractices(await forYouRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchPractices();
  }, []);

  const handleSubscribe = async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/subscription/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#fdfaf7' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-sm text-gray-400">{getGreeting()}</p>
        <h1 className="text-3xl font-serif text-charcoal">{user?.name}</h1>
      </div>

      {/* Subscription Banner */}
      {!user?.subscriptionActive && (
        <div className="px-5 mb-6">
          <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#1a2e1a' }}>
            <p className="text-white font-serif text-lg mb-1">Unlock Full Access</p>
            <p className="text-sm mb-4" style={{ color: '#c8d9c8' }}>
              Unlimited practices, AI companion and Growth Mirror for $69.99/year
            </p>
            <button
              onClick={handleSubscribe}
              className="bg-white font-medium px-6 py-2 rounded-full text-sm"
              style={{ color: '#1a2e1a' }}
            >
              Start my year
            </button>
          </div>
        </div>
      )}

      {/* Today's Practice */}
      {dailyPractice && (
        <div className="px-5 mb-6">
          <p className="text-xs font-medium tracking-widest text-gray-400 mb-3">TODAY'S PRACTICE</p>
          <div
            className="rounded-2xl p-5 flex items-center justify-between cursor-pointer"
            style={{ backgroundColor: '#e6ede6' }}
            onClick={() => setActivePractice(dailyPractice)}
          >
            <div className="flex-1">
              <h2 className="font-serif text-xl text-charcoal mb-1">{dailyPractice.title}</h2>
              <p className="text-sm text-gray-500 mb-2">{dailyPractice.description}</p>
              <p className="text-xs text-gray-400">{dailyPractice.durationMin} min</p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center ml-4 flex-shrink-0"
              style={{ backgroundColor: '#4a7a4a' }}
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* For You */}
      {forYouPractices.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium tracking-widest text-gray-400 mb-3 px-5">FOR YOU</p>
          <div className="flex gap-4 px-5 overflow-x-auto pb-2">
            {forYouPractices.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                onClick={() => setActivePractice(practice)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Daily Ritual Strip */}
      <div className="px-5">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-clay-50 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-clay-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">Daily ritual</p>
              <p className="text-xs text-gray-400">Build a gentle daily habit</p>
            </div>
            <button
              onClick={() => navigate('/library')}
              className="text-xs text-sage-600 font-medium hover:underline"
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {activePractice && (
        <AudioPlayer
          practice={activePractice}
          onClose={() => setActivePractice(null)}
          onComplete={() => setActivePractice(null)}
        />
      )}
    </div>
  );
}