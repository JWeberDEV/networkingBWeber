import React, { useEffect, useRef, useState } from 'react';
import { notificationApi, type Notification } from '../api';
import { timeAgo } from './CommunityFeed';

interface Props {
  onNavigate: (targetType: Notification['targetType'], targetId: number | null) => void;
}

const POLL_MS = 20000;

export default function NotificationBell({ onNavigate }: Props) {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = () => {
    notificationApi
      .list()
      .then((r) => {
        setItems(r.notifications);
        setUnread(r.unreadCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const openPanel = () => {
    setOpen(true);
    refresh();
  };

  const markAll = async () => {
    setUnread(0);
    setItems((xs) => xs.map((x) => ({ ...x, isRead: true })));
    await notificationApi.markAllRead().catch(() => {});
  };

  const handleClick = async (n: Notification) => {
    setOpen(false);
    if (!n.isRead) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      notificationApi.markRead(n.id).catch(() => {});
    }
    onNavigate(n.targetType, n.targetId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
        title="Notificações"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-secondary-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed right-2 top-[68px] w-[calc(100vw-1rem)] sm:absolute sm:right-0 sm:top-auto sm:mt-2 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-900">Notificações</h4>
              {unread > 0 && (
                <button onClick={markAll} className="text-[11px] font-bold text-primary-navy hover:underline">
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-[36px]">notifications_off</span>
                  <p className="text-xs text-slate-400 mt-1">Nenhuma notificação por enquanto.</p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 transition ${
                      n.isRead ? '' : 'bg-indigo-50/40'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${iconColor(n.targetType)}`}>
                      {iconFor(n.targetType)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary-orange shrink-0 mt-1.5 ml-auto" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function iconFor(t: Notification['targetType']): string {
  switch (t) {
    case 'post': return 'forum';
    case 'establishment': return 'storefront';
    case 'profile': return 'verified';
    case 'admin': return 'shield_person';
    default: return 'notifications';
  }
}
function iconColor(t: Notification['targetType']): string {
  switch (t) {
    case 'profile': return 'text-emerald-500';
    case 'admin': return 'text-secondary-orange';
    default: return 'text-primary-navy';
  }
}
