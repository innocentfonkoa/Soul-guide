import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { companionApi } from '../lib/api';
import CompanionChat from '../components/CompanionChat';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export default function Companion() {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companionApi
      .getHistory()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-gray-100 bg-cream">
        <h1 className="font-serif text-2xl text-charcoal">Companion</h1>
        <p className="text-gray-400 text-xs mt-0.5">A safe space to share what's on your heart</p>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CompanionChat
            initialMessages={messages}
            userName={user?.name || 'friend'}
          />
        )}
      </div>

      {/* Bottom nav padding */}
      <div className="h-16" />
    </div>
  );
}
