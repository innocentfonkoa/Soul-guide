import { useState, useRef, useEffect } from 'react';
import { companionApi } from '../lib/api';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface CompanionChatProps {
  initialMessages: Message[];
  userName: string;
}

const suggestions = [
  "I've been feeling lost lately...",
  "Can you help me process something?",
  "I'm not sure how to move forward.",
  "I want to talk about my practice today.",
];

export default function CompanionChat({ initialMessages, userName }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((i) => (i + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const send = async (content: string) => {
    if (!content.trim() || loading) return;

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await companionApi.sendMessage(content);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm here. Take your time. What would you like to share?",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-sage-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-charcoal mb-2">Hello, {userName}</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              I am here to walk alongside you. Share what is on your heart.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sage-600 text-white rounded-br-sm'
                  : 'bg-white text-charcoal shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestion */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <button
            onClick={() => send(suggestions[suggestionIndex])}
            className="w-full text-left text-sm text-sage-600 bg-sage-50 rounded-xl px-4 py-2.5 hover:bg-sage-100 transition-colors italic"
          >
            "{suggestions[suggestionIndex]}"
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage-400 max-h-32"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-sage-600 text-white flex items-center justify-center hover:bg-sage-900 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-90">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
