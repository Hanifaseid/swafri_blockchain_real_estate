'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Minimize2, Sparkles, RotateCcw, X, Send } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant' as const,
  content:
    'Welcome to TerraChain. I can help with map-based property discovery, digital title verification, KYC review, lease escrow, and purchase offers.',
};

const QUICK_PROMPTS = [
  'How is a title verified?',
  'How does lease escrow work?',
  'How do I submit an offer?',
];

export default function AiChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([INITIAL_MESSAGE]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || isSendingMsg) return;
    const newMessages = [...chatMessages, { role: 'user' as const, content: textToSend }];
    setChatMessages(newMessages);
    if (!customPrompt) setChatInput('');
    setIsSendingMsg(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      let data: any;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { error: await response.text() };
      }

      if (!response.ok) {
        throw new Error(data?.error || `Chat API error: ${response.status}`);
      }

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: data.text || data.error },
      ]);
    } catch (err: any) {
      const errorMessage =
        err?.message && err.message !== 'Failed to fetch'
          ? err.message
          : 'Network timeout. Please check your API configuration.';
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          content: errorMessage,
        },
      ]);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleReset = () => {
    setChatMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setIsChatOpen((v) => !v)}
        aria-label="VEX AI Assistant"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-emerald-600 shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform group"
        style={{ boxShadow: '0 12px 30px rgba(16,185,129,0.25)' }}
      >
        {isChatOpen ? (
          <Minimize2 className="w-5 h-5 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
          </>
        )}
      </button>

      {/* Chat popup */}
      {isChatOpen && (
        <div
          className="fixed bottom-28 right-8 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col"
          style={{
            height: '520px',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'rgba(5,10,15,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">VEX AI Advisor</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Real Estate Intelligence
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleReset}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-white/50" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3 text-white/50" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white/6 border border-white/10 text-white/80 rounded-tl-sm'
                      : 'bg-white text-black rounded-tr-sm'
                  }`}
                  style={
                    msg.role === 'assistant' ? { background: 'rgba(255,255,255,0.06)' } : {}
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSendingMsg && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                </div>
                <div
                  className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs border border-white/10 flex items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="whitespace-nowrap text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 pb-4 shrink-0">
            <div
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <input
                type="text"
                placeholder="Ask about blockchain real estate..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isSendingMsg || !chatInput.trim()}
                className="w-7 h-7 rounded-lg bg-white disabled:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
