import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authApi, onboardingApi } from '../lib/api';
import OnboardingStep from '../components/OnboardingStep';

const TOTAL_STEPS = 5;

const transitionTypes = [
  { id: 'divorce', label: 'Divorce or separation', emoji: '💔' },
  { id: 'loss', label: 'Loss or grief', emoji: '🕊' },
  { id: 'empty-nest', label: 'Empty nest', emoji: '🪹' },
  { id: 'retirement', label: 'Retirement', emoji: '🌅' },
  { id: 'career', label: 'Career change', emoji: '🔄' },
  { id: 'health', label: 'Health journey', emoji: '🌿' },
];

const intentions = [
  { id: 'find-peace', label: 'Find inner peace' },
  { id: 'heal-grief', label: 'Heal through grief' },
  { id: 'rediscover-self', label: 'Rediscover who I am' },
  { id: 'rebuild-joy', label: 'Rebuild joy' },
  { id: 'deepen-faith', label: 'Deepen my faith' },
  { id: 'build-resilience', label: 'Build resilience' },
];

const loadingMessages = [
  'Listening to your story...',
  'Gathering practices that speak to your journey...',
  'Weaving your personal path...',
  'Almost ready...',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setToken, setUser, user } = useStore();

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Onboarding state
  const [step, setStep] = useState(1);
  const [transitionType, setTransitionType] = useState('');
  const [primaryIntention, setPrimaryIntention] = useState('');
  const [morningOrEvening, setMorningOrEvening] = useState('');
  const [practiceMinutes, setPracticeMinutes] = useState(10);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      let result;
      if (isLogin) {
        result = await authApi.login(email, password);
      } else {
        result = await authApi.register(email, password, name);
      }
      setToken(result.token);
      setUser(result.user);
      if (result.user.onboardingDone) {
        navigate('/home');
      } else {
        setStep(2);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setAuthError(error.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTransitionNext = async () => {
    try {
      await authApi.updateOnboarding({ transitionType });
    } catch { /* continue */ }
    setStep(3);
  };

  const handleIntentionNext = async () => {
    try {
      await authApi.updateOnboarding({ primaryIntention });
    } catch { /* continue */ }
    setStep(4);
  };

  const handleScheduleNext = async () => {
    try {
      await authApi.updateOnboarding({ morningOrEvening, practiceMinutes });
    } catch { /* continue */ }
    setStep(5);
    startPathGeneration();
  };

  const startPathGeneration = async () => {
    const interval = setInterval(() => {
      setLoadingIndex((i) => {
        if (i < loadingMessages.length - 1) return i + 1;
        return i;
      });
    }, 2000);

    try {
      if (user?.id) {
        await onboardingApi.complete(user.id);
      }
      const updatedUser = await authApi.getMe();
      setUser(updatedUser);
    } catch { /* continue */ }

    clearInterval(interval);
    setTimeout(() => {
      setLoadingDone(true);
    }, 8000);
  };

  // Step 1: Auth
  if (step === 1) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-sage-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl text-charcoal mb-2">SoulGuide</h1>
            <p className="text-gray-500 text-sm">A companion for life's transitions</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              required
            />

            {authError && (
              <p className="text-red-500 text-sm text-center">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-900 transition-colors disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : isLogin ? 'Sign in' : 'Begin your journey'}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-center text-sm text-gray-500 hover:text-charcoal transition-colors"
          >
            {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Transition type
  if (step === 2) {
    return (
      <OnboardingStep step={2} totalSteps={TOTAL_STEPS}>
        <h2 className="font-serif text-2xl text-charcoal mb-2">What brought you here?</h2>
        <p className="text-gray-500 text-sm mb-6">
          Understanding your transition helps us walk alongside you more meaningfully.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {transitionTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTransitionType(t.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                transitionType === t.id
                  ? 'border-sage-600 bg-sage-50'
                  : 'border-gray-100 bg-white hover:border-sage-200'
              }`}
            >
              <div className="text-2xl mb-2">{t.emoji}</div>
              <div className="text-sm font-medium text-charcoal">{t.label}</div>
            </button>
          ))}
        </div>
        <button
          onClick={handleTransitionNext}
          disabled={!transitionType}
          className="w-full py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-900 transition-colors disabled:opacity-40 mt-auto"
        >
          Continue
        </button>
      </OnboardingStep>
    );
  }

  // Step 3: Intention
  if (step === 3) {
    return (
      <OnboardingStep step={3} totalSteps={TOTAL_STEPS}>
        <h2 className="font-serif text-2xl text-charcoal mb-2">What are you hoping for?</h2>
        <p className="text-gray-500 text-sm mb-6">Choose the intention that feels most true right now.</p>
        <div className="flex flex-col gap-3 mb-8">
          {intentions.map((i) => (
            <button
              key={i.id}
              onClick={() => setPrimaryIntention(i.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                primaryIntention === i.id
                  ? 'border-sage-600 bg-sage-50'
                  : 'border-gray-100 bg-white hover:border-sage-200'
              }`}
            >
              <span className="text-sm font-medium text-charcoal">{i.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleIntentionNext}
          disabled={!primaryIntention}
          className="w-full py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-900 transition-colors disabled:opacity-40 mt-auto"
        >
          Continue
        </button>
      </OnboardingStep>
    );
  }

  // Step 4: Schedule
  if (step === 4) {
    return (
      <OnboardingStep step={4} totalSteps={TOTAL_STEPS}>
        <h2 className="font-serif text-2xl text-charcoal mb-2">When do you practice?</h2>
        <p className="text-gray-500 text-sm mb-6">
          Small, consistent moments matter more than long sessions.
        </p>

        <div className="mb-8">
          <p className="text-sm font-medium text-charcoal mb-3">I prefer to practice in the...</p>
          <div className="flex gap-3">
            {['morning', 'evening'].map((t) => (
              <button
                key={t}
                onClick={() => setMorningOrEvening(t)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm capitalize transition-all ${
                  morningOrEvening === t
                    ? 'border-sage-600 bg-sage-50 text-sage-600'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-sage-200'
                }`}
              >
                {t === 'morning' ? '🌤 Morning' : '🌙 Evening'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-medium text-charcoal mb-3">
            I have about <span className="text-sage-600">{practiceMinutes} minutes</span> to practice
          </p>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={practiceMinutes}
            onChange={(e) => setPracticeMinutes(Number(e.target.value))}
            className="w-full accent-sage-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 min</span>
            <span>30 min</span>
          </div>
        </div>

        <button
          onClick={handleScheduleNext}
          disabled={!morningOrEvening}
          className="w-full py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-900 transition-colors disabled:opacity-40 mt-auto"
        >
          Build my path
        </button>
      </OnboardingStep>
    );
  }

  // Step 5: Path generation
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12 text-center">
      {!loadingDone ? (
        <>
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mb-6 animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-sage-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-charcoal mb-3">{loadingMessages[loadingIndex]}</h2>
          <p className="text-gray-400 text-sm">This takes just a moment.</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-sage-600 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Your path is ready</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xs">
            We've created a 30-day journey tailored to where you are right now.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-8 py-3 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-900 transition-colors"
          >
            Begin
          </button>
        </>
      )}
    </div>
  );
}
