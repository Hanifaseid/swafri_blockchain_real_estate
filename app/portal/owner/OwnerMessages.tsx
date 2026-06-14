'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Circle,
  CheckCheck,
  Clock,
  Paperclip,
  Hash,
  Users,
  Building2,
} from 'lucide-react';
import { Property, UserAccount } from '../types';

interface OwnerMessage {
  id: string;
  threadId: string;
  sender: 'OWNER' | 'TENANT';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface OwnerThread {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  tenantName: string;
  tenantInitials: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  status: 'RENT' | 'BUY' | 'GENERAL';
}

interface OwnerMessagesProps {
  properties: Property[];
  currentUser: UserAccount;
}

const SEED_OWNER_MESSAGES: OwnerMessage[] = [
  {
    id: 'omsg-1',
    threadId: 'owner-thread-1',
    sender: 'TENANT',
    senderName: 'Alex Murano',
    text: 'Hi, I am interested in renting Suite 402 at Obsidian Tower. Can you confirm if the lease terms support monthly USDC payments through the smart contract?',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'omsg-2',
    threadId: 'owner-thread-2',
    sender: 'TENANT',
    senderName: 'Priya Nair',
    text: 'Hello! I submitted a fractional buy inquiry for Sapphire Pavilion. My KYC is approved and wallet is linked. What are the next steps to finalize the token transfer?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'omsg-3',
    threadId: 'owner-thread-3',
    sender: 'TENANT',
    senderName: 'James Vickers',
    text: 'Are there any co-working lease plans available for the Emerald Plaza commercial units? We are a blockchain startup looking for a 12-month agreement.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'omsg-4',
    threadId: 'owner-thread-3',
    sender: 'OWNER',
    senderName: 'You',
    text: 'Yes, we have dedicated co-working tiers. I will send over the smart lease template via the VEX escrow portal. Please make sure your company wallet is verified first.',
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

const SEED_OWNER_THREADS: OwnerThread[] = [
  {
    id: 'owner-thread-1',
    propertyId: 'prop-1',
    propertyName: 'VEX Obsidian Tower',
    propertyImage: 'https://picsum.photos/seed/obsidian/800/500',
    tenantName: 'Alex Murano',
    tenantInitials: 'AM',
    lastMessage: 'Hi, I am interested in renting Suite 402...',
    lastTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    status: 'RENT',
  },
  {
    id: 'owner-thread-2',
    propertyId: 'prop-2',
    propertyName: 'VEX Sapphire Pavilion',
    propertyImage: 'https://picsum.photos/seed/sapphire/800/500',
    tenantName: 'Priya Nair',
    tenantInitials: 'PN',
    lastMessage: 'My KYC is approved and wallet is linked...',
    lastTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    status: 'BUY',
  },
  {
    id: 'owner-thread-3',
    propertyId: 'prop-3',
    propertyName: 'VEX Emerald Plaza',
    propertyImage: 'https://picsum.photos/seed/emerald/800/500',
    tenantName: 'James Vickers',
    tenantInitials: 'JV',
    lastMessage: 'Yes, we have dedicated co-working tiers...',
    lastTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: 'GENERAL',
  },
];

const STATUS_COLORS: Record<string, string> = {
  RENT: 'bg-emerald-100 text-emerald-700',
  BUY: 'bg-blue-100 text-blue-700',
  GENERAL: 'bg-slate-100 text-slate-600',
};

export default function OwnerMessages({ properties, currentUser }: OwnerMessagesProps) {
  const [messages, setMessages] = useState<OwnerMessage[]>([]);
  const [threads, setThreads] = useState<OwnerThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedMsgs = localStorage.getItem('vex_owner_messages');
    const storedThreads = localStorage.getItem('vex_owner_threads');
    const loadedMsgs: OwnerMessage[] = storedMsgs ? JSON.parse(storedMsgs) : SEED_OWNER_MESSAGES;
    const loadedThreads: OwnerThread[] = storedThreads ? JSON.parse(storedThreads) : SEED_OWNER_THREADS;
    if (!storedMsgs) localStorage.setItem('vex_owner_messages', JSON.stringify(SEED_OWNER_MESSAGES));
    if (!storedThreads) localStorage.setItem('vex_owner_threads', JSON.stringify(SEED_OWNER_THREADS));
    setMessages(loadedMsgs);
    setThreads(loadedThreads);
    if (loadedThreads.length > 0) setActiveThreadId(loadedThreads[0].id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, messages]);

  const persistMessages = (updated: OwnerMessage[]) => {
    setMessages(updated);
    localStorage.setItem('vex_owner_messages', JSON.stringify(updated));
  };

  const persistThreads = (updated: OwnerThread[]) => {
    setThreads(updated);
    localStorage.setItem('vex_owner_threads', JSON.stringify(updated));
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    const updatedMsgs = messages.map((m) =>
      m.threadId === threadId && m.sender === 'TENANT' ? { ...m, read: true } : m
    );
    persistMessages(updatedMsgs);
    const updatedThreads = threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t));
    persistThreads(updatedThreads);
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeThreadId) return;
    const newMsg: OwnerMessage = {
      id: `omsg-${Date.now()}`,
      threadId: activeThreadId,
      sender: 'OWNER',
      senderName: currentUser.name,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    const updated = [...messages, newMsg];
    persistMessages(updated);
    const updatedThreads = threads.map((t) =>
      t.id === activeThreadId ? { ...t, lastMessage: newMsg.text, lastTime: newMsg.timestamp } : t
    );
    persistThreads(updatedThreads);
    setInputText('');

    // Simulate tenant follow-up after 2.5s
    setTimeout(() => {
      const activeThread = threads.find((t) => t.id === activeThreadId);
      const followUps = [
        'Thank you for the quick response! I will review the smart lease template and get back to you shortly.',
        'Understood. My wallet is verified. Can you send the fractional token allocation report to my registered email?',
        'Perfect. I will initiate the KYC re-verification as instructed. Looking forward to completing the transaction.',
        'Great to hear. Is there a blockchain explorer link where I can verify the deed hash independently?',
      ];
      const reply: OwnerMessage = {
        id: `omsg-${Date.now() + 1}`,
        threadId: activeThreadId,
        sender: 'TENANT',
        senderName: activeThread?.tenantName || 'Tenant',
        text: followUps[Math.floor(Math.random() * followUps.length)],
        timestamp: new Date().toISOString(),
        read: false,
      };
      const withReply = [...updated, reply];
      persistMessages(withReply);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, lastMessage: reply.text, lastTime: reply.timestamp, unreadCount: t.unreadCount + 1 }
            : t
        )
      );
    }, 2500);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeMessages = messages.filter((m) => m.threadId === activeThreadId);
  const filteredThreads = threads.filter(
    (t) =>
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[75vh]">
      
      {/* Thread List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Tenant Conversations
              {totalUnread > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenants or properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-purple-400 font-mono"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-mono">No conversations found.</div>
          ) : (
            filteredThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex gap-3 items-start cursor-pointer ${
                  activeThreadId === thread.id ? 'bg-purple-50 border-l-2 border-l-purple-600' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-purple-700 text-xs shrink-0">
                  {thread.tenantInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{thread.tenantName}</span>
                    {thread.unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-2.5 h-2.5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-mono truncate">{thread.propertyName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[thread.status]}`}>
                      {thread.status}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate flex-1">{thread.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1.5} />
              <p className="text-sm font-bold text-slate-500">Select a tenant conversation</p>
              <p className="text-xs text-slate-400 font-mono max-w-xs">
                Respond to tenant rent inquiries, fractional buy requests, and lease negotiations directly from this panel.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-purple-700 text-xs shrink-0">
                {activeThread.tenantInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">{activeThread.tenantName}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Building2 className="w-3 h-3" />
                  <span className="truncate">{activeThread.propertyName}</span>
                  <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
                  <span className="text-emerald-600">Active</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[activeThread.status]}`}>
                  {activeThread.status} INQUIRY
                </span>
                <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-100 border px-3 py-1.5 rounded-lg">
                  <Hash className="w-3 h-3 text-purple-600" />
                  <span className="text-slate-600">{activeThread.propertyId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {activeMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-mono">No messages in this thread yet.</p>
                </div>
              )}
              {activeMessages.map((msg) => {
                const isOwner = msg.sender === 'OWNER';
                return (
                  <div key={msg.id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      {!isOwner && (
                        <div className="text-[10px] text-slate-500 font-mono mb-1 ml-1">{msg.senderName}</div>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isOwner
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-mono ${isOwner ? 'justify-end' : ''}`}>
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOwner && <CheckCheck className="w-3 h-3 text-purple-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                </button>
                <input
                  type="text"
                  placeholder="Reply to tenant..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 bg-slate-50 font-sans"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-mono mt-2 px-1">
                All owner replies are compliance-logged and cross-referenced with the active lease registry.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
