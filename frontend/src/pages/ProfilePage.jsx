import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, GraduationCap, Building2, Award, Star,
  ShoppingBag, CreditCard, TrendingUp, Clock, CheckCircle2,
  XCircle, Settings, LogOut, Edit3, Save, X, Shield,
  Sparkles, ChevronRight, Wallet, Bell, Moon, Sun, Gift
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ROLE_LABELS = {
  STUDENT: { label: 'Student', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  FACULTY: { label: 'Faculty', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  CANTEEN_STAFF: { label: 'Canteen Staff', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  CANTEEN_MANAGER: { label: 'Canteen Manager', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  COLLEGE_ADMIN: { label: 'College Admin', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
};

const ORDER_STATUS_CONFIG = {
  PENDING:   { color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',   icon: Clock },
  CONFIRMED: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',      icon: CheckCircle2 },
  PREPARING: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',icon: Sparkles },
  READY:     { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', icon: CheckCircle2 },
  DELIVERED: { color: 'text-slate-500 bg-slate-100 dark:bg-slate-800',     icon: CheckCircle2 },
  CANCELLED: { color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',      icon: XCircle },
};

function StatCard({ icon: Icon, label, value, color = 'indigo', delay = 0 }) {
  return (
    <div
      className="animate-fadeInUp card-hover p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm space-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-9 h-9 rounded-xl bg-${color}-100 dark:bg-${color}-950/50 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'settings'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setEditForm({ name: user.name || '', phone: user.phone || '' });
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get('/api/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axios.patch('/api/users/me', editForm, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSaveMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const totalSpent = orders
    .filter(o => o.payment_status === 'PAID')
    .reduce((sum, o) => sum + (parseFloat(o.final_amount) || 0), 0);

  const completedOrders = orders.filter(o => ['DELIVERED', 'READY'].includes(o.status)).length;
  const roleConfig = ROLE_LABELS[user.role] || ROLE_LABELS.STUDENT;

  // Generate initials avatar
  const initials = (user.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders',   label: `Orders (${orders.length})`, icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── HERO PROFILE CARD ── */}
      <div className="animate-fadeInDown relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl shadow-2xl p-8">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
              {initials}
            </div>
            <span className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white truncate">{user.name}</h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-indigo-200">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{user.phone}</span>}
              {user.department && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{user.department}</span>}
            </div>

            {/* Reward Points Badge */}
            {user.reward_points > 0 && (
              <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-sm font-bold px-3 py-1 rounded-full animate-pulse-glow">
                <Award className="w-4 h-4 text-amber-400" />
                {user.reward_points} Reward Points
                <Gift className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 hover:text-white text-sm font-bold rounded-xl transition-all btn-press"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag}   label="Total Orders"       value={orders.length}            color="indigo" delay={0}   />
        <StatCard icon={CheckCircle2}  label="Completed"          value={completedOrders}          color="emerald" delay={100} />
        <StatCard icon={CreditCard}    label="Total Spent"        value={`₹${totalSpent.toFixed(0)}`} color="blue" delay={200} />
        <StatCard icon={Award}         label="Reward Points"      value={user.reward_points || 0}  color="amber" delay={300} />
      </div>

      {/* ── TABS ── */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn space-y-6">
          {/* Profile Edit Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Account Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                saveMsg.includes('success')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {saveMsg}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60 btn-press"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { icon: User,         label: 'Name',        value: user.name },
                  { icon: Mail,         label: 'Email',       value: user.email },
                  { icon: Phone,        label: 'Phone',       value: user.phone || '—' },
                  { icon: Shield,       label: 'Role',        value: roleConfig.label },
                  { icon: GraduationCap,label: 'Department',  value: user.department || '—' },
                  { icon: Building2,    label: 'College',     value: user.college_name || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                    <Icon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rewards Banner */}
          {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
            <div
              onClick={() => navigate('/rewards')}
              className="cursor-pointer flex items-center justify-between p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all card-hover"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-float">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-lg">{user.reward_points || 0} Points Available</p>
                  <p className="text-amber-100 text-xs">Redeem for discounts and exclusive campus perks</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-amber-200 shrink-0" />
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'View Orders',     icon: ShoppingBag, path: '/orders',       color: 'indigo' },
                { label: 'Track Order',     icon: Clock,       path: '/orders',       color: 'blue' },
                { label: 'My Rewards',      icon: Gift,        path: '/rewards',      color: 'amber' },
                { label: 'Complaints',      icon: Bell,        path: '/complaints',   color: 'rose' },
                { label: 'Announcements',   icon: Sparkles,    path: '/announcements',color: 'violet' },
                { label: 'Notifications',   icon: Bell,        path: '/notifications',color: 'emerald' },
              ].map(({ label, icon: Icon, path, color }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-2.5 p-3 bg-${color}-50 dark:bg-${color}-950/30 border border-${color}-100 dark:border-${color}-900/50 text-${color}-700 dark:text-${color}-300 font-bold text-xs rounded-xl hover:bg-${color}-100 dark:hover:bg-${color}-950/60 transition-all btn-press`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ORDER HISTORY ── */}
      {activeTab === 'orders' && (
        <div className="animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Order History</h2>
            <button
              onClick={fetchOrders}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Refresh
            </button>
          </div>

          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl shimmer" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 font-semibold">No orders yet</p>
              <p className="text-xs text-slate-400 mt-1">Head to the canteen portal to place your first order.</p>
              <button
                onClick={() => navigate('/student')}
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, idx) => {
                const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={order.id}
                    className="animate-fadeInUp bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer card-hover"
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-black text-slate-400 font-mono">{order.id?.slice(0, 8).toUpperCase()}…</p>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" /> {order.status}
                          </span>
                          {order.payment_status === 'PAID' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                              PAID
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                          {order.canteen_name || 'Campus Canteen'} · {order.order_type?.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100">₹{parseFloat(order.final_amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-400">{order.item_count || '—'} items</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SETTINGS ── */}
      {activeTab === 'settings' && (
        <div className="animate-fadeIn space-y-4">
          {/* Theme Toggle */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-500" /> Appearance & Preferences
            </h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs text-slate-500">Toggle between light and dark themes</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Account Security
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Email verified', value: user.email, status: true },
                { label: 'Account status', value: 'Active', status: true },
                { label: 'Member since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'N/A', status: null },
              ].map(({ label, value, status }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
                  </div>
                  {status !== null && (
                    <span className={`w-2.5 h-2.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Session & Account
            </h2>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-rose-600/20 btn-press"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of CanteenX
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
