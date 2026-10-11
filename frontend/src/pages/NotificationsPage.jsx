import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, BellOff, BellRing, CheckCheck, Megaphone, Package, Clock, Award, AlertTriangle } from 'lucide-react';

const TYPE_CONFIG = {
  ORDER_STATUS: { icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60', label: 'Order Update' },
  QUEUE_UPDATE: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', label: 'Queue Alert' },
  ANNOUNCEMENT: { icon: Megaphone, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/60', label: 'Announcement' },
  REWARD: { icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', label: 'Reward Earned' },
  LOW_STOCK: { icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60', label: 'Stock Alert' },
};

function getRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const DEMO_NOTIFICATIONS = [
    { id: 'notif_1', type: 'ORDER_STATUS', title: 'Order Ready for Pickup!', message: 'Your order #CX-1006 (Masala Dosa × 1, Cutting Chai × 2) is READY. Show your QR code at Counter 1.', is_read: 0, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'notif_2', type: 'REWARD', title: '🎉 Reward Points Credited!', message: 'You earned 24 reward points on your last order. Total balance: 240 points. Keep ordering to unlock Silver tier!', is_read: 0, created_at: new Date(Date.now() - 22 * 60000).toISOString() },
    { id: 'notif_3', type: 'ANNOUNCEMENT', title: 'Special Diwali Combo Available Today!', message: 'Apex Central Canteen: Festive Diwali Thali (₹89) — Kheer + Paratha + Dal Makhani. Available 12PM–3PM today.', is_read: 1, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: 'notif_4', type: 'QUEUE_UPDATE', title: 'Best Time to Order Now!', message: 'Queue at Apex Central Canteen is SHORT — only 2 active orders. Estimated wait under 5 minutes!', is_read: 1, created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'notif_5', type: 'ORDER_STATUS', title: 'Order Accepted & Preparing', message: 'Your order #CX-1007 is being prepared. Estimated ready time: 10 minutes. Token #31 will be called.', is_read: 1, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'notif_6', type: 'ANNOUNCEMENT', title: 'Canteen Closed This Weekend', message: 'Apex Central Canteen will be closed Oct 7–8 (Weekend) for deep cleaning. Normal operations resume Monday.', is_read: 1, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/notifications');
        if (res.data.notifications && res.data.notifications.length > 0) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications(DEMO_NOTIFICATIONS);
        }
      } catch {
        setNotifications(DEMO_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  const handleMarkRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));

  const types = ['ALL', 'ORDER_STATUS', 'ANNOUNCEMENT', 'REWARD', 'QUEUE_UPDATE'];
  const filtered = filter === 'ALL' ? notifications : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="p-6 bg-gradient-to-r from-violet-900 via-indigo-900 to-violet-950 text-white rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-violet-300" />
            <span className="bg-violet-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">NOTIFICATION CENTRE</span>
            {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} NEW</span>}
          </div>
          <h1 className="text-2xl font-black">Your Notifications</h1>
          <p className="text-xs text-violet-200">Order updates, announcements, rewards and queue alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${filter === t ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {t === 'ALL' ? 'All' : (TYPE_CONFIG[t]?.label || t)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading notifications...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No notifications in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG['ANNOUNCEMENT'];
            const Icon = cfg.icon;
            return (
              <div key={notif.id} onClick={() => handleMarkRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${!notif.is_read ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/60 shadow-md' : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-75'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-bold ${!notif.is_read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{notif.title}</h3>
                      {!notif.is_read && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] text-slate-400">{getRelativeTime(notif.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
