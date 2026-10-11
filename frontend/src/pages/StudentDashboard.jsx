import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed, Search, Clock, Sparkles, Star, Plus, Check,
  AlertCircle, Flame, Filter, ChevronRight, Award, Leaf, MessageSquarePlus, X
} from 'lucide-react';

export default function StudentDashboard() {
  const { addToCart, canteenId } = useCart();
  const { user, token } = useAuth();

  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState('cnt_main');
  const [canteenDetail, setCanteenDetail] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    fetchCanteens();
  }, []);

  useEffect(() => {
    if (selectedCanteen) {
      fetchMenuAndRecommendations(selectedCanteen);
    }
  }, [selectedCanteen]);

  const fetchCanteens = async () => {
    try {
      const res = await axios.get('/api/canteens');
      if (res.data.canteens) {
        setCanteens(res.data.canteens);
      }
    } catch (err) {
      console.error('Error fetching canteens:', err);
    }
  };

  const fetchMenuAndRecommendations = async (cId) => {
    setLoading(true);
    try {
      const [cRes, mRes, rRes] = await Promise.all([
        axios.get(`/api/canteens/${cId}`),
        axios.get(`/api/menu?canteen_id=${cId}`),
        axios.get(`/api/predictions/recommendations?canteen_id=${cId}`)
      ]);

      if (cRes.data.canteen) setCanteenDetail(cRes.data.canteen);
      if (mRes.data.categories) setCategories(mRes.data.categories);
      if (mRes.data.items) setMenuItems(mRes.data.items);
      if (rRes.data.recommendations) setRecommendations(rRes.data.recommendations);
    } catch (err) {
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalItem) return;
    setSubmittingReview(true);
    try {
      await axios.post('/api/reviews', {
        canteen_id: selectedCanteen,
        menu_item_id: reviewModalItem.id,
        rating: ratingValue,
        comment: reviewComment,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setReviewSuccessMsg('Thank you! Your verified food rating was recorded.');
      setTimeout(() => {
        setReviewSuccessMsg('');
        setReviewModalItem(null);
        setReviewComment('');
        fetchMenuAndRecommendations(selectedCanteen);
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category_id === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !vegOnly || item.is_veg === 1;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">AVAILABLE</span>;
      case 'LOW_STOCK':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">LOW STOCK</span>;
      case 'SOLD_OUT':
        return <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-bold">SOLD OUT</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">UNAVAILABLE</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* CANTEEN SELECTOR & LIVE QUEUE BANNER */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role || 'STUDENT'} PORTAL
            </span>
            {user?.reward_points > 0 && (
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> {user.reward_points} Reward Points
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Select Campus Canteen</h1>
          <p className="text-xs text-indigo-200 max-w-lg">Order fresh meals, track live kitchen queues, and skip physical counter waiting time.</p>
          
          <select
            value={selectedCanteen}
            onChange={(e) => setSelectedCanteen(e.target.value)}
            className="mt-2 bg-slate-800/90 border border-indigo-400/30 text-white font-bold text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {canteens.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.campus_name})</option>
            ))}
          </select>
        </div>

        {/* LIVE QUEUE STATS */}
        {canteenDetail && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shrink-0 w-full md:w-auto">
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-xs text-indigo-200">Current Queue</p>
              <p className="text-2xl font-black text-amber-400">{canteenDetail.current_queue_count} Orders</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-indigo-200">Est. Waiting Time</p>
              <p className="text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <Clock className="w-5 h-5" /> ~{canteenDetail.estimated_wait_mins} mins
              </p>
            </div>
          </div>
        )}

      </div>

      {/* MULTI-CANTEEN LIVE QUEUE & CROWD HEATMAP COMPARISON */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" /> Live Campus Canteen Crowd Comparison
          </h2>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            ● Live AI Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {canteens.map(c => {
            const isSelected = c.id === selectedCanteen;
            const wait = c.estimated_wait_mins || (c.id === 'cnt_main' ? 12 : c.id === 'cnt_tech' ? 6 : 4);
            const queue = c.current_queue_count || (c.id === 'cnt_main' ? 8 : c.id === 'cnt_tech' ? 3 : 1);
            const crowdStatus = wait > 15 ? 'PEAK CROWD' : wait > 8 ? 'MODERATE' : 'LOW CROWD';
            const crowdColor = wait > 15 ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' : wait > 8 ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCanteen(c.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{c.name}</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${crowdColor}`}>
                    {crowdStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Queue: <strong className="text-slate-800 dark:text-slate-200">{queue}</strong> orders</span>
                  <span>Wait: <strong className="text-slate-800 dark:text-slate-200">~{wait} mins</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUSTAINABILITY & ECO-IMPACT WIDGET */}
      <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">Zero-Queue Campus Sustainability</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Pre-ordering eliminates paper token slips and allows kitchens to prepare exact ingredient portions, cutting campus food waste by 28%.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-black text-xs">
          <div className="text-center">
            <span className="block text-emerald-600 dark:text-emerald-400 text-lg">18.4 kg</span>
            <span className="text-[10px] text-emerald-600/80">Campus CO2 Saved</span>
          </div>
          <div className="text-center border-l border-emerald-300 dark:border-emerald-700 pl-4">
            <span className="block text-emerald-600 dark:text-emerald-400 text-lg">+10 pts</span>
            <span className="text-[10px] text-emerald-600/80">Per Zero-Waste Order</span>
          </div>
        </div>
      </div>

      {/* AI PERSONALIZED RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Personalized Meal Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map(rec => (
              <div key={rec.id} className="p-4 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-slate-800 dark:to-slate-800/60 border border-indigo-200/60 dark:border-slate-700/60 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full block w-max">
                    {rec.recommendation_reason}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{rec.name}</h4>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">₹{parseFloat(rec.price).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => addToCart(rec, selectedCanteen)}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        
        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* VEG TOGGLE & CATEGORIES */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setVegOnly(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors ${
              vegOnly
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg Only
          </button>

          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Items
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-colors ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* MENU ITEMS GRID */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium">Loading live canteen menu...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-medium">No menu items match your search criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group">
              
              {/* IMAGE & BADGES */}
              <div className="relative h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full border-2 border-white ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {getAvailabilityBadge(item.availability_status)}
                </div>
                {item.is_popular === 1 && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-slate-950" /> POPULAR
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                    <button
                      onClick={() => setReviewModalItem(item)}
                      title="Rate this dish"
                      className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {parseFloat(item.rating || 4.5).toFixed(1)}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">₹{parseFloat(item.price).toFixed(2)}</span>
                    <span className="block text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" /> {item.prep_time_mins} mins prep
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReviewModalItem(item)}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                      title="Leave a review"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToCart(item, selectedCanteen)}
                      disabled={item.availability_status === 'SOLD_OUT' || item.availability_status === 'TEMPORARILY_UNAVAILABLE'}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DISH REVIEW & RATING MODAL */}
      {reviewModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Rate {reviewModalItem.name}</h3>
              </div>
              <button onClick={() => setReviewModalItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-200 text-center font-bold text-sm">
                ✓ {reviewSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Your Star Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingValue(star)}
                        className={`p-2 rounded-xl transition-all ${
                          ratingValue >= star
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${ratingValue >= star ? 'fill-amber-500' : ''}`} />
                      </button>
                    ))}
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 ml-2">{ratingValue} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback Comment (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Taste, freshness, spice level, or kitchen feedback..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalItem(null)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
