import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TIER_CONFIG = {
  BRONZE: { color: 'from-orange-700 to-orange-500', icon: '🥉', min: 0, max: 499 },
  SILVER: { color: 'from-gray-400 to-gray-300', icon: '🥈', min: 500, max: 1499 },
  GOLD: { color: 'from-yellow-500 to-yellow-300', icon: '🥇', min: 1500, max: 2999 },
  PLATINUM: { color: 'from-cyan-500 to-blue-400', icon: '💎', min: 3000, max: Infinity },
};

function getTier(points) {
  if (points >= 3000) return 'PLATINUM';
  if (points >= 1500) return 'GOLD';
  if (points >= 500) return 'SILVER';
  return 'BRONZE';
}

export default function RewardsPage() {
  const { user, token } = useAuth();
  const [points, setPoints] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      const [pointsRes, couponsRes] = await Promise.all([
        axios.get('/api/rewards/points', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/rewards/coupons', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPoints(pointsRes.data);
      setCoupons(couponsRes.data.coupons || []);
      setHistory(pointsRes.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponMsg(null);
    try {
      const res = await axios.post('/api/rewards/coupons/apply',
        { code: couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCouponMsg({ type: 'success', text: `Coupon applied! You save ₹${res.data.discount_value}` });
      setCouponCode('');
      fetchData();
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.response?.data?.error || 'Invalid or expired coupon' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-4">⭐</div>
          <p className="text-gray-400">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  const totalPoints = points?.total_points ?? user?.reward_points ?? 0;
  const tier = getTier(totalPoints);
  const tierCfg = TIER_CONFIG[tier];
  const nextTier = { BRONZE: 'SILVER', SILVER: 'GOLD', GOLD: 'PLATINUM', PLATINUM: null }[tier];
  const nextMin = nextTier ? TIER_CONFIG[nextTier].min : tierCfg.max;
  const progress = nextTier
    ? Math.min(100, ((totalPoints - tierCfg.min) / (nextMin - tierCfg.min)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Points Card */}
        <div className={`bg-gradient-to-br ${tierCfg.color} rounded-3xl p-8 text-white shadow-2xl`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest">Your Rewards</p>
              <h1 className="text-5xl font-black mt-1">{totalPoints.toLocaleString()}</h1>
              <p className="text-white/80 mt-1">points</p>
            </div>
            <div className="text-7xl">{tierCfg.icon}</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/80">
              <span>{tier} Member</span>
              {nextTier && <span>{nextMin - totalPoints} pts to {nextTier}</span>}
              {!nextTier && <span>Maximum tier reached! 🎉</span>}
            </div>
            <div className="bg-white/20 rounded-full h-2.5">
              <div
                className="bg-white rounded-full h-2.5 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].slice(0, 3).map(t => (
              <div key={t} className={`rounded-xl p-2 ${tier === t || (t === 'PLATINUM' && tier === 'PLATINUM') ? 'bg-white/30' : 'bg-white/10'}`}>
                <p className="text-lg">{TIER_CONFIG[t].icon}</p>
                <p className="text-xs text-white/80 font-medium">{t}</p>
                <p className="text-xs text-white/60">{TIER_CONFIG[t].min}+ pts</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm">
          {['overview', 'coupons', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'overview' ? '⭐ Overview' : tab === 'coupons' ? '🎟️ Coupons' : '📜 History'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* How to earn */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">💡 How to Earn Points</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { action: 'Place an order', pts: '+10 pts', icon: '🛒' },
                  { action: 'Order above ₹200', pts: '+20 pts', icon: '💰' },
                  { action: 'Rate food item', pts: '+5 pts', icon: '⭐' },
                  { action: 'First order of the day', pts: '+15 pts', icon: '🌅' },
                  { action: 'Complete 10 orders', pts: '+100 pts', icon: '🏆' },
                  { action: 'Refer a friend', pts: '+50 pts', icon: '👥' },
                ].map(item => (
                  <div key={item.action} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</p>
                    </div>
                    <span className="text-sm font-bold text-green-500">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">🎁 Tier Benefits</h2>
              <div className="space-y-3">
                {Object.entries(TIER_CONFIG).map(([t, cfg]) => (
                  <div key={t} className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                    tier === t
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                      : 'border-transparent bg-gray-50 dark:bg-gray-700/30'
                  }`}>
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {t} {tier === t && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full ml-1">Current</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {cfg.min === 0 ? 'Starting' : `${cfg.min}+`} points
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      {t === 'BRONZE' && 'Basic perks'}
                      {t === 'SILVER' && '5% bonus points'}
                      {t === 'GOLD' && '10% bonus + priority'}
                      {t === 'PLATINUM' && '20% bonus + VIP access'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            {/* Apply coupon */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">🎟️ Apply Coupon Code</h2>
              <form onSubmit={handleApplyCoupon} className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (e.g. WELCOME20)"
                  className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono tracking-wider"
                />
                <button
                  type="submit"
                  disabled={applying}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold disabled:opacity-50"
                >
                  {applying ? '...' : 'Apply'}
                </button>
              </form>
              {couponMsg && (
                <p className={`mt-3 text-sm font-medium ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {couponMsg.type === 'success' ? '✅' : '❌'} {couponMsg.text}
                </p>
              )}
            </div>

            {/* Available Coupons */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Available Coupons</h2>
              {coupons.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No coupons available right now</p>
              ) : (
                <div className="space-y-3">
                  {coupons.map(c => (
                    <div key={c.id} className="border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex items-center gap-4">
                      <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl p-3 text-2xl">🎟️</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="font-bold text-orange-600 dark:text-orange-400 text-sm tracking-wider">{c.code}</code>
                          {c.discount_type === 'PERCENTAGE' && (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium">
                              {c.discount_value}% OFF
                            </span>
                          )}
                          {c.discount_type === 'FLAT' && (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium">
                              ₹{c.discount_value} OFF
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">{c.description || 'Discount coupon'}</p>
                        {c.min_order_value && (
                          <p className="text-xs text-gray-400 mt-0.5">Min. order: ₹{c.min_order_value}</p>
                        )}
                      </div>
                      <button
                        onClick={() => { setCouponCode(c.code); setActiveTab('coupons'); }}
                        className="text-orange-500 text-sm font-medium hover:underline"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">📜 Points History</h2>
            {history.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No points history yet. Place your first order to earn points!</p>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{h.description || h.action}</p>
                      <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`font-bold ${h.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {h.points > 0 ? '+' : ''}{h.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
