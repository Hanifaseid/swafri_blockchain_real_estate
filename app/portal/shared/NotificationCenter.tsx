'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShieldAlert, 
  FileText, 
  Coins, 
  AlertTriangle, 
  Info,
  Clock
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  category: 'IDENTITY' | 'ESCROW' | 'BLOCKCHAIN' | 'SECURITY' | 'GENERAL';
  title: string;
  message: string;
  unread: boolean;
  timestamp: string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: NotificationCenterProps) {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'IDENTITY' | 'ESCROW' | 'BLOCKCHAIN' | 'SECURITY'>('ALL');

  const filteredNotifications = notifications.filter(notif => {
    if (filterCategory === 'ALL') return true;
    return notif.category === filterCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IDENTITY':
        return <ShieldAlert className="w-4 h-4 text-purple-500" />;
      case 'BLOCKCHAIN':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'ESCROW':
        return <Coins className="w-4 h-4 text-emerald-500" />;
      case 'SECURITY':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IDENTITY': return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'BLOCKCHAIN': return 'bg-sky-50 border-sky-100 text-sky-700';
      case 'ESCROW': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'SECURITY': return 'bg-rose-50 border-rose-100 text-rose-700';
      default: return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6" id="notification-center-workspace">
      
      {/* Upper header action controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Sovereign Notification Hub</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Real-time custody alerts, compliance clearings, and automated transaction logs</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <button 
            onClick={onMarkAllRead}
            disabled={notifications.filter(n => n.unread).length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-xl transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MARK ALL AS READ</span>
          </button>
          
          <button 
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded-xl transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>PURGE LOGS</span>
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 bg-slate-55 p-1 rounded-2xl border bg-slate-50 max-w-max text-[10px] font-mono font-bold">
        {(['ALL', 'IDENTITY', 'ESCROW', 'BLOCKCHAIN', 'SECURITY'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
              filterCategory === cat 
                ? 'bg-slate-905 bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            {cat} {notifications.filter(n => (cat === 'ALL' || n.category === cat) && n.unread).length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Notification items trail list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-3xl bg-slate-50/50 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
            <h4 className="text-xs font-bold text-slate-500 font-mono">No active notifications</h4>
            <p className="text-[10px] text-slate-400 font-sans max-w-xs mx-auto">This channel is currently clear. Real-time ledger entries, agreements, or escrow audits alerts will populate here.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.unread 
                  ? 'bg-blue-50/40 border-blue-105 border-blue-200 shadow-sm' 
                  : 'bg-white border-slate-200 hover:bg-slate-50/55'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${getCategoryColor(notif.category)}`}>
                  {getCategoryIcon(notif.category)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs font-bold ${notif.unread ? 'text-slate-950 font-extrabold' : 'text-slate-800'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500 uppercase tracking-wider font-semibold">
                      {notif.category}
                    </span>
                    {notif.unread && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white animate-pulse">
                        NEW UNREAD
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono mt-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {notif.unread && (
                <button 
                  onClick={() => onMarkRead(notif.id)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[9px] font-bold rounded-lg border border-blue-100 transition-all shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
