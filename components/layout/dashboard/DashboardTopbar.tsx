"use client";

import { useRef, useState, useEffect } from "react";
import { Menu, Bell, LogOut, User, Check, CheckCheck, Inbox } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/features/roles/types/role.types";
import type { UserAccount } from "@/features/users/types/user.types";
import {
  useNotifications,
  useMarkAllRead,
  useMarkOneRead,
} from "@/features/notifications/queries/notification.queries";

// ─── DashboardTopbar ──────────────────────────────────────────────────────────

interface DashboardTopbarProps {
  user: UserAccount;
  pageTitle?: string;
  onMenuClick: () => void;
  onSignOut: () => void;
  className?: string;
}

export function DashboardTopbar({
  user,
  pageTitle,
  onMenuClick,
  onSignOut,
  className,
}: DashboardTopbarProps) {
  const [showUserMenu, setShowUserMenu]     = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data } = useNotifications();
  const { mutate: markAll }  = useMarkAllRead();
  const { mutate: markOne }  = useMarkOneRead();

  const notifications = data?.notifications ?? [];
  const unreadCount   = data?.unreadCount   ?? 0;

  // Close notif panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    }
    if (showNotifPanel) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifPanel]);

  const roleColorMap: Record<string, string> = {
    SUPER_ADMIN:    "text-amber-400",
    ADMIN:          "text-blue-400",
    PROPERTY_OWNER: "text-purple-400",
    TENANT:         "text-emerald-400",
  };

  return (
    <header
      className={cn("flex items-center justify-between px-5 py-0", className)}
      style={{
        height: "var(--topbar-height)",
        background: "var(--color-dash-topbar)",
        borderBottom: "1px solid var(--color-dash-border)",
      }}
    >
      {/* Left — hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-black/40 hover:text-black transition-colors p-1.5 rounded-lg hover:bg-black/5"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        {pageTitle && (
          <h1 className="text-sm font-medium text-black/70 hidden sm:block">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right — notifications + user menu */}
      <div className="flex items-center gap-2">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            id="notif-bell-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifPanel((v) => !v)}
            className="relative text-black/50 hover:text-black transition-colors p-2 rounded-lg hover:bg-black/5"
          >
            <Bell size={16} />
            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-bold leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown panel */}
          {showNotifPanel && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-30 overflow-hidden animate-fade-in"
              style={{
                background: "var(--color-dash-card)",
                borderColor: "var(--color-dash-border)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--color-dash-border)" }}
              >
                <div>
                  <p className="text-xs font-semibold text-black/80">Notifications</p>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-black/40 font-mono">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAll()}
                    className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    <CheckCheck size={11} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Inbox size={24} className="text-black/15" />
                    <p className="text-xs text-black/35 font-light">No notifications yet</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        onClick={() => {
                          if (!n.isRead) markOne(n.id);
                        }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                          n.isRead
                            ? "hover:bg-black/[0.02]"
                            : "bg-emerald-50/60 hover:bg-emerald-50"
                        )}
                        style={{ borderBottom: "1px solid var(--color-dash-border)" }}
                      >
                        {/* Unread dot */}
                        <span
                          className={cn(
                            "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                            n.isRead ? "bg-transparent" : "bg-emerald-500"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-black/80 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-black/50 leading-relaxed mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-black/30 font-mono mt-1">
                            {new Date(n.createdAt).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!n.isRead && (
                          <Check size={11} className="text-emerald-500 shrink-0 mt-1" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User menu ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <Avatar src={user.profileImage} name={user.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-black leading-tight">
                {user.name.split(" ")[0]}
              </p>
              <p
                className={cn(
                  "text-[9px] font-mono uppercase tracking-wider leading-tight",
                  roleColorMap[user.role]
                )}
              >
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 top-full mt-1 w-52 rounded-xl border p-1 z-20 shadow-2xl animate-fade-in"
                style={{
                  background: "var(--color-dash-card)",
                  borderColor: "var(--color-dash-border)",
                }}
              >
                {/* User info */}
                <div
                  className="px-3 py-2.5 mb-1"
                  style={{ borderBottom: "1px solid var(--color-dash-border)" }}
                >
                  <p className="text-xs font-semibold text-black truncate">{user.name}</p>
                  <p className="text-[10px] text-black/50 font-mono truncate">{user.email}</p>
                </div>

                <a
                  href="/dashboard/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                >
                  <User size={14} />
                  Profile
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
