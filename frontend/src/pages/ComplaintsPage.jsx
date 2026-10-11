import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Star, MessageSquare, Plus, Filter, Search, X, CheckCircle2,
  AlertTriangle, ShieldCheck, User, Sparkles, UtensilsCrossed, ThumbsUp
} from 'lucide-react';

const COMPLAINT_CATEGORIES = [
  { value: 'FOOD_QUALITY', label: 'Food Quality', icon: '🍽️' },
  { value: 'SERVICE', label: 'Service', icon: '🛎️' },
  { value: 'HYGIENE', label: 'Hygiene', icon: '🧼' },
  { value: 'PRICING', label: 'Pricing', icon: '💰' },
  { value: 'WAITING_TIME', label: 'Waiting Time', icon: '⏱️' },
  { value: 'DELIVERY', label: 'Delivery', icon: '📦' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
];

const STATUS_COLORS = {
  OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  IN_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

export default function ComplaintsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'complaints'

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg_rating: '4.8', total_reviews: 0 });
  const [reviewFilterCanteen, setReviewFilterCanteen] = useState('');
  const [reviewMinRating, setReviewMinRating] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    canteen_id: 'cnt_main',
    menu_item_id: '',
    rating: 5,
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Complaints State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [form, setForm] = useState({
    canteen_id: '',
    order_id: '',
    category: 'FOOD_QUALITY',
    subject: '',
    description: '',
  });

  const isStaff = ['CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  // Fetch Canteens and Menu Items
  useEffect(() => {
    axios.get('/api/canteens').then(r => setCanteens(r.data.canteens || [])).catch(() => {});
    axios.get('/api/menu?canteen_id=cnt_main').then(r => setMenuItems(r.data.items || [])).catch(() => {});
  }, []);

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    try {
      const params = {};
      if (reviewFilterCanteen) params.canteen_id = reviewFilterCanteen;
      if (reviewMinRating) params.min_rating = reviewMinRating;
      if (reviewSearch) params.search = reviewSearch;

      const res = await axios.get('/api/reviews', { params });
      if (res.data.reviews) setReviews(res.data.reviews);
      if (res.data.stats) setReviewStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, [reviewFilterCanteen, reviewMinRating, reviewSearch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Fetch Complaints
  const fetchComplaints = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await axios.get('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await axios.post('/api/reviews', {
        canteen_id: reviewForm.canteen_id || 'cnt_main',
        menu_item_id: reviewForm.menu_item_id || null,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setReviewSuccessMsg('Review recorded! +5 Loyalty points added to your account.');
      setTimeout(() => {
        setReviewSuccessMsg('');
        setShowReviewModal(false);
        setReviewForm({ canteen_id: 'cnt_main', menu_item_id: '', rating: 5, comment: '' });
        fetchReviews();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/complaints', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowForm(false);
      setForm({ canteen_id: '', order_id: '', category: 'FOOD_QUALITY', subject: '', description: '' });
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/complaints/${id}/status`, { status, response: responseText || undefined }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResponseText('');
      fetchComplaints();
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(prev => ({ ...prev, status }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const openDetail = async (c) => {
    try {
      const res = await axios.get(`/api/complaints/${c.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedComplaint(res.data);
    } catch {
      setSelectedComplaint(c);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-indigo-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              CAMPUS EXPERIENCE FEEDBACK
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">Feedback, Reviews & Complaints Hub</h1>
            <p className="text-xs text-indigo-200">Share your meal ratings, read campus food feedback, and file formal counter service tickets.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-slate-950" /> Rate a Meal / Review
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
            >
              + File Ticket
            </button>
          </div>
        </div>

        {/* TABS: FOOD REVIEWS VS FORMAL COMPLAINTS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-6 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Food & Canteen Reviews ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 px-6 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'complaints'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Service Inquiries & Tickets ({complaints.length})
          </button>
        </div>

        {/* TAB 1: FOOD REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            
            {/* STATS & FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-500">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{reviewStats.avg_rating} / 5.0</span>
                  <p className="text-[11px] text-slate-400">Campus Average Rating</p>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{reviews.length}+</span>
                  <p className="text-[11px] text-slate-400">Verified Reviews</p>
                </div>
              </div>

              <div className="md:col-span-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search by dish or keyword..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={reviewMinRating}
                  onChange={(e) => setReviewMinRating(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="">All Star Ratings</option>
                  <option value="5">5 Stars Only</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>
            </div>

            {/* REVIEWS GRID */}
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 font-medium">
                No reviews found matching your search criteria. Be the first to rate a meal!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                          ))}
                          <span className="ml-1 text-slate-900 dark:text-slate-100 font-black text-sm">{rev.rating}.0</span>
                        </div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {rev.reviewer_role || 'STUDENT'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {rev.item_name || rev.canteen_name || 'Canteen Meal'}
                        </h4>
                        <p className="text-[10px] text-slate-400">{rev.canteen_name}</p>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{rev.comment || 'Great taste and fast counter token service!'}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.reviewer_name || 'Campus Student'}</span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: COMPLAINTS & TICKETS */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">Track and respond to counter discrepancies, refunds, or hygiene tickets.</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="">All Ticket Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400 font-medium">Loading tickets...</div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-400 font-medium">
                No complaints recorded. Everything is running smoothly!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map(c => (
                  <div
                    key={c.id}
                    onClick={() => openDetail(c)}
                    className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:shadow-md transition-shadow space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">{c.ticket_number || c.id}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-800'}`}>
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{c.subject}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                      <span>{c.canteen_name || 'Campus Canteen'}</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW SUBMISSION MODAL */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Leave Food Feedback & Review</h3>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Campus Canteen *</label>
                    <select
                      value={reviewForm.canteen_id}
                      onChange={(e) => setReviewForm(f => ({ ...f, canteen_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                    >
                      {canteens.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Food Item (Optional)</label>
                    <select
                      value={reviewForm.menu_item_id}
                      onChange={(e) => setReviewForm(f => ({ ...f, menu_item_id: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">General Canteen Experience</option>
                      {menuItems.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Star Rating *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          className={`p-2 rounded-xl transition-all ${
                            reviewForm.rating >= star
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                          }`}
                        >
                          <Star className={`w-6 h-6 ${reviewForm.rating >= star ? 'fill-amber-500' : ''}`} />
                        </button>
                      ))}
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 ml-2">{reviewForm.rating} / 5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Feedback Comment *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Taste, freshness, serving portion, temperature, or hygiene..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'Posting...' : 'Submit Review (+5 Pts)'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* COMPLAINT SUBMISSION MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">File Issue / Complaint</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Canteen *</label>
                  <select
                    value={form.canteen_id}
                    required
                    onChange={(e) => setForm(f => ({ ...f, canteen_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="">Select Canteen</option>
                    {canteens.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Issue Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {COMPLAINT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Short summary of the issue"
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="What happened? Include token number if applicable..."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                  >
                    {submitting ? 'Filing...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
