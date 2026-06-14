'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Building2,
  Search,
  Circle,
  CheckCheck,
  Clock,
  Paperclip,
  Hash,
} from 'lucide-react';
import { Property, UserAccount } from '../types';

interface Message {
  id: string;
  threadId: string;
  sender: 'TENANT' | 'OWNER';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface Thread {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  ownerName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

interface TenantMessagesProps {
  properties: Property[];
  currentUser: UserAccount;
}

const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    threadId: 'thread-prop-1',
    sender: 'OWNER',
    senderName: 'Lord Sterling',
    text: 'Hello! Thank you for your interest in Obsidian Tower. The fractional tokens for Suite 402 are still available. Would you like to schedule a virtual walkthrough via our blockchain-secured viewing portal?',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-2',
    threadId: 'thread-prop-1',
    sender: 'TENANT',
    senderName: 'You',
    text: 'Yes, I am interested! Can you confirm the current APY yield rate and whether the smart contract auto-distributes rent every month?',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-3',
    threadId: 'thread-prop-1',
    sender: 'OWNER',
    senderName: 'Lord Sterling',
    text: 'Confirmed. The zkSync smart contract releases USDC yield directly to your linked wallet on the 1st of each month. Current APY is locked at 9.4% with a minimum 3-month holding. The ERC-1155 deed certificate is also fully verifiable on-chain.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-4',
    threadId: 'thread-prop-2',
    sender: 'OWNER',
    senderName: 'Lord Sterling',
    text: 'Welcome to Sapphire Pavilion enquiries. This is our premier Marina Bay asset — 11.2% APY, 840 tokens remaining. All utility data is streamed live to our IoT oracle. Feel free to ask anything.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

export default function TenantMessages({ properties, currentUser }: TenantMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('vex_tenant_messages');
    const loaded: Message[] = stored ? JSON.parse(stored) : SEED_MESSAGES;
    if (!stored) localStorage.setItem('vex_tenant_messages', JSON.stringify(SEED_MESSAGES));
    setMessages(loaded);

    // Build threads from published properties
    const publishedProps = properties.filter((p) => p.status === 'PUBLISHED');
    const builtThreads: Thread[] = publishedProps.map((p) => {
      const propMsgs = loaded.filter((m) => m.threadId === `thread-${p.id}`);
      const last = propMsgs[propMsgs.length - 1];
      return {
        id: `thread-${p.id}`,
        propertyId: p.id,
        propertyName: p.name,
        propertyImage: p.image,
        ownerName: p.ownerName,
        lastMessage: last ? last.text : 'No messages yet. Start a conversation.',
        lastTime: last ? last.timestamp : p.id,
        unreadCount: propMsgs.filter((m) => m.sender === 'OWNER' && !m.read).length,
      };
    });
    setThreads(builtThreads);
    if (builtThreads.length > 0 && !activeThreadId) {
      setActiveThreadId(builtThreads[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadId, messages]);

  const persistMessages = (updated: Message[]) => {
    setMessages(updated);
    localStorage.setItem('vex_tenant_messages', JSON.stringify(updated));
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    // Mark all owner messages in this thread as read
    const updated = messages.map((m) =>
      m.threadId === threadId && m.sender === 'OWNER' ? { ...m, read: true } : m
    );
    persistMessages(updated);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeThreadId) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      threadId: activeThreadId,
      sender: 'TENANT',
      senderName: currentUser.name,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    const updated = [...messages, newMsg];
    persistMessages(updated);

    const thread = threads.find((t) => t.id === activeThreadId);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, lastMessage: newMsg.text, lastTime: newMsg.timestamp }
          : t
      )
    );

    setInputText('');

    // Simulate owner reply after 2s
    setTimeout(() => {
      const replies = [
        `Thank you for reaching out about ${thread?.propertyName}. Our compliance team will verify your wallet address before proceeding.`,
        'The smart contract escrow is fully audited. You can verify the deed hash on Etherscan at any time.',
        'Noted. I will prepare the fractional key allocation report for your review. Expect confirmation within 24 hours.',
        'Your inquiry has been logged on-chain. The zkSync validator will process the rental agreement once KYC is cleared.',
      ];
      const reply: Message = {
        id: `msg-${Date.now() + 1}`,
        threadId: activeThreadId,
        sender: 'OWNER',
        senderName: thread?.ownerName || 'Property Owner',
        text: replies[Math.floor(Math.random() * replies.length)],
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
    }, 2000);
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeMessages = messages.filter((m) => m.threadId === activeThreadId);
  const filteredThreads = threads.filter(
    (t) =>
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[75vh]">
      
      {/* Thread List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Property Chats
              {totalUnread > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 font-mono"
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
                  activeThreadId === thread.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thread.propertyImage}
                  alt={thread.propertyName}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{thread.propertyName}</span>
                    {thread.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{thread.ownerName}</div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{thread.lastMessage}</p>
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
              <p className="text-sm font-bold text-slate-500">Select a property chat to begin</p>
              <p className="text-xs text-slate-400 font-mono max-w-xs">
                Communicate directly with property owners about fractional tokens, lease terms, and blockchain deed verification.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeThread.propertyImage}
                alt={activeThread.propertyName}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{activeThread.propertyName}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Building2 className="w-3 h-3" />
                  <span>{activeThread.ownerName}</span>
                  <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
                  <span className="text-emerald-600">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-100 border px-3 py-1.5 rounded-lg">
                <Hash className="w-3 h-3 text-blue-600" />
                <span className="text-slate-600">{activeThread.propertyId.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {activeMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-mono">No messages yet. Send your first message to the property owner.</p>
                </div>
              )}
              {activeMessages.map((msg) => {
                const isTenant = msg.sender === 'TENANT';
                return (
                  <div key={msg.id} className={`flex ${isTenant ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isTenant ? 'order-2' : ''}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isTenant
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-[9px] text-slate-400 font-mono ${isTenant ? 'justify-end' : ''}`}>
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isTenant && <CheckCheck className="w-3 h-3 text-blue-400" />}
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
                  placeholder="Type a message about the property..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-slate-50 font-sans"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-mono mt-2 px-1">
                Messages are end-to-end encrypted and logged to the VEX compliance ledger.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
