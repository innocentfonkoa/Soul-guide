import { useState, useRef, useEffect } from 'react';
import { Practice } from '../store/useStore';
import { practicesApi, journeyApi } from '../lib/api';

interface AudioPlayerProps {
  practice: Practice;
  onClose: () => void;
  onComplete: (reflectionPrompt: string) => void;
}

export default function AudioPlayer({ practice, onClose, onComplete }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionPrompt, setReflectionPrompt] = useState('');
  const [reflectionText, setReflectionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      handleComplete();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handleComplete = async () => {
    try {
      const result = await practicesApi.complete(practice.id);
      setReflectionPrompt(result.reflectionPrompt);
      setShowReflection(true);
    } catch {
      setReflectionPrompt(`How did "${practice.title}" land for you today?`);
      setShowReflection(true);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const submitReflection = async () => {
    if (!reflectionText.trim()) {
      onComplete(reflectionPrompt);
      return;
    }
    setSubmitting(true);
    try {
      await journeyApi.saveReflection({
        practiceId: practice.id,
        prompt: reflectionPrompt,
        response: reflectionText,
      });
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
      onComplete(reflectionPrompt);
    }
  };

  if (showReflection) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-cream rounded-t-3xl p-6 w-full max-w-lg animate-slide-up">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
          <h3 className="font-serif text-xl text-charcoal mb-2">A moment to reflect</h3>
          <p className="text-gray-600 mb-4">{reflectionPrompt}</p>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write freely... or simply close."
            className="w-full h-28 p-3 rounded-xl border border-gray-200 text-sm text-charcoal resize-none focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onComplete(reflectionPrompt)}
              className="flex-1 py-3 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={submitReflection}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-sage-600 text-white text-sm font-medium hover:bg-sage-900 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save reflection'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-cream rounded-t-3xl p-6 w-full max-w-lg">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        <audio ref={audioRef} src={practice.audioUrl || ''} preload="metadata" />

        <div className="text-center mb-8">
          <h3 className="font-serif text-xl text-charcoal mb-1">{practice.title}</h3>
          {practice.guideBy && (
            <p className="text-gray-500 text-sm">with {practice.guideBy}</p>
          )}
        </div>

        {/* Waveform visualization */}
        <div className="flex items-center justify-center gap-1.5 h-16 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 rounded-full bg-sage-400 ${isPlaying ? 'wave-bar' : ''}`}
              style={{ height: `${[60, 80, 100, 80, 60][i]}%` }}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-1.5 mb-2">
            <div
              className="bg-sage-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <button onClick={() => skip(-10)} className="text-gray-500 hover:text-charcoal transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-sage-600 text-white flex items-center justify-center hover:bg-sage-900 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 ml-1">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button onClick={() => skip(10)} className="text-gray-500 hover:text-charcoal transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors">
            Close
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 py-3 rounded-xl bg-clay-500 text-white text-sm font-medium hover:bg-clay-700 transition-colors"
          >
            Mark complete
          </button>
        </div>
      </div>
    </div>
  );
}
