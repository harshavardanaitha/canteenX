import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Shield, BarChart3, Flame, Megaphone, Calendar, Leaf,
  TrendingUp, Award, Building, Users, Send, CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const [heatmap, setHeatmap] = useState([]);
  const [sustainability, setSustainability] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Announcement Form State
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  
  // Event Form State
  const [evtName, setEvtName] = useState('');
  const [evtType, setEvtType] = useState('TECH_FEST');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [hRes, sRes, aRes, eRes] = await Promise.all([
        axios.get('/api/analytics/heatmap'),
        axios.get('/api/analytics/sustainability'),
        axios.get('/api/announcements'),
        axios.get('/api/announcements/events')
      ]);

      if (hRes.data.heatmap) setHeatmap(hRes.data.heatmap);
      if (sRes.data) setSustainability(sRes.data);
      if (aRes.data.announcements) setAnnouncements(aRes.data.announcements);
      if (eRes.data.events) setEvents(eRes.data.events);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!ancTitle || !ancContent) return;
    try {
      await axios.post('/api/announcements', { title: ancTitle, content: ancContent });
      setAncTitle('');
      setAncContent('');
      fetchAdminData();
    } catch (err) {
      alert('Error broadcasting announcement.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!evtName) return;
    try {
      await axios.post('/api/announcements/events', {
        name: evtName,
        event_type: evtType,
        start_date: '2026-10-15',
        end_date: '2026-10-17'
      });
      setEvtName('');
      fetchAdminData();
    } catch (err) {
      alert('Error setting up campus event.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-purple-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            COLLEGE ADMINISTRATION PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Campus Food Services Command Center</h1>
          <p className="text-xs text-indigo-200">Multi-canteen management, campus ordering heatmap, event mode, and broadcasts.</p>
        </div>

        <Shield className="w-12 h-12 text-purple-400 shrink-0" />
      </div>

      {/* CAMPUS FOOD HEATMAP */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" /> Campus Food Ordering Heatmap & Peak Activity
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Time Slot</th>
                <th className="p-3">Canteen Unit</th>
                <th className="p-3">Ordering Intensity</th>
                <th className="p-3">Active Orders</th>
                <th className="p-3">Avg Wait Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {heatmap.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.time_slot}</td>
                  <td className="p-3 font-semibold">{row.canteen_name}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      row.intensity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : row.intensity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {row.intensity}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{row.active_orders} orders</td>
                  <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">~{row.wait_mins} mins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANTEEN SUSTAINABILITY SCORE */}
      {sustainability && (
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200 dark:border-slate-700 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Canteen Sustainability Score</h3>
                <p className="text-xs text-slate-500">Quantitative operational metric evaluating food waste reduction & inventory efficiency</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{sustainability.score}</span>
              <span className="text-xs text-slate-400 block font-bold">GRADE {sustainability.grade}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sustainability.breakdown).map(([key, val]) => (
              <div key={key} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-700 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{val.score}/100 <span className="text-[10px] text-slate-400 font-normal">({val.weight})</span></p>
                <p className="text-[10px] text-slate-500">{val.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMPUS EVENT MODE & ANNOUNCEMENT BROADCAST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ANNOUNCEMENT BROADCASTER */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-500" /> Broadcast Campus Announcement
          </h3>

          <form onSubmit={handleCreateAnnouncement} className="space-y-3">
            <input
              type="text"
              placeholder="Announcement Title"
              value={ancTitle}
              onChange={(e) => setAncTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
            />
            <textarea
              placeholder="Broadcast content..."
              value={ancContent}
              onChange={(e) => setAncContent(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Broadcast Announcement
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {announcements.map(a => (
              <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">{a.title}</p>
                <p className="text-slate-500">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CAMPUS EVENT MODE */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" /> Campus Event Mode Configuration
          </h3>

          <form onSubmit={handleCreateEvent} className="space-y-3">
            <input
              type="text"
              placeholder="Event Name (e.g. CyberFest 2026)"
              value={evtName}
              onChange={(e) => setEvtName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
            />
            <select
              value={evtType}
              onChange={(e) => setEvtType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="TECH_FEST">Tech Fest</option>
              <option value="SPORTS_DAY">Sports Day</option>
              <option value="CULTURAL_FEST">Cultural Fest</option>
            </select>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-600/20"
            >
              Activate Event Mode Stalls
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {events.map(e => (
              <div key={e.id} className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-200">{e.name} ({e.event_type})</p>
                <p className="text-amber-700 dark:text-amber-400">Special event counters & extended operating hours active.</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
