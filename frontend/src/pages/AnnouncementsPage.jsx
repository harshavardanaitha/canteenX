import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Pin, Calendar, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';

const PRIORITY_STYLES = {
  URGENT: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  NORMAL: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const DEMO_ANNOUNCEMENTS = [
  {
    id: 'ann_1',
    title: '🎉 Diwali Special Menu — Limited Time!',
    content: 'Apex Central Canteen is celebrating Diwali with a special festive menu! Enjoy our exclusive Diwali Thali (₹89) featuring traditional sweets, Dal Makhani, Garlic Naan, and Gulab Jamun. Available October 5–12 from 12:00 PM to 3:00 PM only. Pre-ordering is highly recommended via the CanteenX app to guarantee your serving.',
    priority: 'HIGH',
    canteen_name: 'Apex Central Canteen',
    is_pinned: 1,
    start_date: '2026-10-05',
    end_date: '2026-10-12',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'ann_2',
    title: '⚠️ Maintenance Closure — Weekend Oct 7–8',
    content: 'Apex Central Canteen will be CLOSED on Saturday October 7th and Sunday October 8th for scheduled deep cleaning and quarterly maintenance. The North Block Canteen (cnt_north) will remain open with limited menu from 8AM to 5PM. Normal operations for all canteens resume on Monday October 9th.',
    priority: 'URGENT',
    canteen_name: 'All Canteens',
    is_pinned: 1,
    start_date: '2026-10-07',
    end_date: '2026-10-08',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'ann_3',
    title: '🥗 New Healthy Menu Added — Salad Bar',
    content: 'We have introduced a new Salad Bar section with 8 fresh salad combinations including Caesar Salad, Greek Salad, and High-Protein Sprout Bowl. All priced between ₹45–₹75. Perfect for health-conscious students and faculty. Available daily starting from Monday.',
    priority: 'NORMAL',
    canteen_name: 'Apex Central Canteen',
    is_pinned: 0,
    start_date: '2026-10-09',
    end_date: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'ann_4',
    title: '📱 CanteenX App Update — New Features',
    content: 'The CanteenX platform has been updated with new features: 1) QR Code now supports multiple scans for split payments, 2) Faculty can now schedule meals up to 48 hours in advance, 3) Rewards tier system updated — Silver tier now at 300 points (was 500). Update your app to access all new features.',
    priority: 'NORMAL',
    canteen_name: 'Platform Update',
    is_pinned: 0,
    start_date: '2026-10-04',
    end_date: null,
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
];

function AnnouncementCard({ ann }) {
  const [expanded, setExpanded] = useState(false);
  const priorityStyle = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.NORMAL;
  const shortContent = ann.content.length > 150 ? ann.content.slice(0, 150) + '...' : ann.content;

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      ann.priority === 'URGENT'
        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 shadow-sm'
        : ann.priority === 'HIGH'
        ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 shadow-sm'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
    }`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {ann.is_pinned === 1 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  <Pin className="w-2.5 h-2.5" /> PINNED
                </span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle}`}>
                {ann.priority}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {ann.canteen_name}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{ann.title}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {expanded ? ann.content : shortContent}
        </p>

        {ann.content.length > 150 && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read More</>}
          </button>
        )}

        <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-3">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
            {ann.start_date}{ann.end_date ? ` → ${ann.end_date}` : ' (Ongoing)'}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />
            {new Date(ann.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/announcements');
        if (res.data.announcements && res.data.announcements.length > 0) {
          setAnnouncements(res.data.announcements);
        } else {
          setAnnouncements(DEMO_ANNOUNCEMENTS);
        }
      } catch {
        setAnnouncements(DEMO_ANNOUNCEMENTS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = announcements.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || a.priority === filter;
    return matchSearch && matchFilter;
  });

  const pinned = filtered.filter(a => a.is_pinned === 1);
  const regular = filtered.filter(a => a.is_pinned !== 1);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-orange-900 via-amber-900 to-orange-950 text-white rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <Megaphone className="w-6 h-6 text-amber-300" />
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">CAMPUS ANNOUNCEMENTS</span>
        </div>
        <h1 className="text-2xl font-black">Canteen & Campus Board</h1>
        <p className="text-xs text-amber-200 mt-1">Official announcements from canteen management and college administration.</p>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input type="text" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
        <div className="flex gap-2">
          {['ALL', 'URGENT', 'HIGH', 'NORMAL'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No announcements found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" /> Pinned Announcements
              </h2>
              {pinned.map(a => <AnnouncementCard key={a.id} ann={a} />)}
            </div>
          )}
          {regular.length > 0 && (
            <div className="space-y-3">
              {pinned.length > 0 && <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Announcements</h2>}
              {regular.map(a => <AnnouncementCard key={a.id} ann={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
