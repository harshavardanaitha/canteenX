import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Sparkles, TrendingUp, AlertTriangle, Trash2,
  Package, ShoppingBag, Send, RefreshCw, Plus, CheckCircle2, Clock,
  UtensilsCrossed, Star, MessageSquare, Check, X, ShieldAlert, Image
} from 'lucide-react';

const CANTEENS = [
  { id: 'cnt_main', name: 'Main Campus Cafeteria' },
  { id: 'cnt_tech', name: 'Tech Park Express' },
  { id: 'cnt_green', name: 'Green Bites Healthy Corner' },
];

const PRESET_IMAGES = [
  { label: 'Paneer Roll', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
  { label: 'Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
  { label: 'Dosa / South Indian', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500' },
  { label: 'Chai / Beverage', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
  { label: 'Snacks / Samosa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' },
  { label: 'Chinese / Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500' },
];

export default function ManagerDashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [wasteAnalytics, setWasteAnalytics] = useState(null);
  const [prepSchedule, setPrepSchedule] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [canteenId, setCanteenId] = useState('cnt_main');
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Waste Modal State
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wastedQty, setWastedQty] = useState('');
  const [wasteReason, setWasteReason] = useState('LOW_DEMAND');

  // Manual Food Item Entry Modal State
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [foodForm, setFoodForm] = useState({
    name: '',
    category_id: '',
    category_name: '',
    price: '',
    description: '',
    is_veg: 1,
    prep_time_mins: 10,
    available_quantity: 50,
    calories: 280,
    image_url: PRESET_IMAGES[0].url
  });
  const [submittingFood, setSubmittingFood] = useState(false);
  const [foodSuccessMsg, setFoodSuccessMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [canteenId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [aRes, iRes, wRes, pRes, mRes, rRes] = await Promise.all([
        axios.get(`/api/analytics/dashboard?canteen_id=${canteenId}`),
        axios.get(`/api/inventory?canteen_id=${canteenId}`),
        axios.get(`/api/waste/analytics?canteen_id=${canteenId}`),
        axios.get(`/api/predictions/prep-planner?canteen_id=${canteenId}`),
        axios.get(`/api/menu?canteen_id=${canteenId}`),
        axios.get(`/api/reviews?canteen_id=${canteenId}`)
      ]);

      if (aRes.data.metrics) setMetrics(aRes.data.metrics);
      if (iRes.data.inventory) setInventory(iRes.data.inventory);
      if (wRes.data) setWasteAnalytics(wRes.data);
      if (pRes.data.preparation_schedule) setPrepSchedule(pRes.data.preparation_schedule);
      if (mRes.data.items) setMenuItems(mRes.data.items);
      if (mRes.data.categories) setCategories(mRes.data.categories);
      if (rRes.data.reviews) setReviews(rRes.data.reviews);
      if (rRes.data.stats) setReviewStats(rRes.data.stats);
    } catch (err) {
      console.error('Error fetching manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;

    setCopilotLoading(true);
    try {
      const res = await axios.post('/api/predictions/copilot/query', {
        prompt: copilotQuery,
        canteen_id: canteenId
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setCopilotResponse(res.data);
    } catch (err) {
      console.error('Copilot Error:', err);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/waste', {
        canteen_id: canteenId,
        wasted_quantity: parseFloat(wastedQty),
        waste_reason: wasteReason
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setShowWasteModal(false);
      setWastedQty('');
      fetchDashboardData();
    } catch (err) {
      alert('Error logging waste record.');
    }
  };

  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    if (!foodForm.name || !foodForm.price) {
      alert('Please enter Item Name and Price.');
      return;
    }
    setSubmittingFood(true);
    try {
      await axios.post('/api/menu', {
        canteen_id: canteenId,
        category_id: foodForm.category_id || null,
        category_name: foodForm.category_name || (!foodForm.category_id ? 'Quick Bites' : null),
        name: foodForm.name,
        description: foodForm.description,
        price: parseFloat(foodForm.price),
        is_veg: foodForm.is_veg,
        prep_time_mins: parseInt(foodForm.prep_time_mins) || 10,
        available_quantity: parseInt(foodForm.available_quantity) || 50,
        calories: parseInt(foodForm.calories) || 250,
        image_url: foodForm.image_url
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setFoodSuccessMsg(`"${foodForm.name}" added to live menu!`);
      setTimeout(() => {
        setFoodSuccessMsg('');
        setShowAddFoodModal(false);
        setFoodForm({
          name: '',
          category_id: '',
          category_name: '',
          price: '',
          description: '',
          is_veg: 1,
          prep_time_mins: 10,
          available_quantity: 50,
          calories: 280,
          image_url: PRESET_IMAGES[0].url
        });
        fetchDashboardData();
      }, 1400);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create food item');
    } finally {
      setSubmittingFood(false);
    }
  };

  const handleToggleStock = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'SOLD_OUT' ? 'AVAILABLE' : 'SOLD_OUT';
    try {
      await axios.patch(`/api/menu/${itemId}/availability`, {
        availability_status: nextStatus,
        available_quantity: nextStatus === 'SOLD_OUT' ? 0 : 50
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleDeleteFoodItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}" from the menu?`)) return;
    try {
      await axios.delete(`/api/menu/${itemId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete menu item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              CANTEEN MANAGER OPERATIONAL HUB
            </span>
            <select
              value={canteenId}
              onChange={(e) => setCanteenId(e.target.value)}
              className="bg-purple-950 border border-purple-400/40 text-purple-100 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none"
            >
              {CANTEENS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Canteen Operations & Food Management</h1>
          <p className="text-xs text-purple-200">Real-time sales, manual food item creation, kitchen batching, and student reviews.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddFoodModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Manually Add Food Item
          </button>
          <button onClick={fetchDashboardData} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* METRICS OVERVIEW CARDS */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm space-y-1">
            <p className="text-xs text-slate-500 font-medium">Total Orders</p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{metrics.total_orders}</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm space-y-1">
            <p className="text-xs text-slate-500 font-medium">Gross Revenue</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{metrics.total_revenue.toFixed(2)}</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm space-y-1">
            <p className="text-xs text-slate-500 font-medium">Recorded Waste Cost</p>
            <p className="text-3xl font-black text-rose-500">₹{metrics.total_waste_cost.toFixed(2)}</p>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm space-y-1">
            <p className="text-xs text-slate-500 font-medium">Customer Rating</p>
            <p className="text-3xl font-black text-amber-500 flex items-center gap-1">
              <Star className="w-6 h-6 fill-amber-500" /> {reviewStats?.avg_rating || '4.8'}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: LIVE MENU CATALOG & MANUAL ENTRY */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-indigo-500" /> Live Menu Items Catalog ({menuItems.length})
            </h2>
            <p className="text-xs text-slate-400">Manage dish prices, instant availability, and manual recipe entries.</p>
          </div>

          <button
            onClick={() => setShowAddFoodModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Dish / Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Prep Time</th>
                <th className="p-3">Stock Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:border-slate-700/60">
              {menuItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image_url || PRESET_IMAGES[0].url}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{item.calories || 250} kcal</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    {item.category_name || 'General'}
                  </td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-slate-100">
                    ₹{parseFloat(item.price).toFixed(2)}
                  </td>
                  <td className="p-3 font-medium text-slate-500">
                    ~{item.prep_time_mins || 10}m
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                    {item.available_quantity} units
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStock(item.id, item.availability_status)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                        item.availability_status === 'SOLD_OUT'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.availability_status === 'SOLD_OUT' ? 'SOLD OUT' : 'AVAILABLE'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteFoodItem(item.id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: AI OPERATIONS COPILOT BOT */}
      <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800/80 dark:to-slate-800 border border-indigo-200 dark:border-slate-700 rounded-3xl space-y-4 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">AI Operations Copilot</h3>
            <p className="text-xs text-slate-500">Ask operational questions grounded strictly in database statistics</p>
          </div>
        </div>

        <form onSubmit={handleCopilotSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. How is today's canteen performing? Which ingredient needs restocking?"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={copilotLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
          >
            {copilotLoading ? 'Analyzing...' : <><Send className="w-4 h-4" /> Ask Copilot</>}
          </button>
        </form>

        {copilotResponse && (
          <div className="p-4 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-2xl text-xs space-y-2 animate-fadeIn">
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Copilot Answer:</p>
            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">{copilotResponse.answer}</p>
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT CUSTOMER FEEDBACK & REVIEWS */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" /> Customer Food Feedback & Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-slate-400">Student and faculty verified taste, hygiene, and counter ratings.</p>
          </div>
          <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-500" /> Average Rating: {reviewStats?.avg_rating || '4.8'} / 5.0
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No customer reviews logged for this canteen yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviews.slice(0, 6).map(rev => (
              <div key={rev.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                    <span className="ml-1 text-slate-800 dark:text-slate-200 font-black">{rev.rating}.0</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {rev.reviewer_role || 'STUDENT'}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {rev.item_name ? `Dish: ${rev.item_name}` : 'General Canteen Experience'}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{rev.comment || 'Good food and clean preparation!'}"
                </p>

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                  <span>By: {rev.reviewer_name || 'Anonymous Student'}</span>
                  <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: SMART PREPARATION PLANNER */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Smart Kitchen Preparation Planner (WHAT • WHEN • HOW MUCH)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prepSchedule.map((p, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-indigo-600 dark:text-indigo-400">{p.time}</span>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">{p.priority}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.item}</p>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Prepare {p.prep_qty} {p.unit}</p>
              <p className="text-[10px] text-slate-400 italic">{p.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: INVENTORY & PREDICTIVE ALERTS */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" /> Smart Ingredient Inventory & Predictive Restock
          </h2>
          <button
            onClick={() => setShowWasteModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Log Food Waste
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Ingredient</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Predictive Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {inventory.map(item => (
                <tr key={item.id}>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.ingredient_name}</td>
                  <td className="p-3 font-semibold">{item.current_stock} {item.unit}</td>
                  <td className="p-3">{item.min_stock_threshold} {item.unit}</td>
                  <td className="p-3">
                    {item.predictive_alert ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {item.predictive_alert}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Stock Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: MANUAL ENTRY OF FOOD ITEM */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Manually Add Food Item</h3>
              </div>
              <button onClick={() => setShowAddFoodModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {foodSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-200 text-center font-bold text-sm">
                ✓ {foodSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleAddFoodItem} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paneer Butter Masala Roll"
                    value={foodForm.name}
                    onChange={(e) => setFoodForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Category</label>
                    <select
                      value={foodForm.category_id}
                      onChange={(e) => setFoodForm(f => ({ ...f, category_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">+ New Category Name Below</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {!foodForm.category_id && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">New Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Quick Snacks"
                        value={foodForm.category_name}
                        onChange={(e) => setFoodForm(f => ({ ...f, category_name: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="85"
                      value={foodForm.price}
                      onChange={(e) => setFoodForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Stock</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={foodForm.available_quantity}
                      onChange={(e) => setFoodForm(f => ({ ...f, available_quantity: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Prep (Mins)</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={foodForm.prep_time_mins}
                      onChange={(e) => setFoodForm(f => ({ ...f, prep_time_mins: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dietary Type:</span>
                  <button
                    type="button"
                    onClick={() => setFoodForm(f => ({ ...f, is_veg: 1 }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      foodForm.is_veg === 1
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-300" /> Pure Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodForm(f => ({ ...f, is_veg: 0 }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      foodForm.is_veg === 0
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-300" /> Non-Veg
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Fresh ingredients, spice level, or serving portion details..."
                    value={foodForm.description}
                    onChange={(e) => setFoodForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Preset Image</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_IMAGES.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFoodForm(f => ({ ...f, image_url: p.url }))}
                        className={`p-1 rounded-xl border text-[10px] font-bold shrink-0 transition-all ${
                          foodForm.image_url === p.url
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-14 h-10 object-cover rounded-lg" />
                        <span className="block mt-0.5 truncate w-14 text-slate-600 dark:text-slate-400">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFoodModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFood}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {submittingFood ? 'Adding to Menu...' : 'Save & Publish to Canteen'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: LOG WASTE MODAL */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record Food Waste Log</h3>
            <form onSubmit={handleLogWaste} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Wasted Servings / Quantity</label>
                <input
                  type="number"
                  required
                  value={wastedQty}
                  onChange={(e) => setWastedQty(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Waste</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="LOW_DEMAND">Low Demand</option>
                  <option value="OVERSTOCK">Overstock</option>
                  <option value="EXPIRED">Expired Ingredient</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="PREPARATION_ERROR">Preparation Error</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                >
                  Save Waste Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
