import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRScannerModal from '../components/QRScannerModal';
import { useAuth } from '../context/AuthContext';
import {
  ChefHat, QrCode, Clock, CheckCircle2, AlertCircle, RefreshCw,
  ToggleLeft, ToggleRight, Flame, User, Check, Layers, Trash2, X
} from 'lucide-react';

const CANTEENS = [
  { id: 'cnt_main', name: 'Main Campus Cafeteria' },
  { id: 'cnt_tech', name: 'Tech Park Express' },
  { id: 'cnt_green', name: 'Green Bites Healthy Corner' },
];

export default function StaffDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [canteenId, setCanteenId] = useState('cnt_main');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'batches'

  // Waste Modal State
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wasteForm, setWasteForm] = useState({
    menu_item_id: '',
    prepared_quantity: '',
    sold_quantity: '',
    wasted_quantity: '',
    waste_reason: 'OVERPREPARED',
  });
  const [wasteSubmitting, setWasteSubmitting] = useState(false);
  const [wasteSuccessMsg, setWasteSuccessMsg] = useState('');

  useEffect(() => {
    fetchOrdersAndMenu();
    const interval = setInterval(fetchOrdersAndMenu, 5000);
    return () => clearInterval(interval);
  }, [canteenId]);

  const fetchOrdersAndMenu = async () => {
    try {
      const [oRes, mRes, bRes] = await Promise.all([
        axios.get(`/api/orders?canteen_id=${canteenId}`),
        axios.get(`/api/menu?canteen_id=${canteenId}`),
        axios.get(`/api/orders/kitchen-batches?canteen_id=${canteenId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }).catch(() => ({ data: { batches: [] } }))
      ]);
      if (oRes.data.orders) setOrders(oRes.data.orders);
      if (mRes.data.items) setMenuItems(mRes.data.items);
      if (bRes.data.batches) setBatches(bRes.data.batches);
    } catch (err) {
      console.error('Error loading kitchen queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrdersAndMenu();
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'SOLD_OUT' ? 'AVAILABLE' : 'SOLD_OUT';
    try {
      await axios.patch(`/api/menu/${itemId}/availability`, {
        availability_status: nextStatus,
        available_quantity: nextStatus === 'SOLD_OUT' ? 0 : 50
      });
      fetchOrdersAndMenu();
    } catch (err) {
      alert('Error updating stock status');
    }
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    if (!wasteForm.wasted_quantity || parseFloat(wasteForm.wasted_quantity) <= 0) {
      alert('Please enter a valid wasted quantity.');
      return;
    }
    setWasteSubmitting(true);
    try {
      await axios.post('/api/waste', {
        canteen_id: canteenId,
        menu_item_id: wasteForm.menu_item_id || null,
        prepared_quantity: parseFloat(wasteForm.prepared_quantity) || 0,
        sold_quantity: parseFloat(wasteForm.sold_quantity) || 0,
        wasted_quantity: parseFloat(wasteForm.wasted_quantity),
        waste_reason: wasteForm.waste_reason,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWasteSuccessMsg('Food waste logged successfully. Sustainability score updated.');
      setTimeout(() => {
        setWasteSuccessMsg('');
        setIsWasteModalOpen(false);
        setWasteForm({
          menu_item_id: '',
          prepared_quantity: '',
          sold_quantity: '',
          wasted_quantity: '',
          waste_reason: 'OVERPREPARED',
        });
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record food waste');
    } finally {
      setWasteSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER BAR */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 via-slate-900 to-emerald-950 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              KITCHEN OPERATIONS PORTAL
            </span>
            <select
              value={canteenId}
              onChange={(e) => setCanteenId(e.target.value)}
              className="bg-emerald-900/80 border border-emerald-500/40 text-emerald-100 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none"
            >
              {CANTEENS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Live Kitchen Operations</h1>
          <p className="text-xs text-emerald-200">Real-time order queue, smart batch prep planning, and QR token validation.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsWasteModalOpen(true)}
            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Log Food Waste
          </button>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0"
          >
            <QrCode className="w-4 h-4" /> Counter QR Scanner
          </button>
        </div>
      </div>

      {/* TABS: QUEUE VS ORDER BATCHING */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-colors ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ChefHat className="w-4 h-4" /> Live Order Pipeline ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-colors ${
              activeTab === 'batches'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Smart Batch Prep Planner ({batches.length})
          </button>
        </div>
        <button onClick={fetchOrdersAndMenu} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* TAB 1: ACTIVE ORDERS KITCHEN QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium">Loading kitchen queue...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-medium">
              No pending kitchen orders at this moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    order.order_status === 'PLACED'
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : order.order_status === 'PREPARING'
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                      : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {/* ORDER CARD HEADER */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <div>
                        <span className="text-xs font-black text-slate-400 uppercase">TOKEN</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">#{order.token_number}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                          {order.order_number}
                        </span>
                        <p className="text-xs font-semibold text-slate-500 mt-1">{order.order_type}</p>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Customer: <span className="font-bold text-slate-900 dark:text-slate-100">{order.customer_name}</span> ({order.customer_role})
                    </div>

                    {/* ITEM LINES */}
                    <div className="space-y-1 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl text-xs">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>{item.quantity}x {item.item_name}</span>
                          <span>₹{parseFloat(item.total_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STATUS ACTIONS */}
                  <div className="pt-2">
                    {order.order_status === 'PLACED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.order_status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Start Preparation
                      </button>
                    )}
                    {order.order_status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Mark Ready for Token Pickup
                      </button>
                    )}
                    {order.order_status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Mark Completed & Delivered
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SMART BATCH PREPARATION PLANNER */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong>Consolidated Kitchen Batching:</strong> Cooking matching items together saves ~35% preparation time and kitchen energy.</span>
            </div>
            <span className="font-bold">{batches.reduce((acc, b) => acc + parseInt(b.total_qty || 0), 0)} Total Units Needed</span>
          </div>

          {batches.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-medium">
              No active batches to cook right now. All current orders are processed!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {batches.map((batch, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {batch.category_name || 'KITCHEN BATCH'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{batch.order_count} active orders</span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">{batch.item_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Est. {batch.prep_time_mins || 10} mins batch cook time</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Required:</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {batch.total_qty} <span className="text-xs text-slate-400 font-medium">portions</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUICK MENU AVAILABILITY TOGGLES */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Live Item Stock Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {menuItems.map(item => (
            <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400">Stock: {item.available_quantity}</p>
              </div>

              <button
                onClick={() => handleToggleAvailability(item.id, item.availability_status)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  item.availability_status === 'SOLD_OUT'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {item.availability_status === 'SOLD_OUT' ? 'SOLD OUT' : 'AVAILABLE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onVerified={fetchOrdersAndMenu}
      />

      {/* FOOD WASTE LOGGING MODAL */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Log End-of-Day Food Waste</h3>
              </div>
              <button onClick={() => setIsWasteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {wasteSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-800 dark:text-emerald-200 text-center font-bold text-sm">
                ✓ {wasteSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleLogWaste} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Menu Item (Optional)</label>
                  <select
                    value={wasteForm.menu_item_id}
                    onChange={(e) => setWasteForm(f => ({ ...f, menu_item_id: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="">General Batch / Unspecified</option>
                    {menuItems.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (₹{m.price})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Prepared Qty (Portions)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={wasteForm.prepared_quantity}
                      onChange={(e) => setWasteForm(f => ({ ...f, prepared_quantity: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sold Qty (Portions)</label>
                    <input
                      type="number"
                      placeholder="e.g. 42"
                      value={wasteForm.sold_quantity}
                      onChange={(e) => setWasteForm(f => ({ ...f, sold_quantity: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Wasted Quantity (Portions / Kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 8"
                    value={wasteForm.wasted_quantity}
                    onChange={(e) => setWasteForm(f => ({ ...f, wasted_quantity: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason for Waste *</label>
                  <select
                    value={wasteForm.waste_reason}
                    onChange={(e) => setWasteForm(f => ({ ...f, waste_reason: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="OVERPREPARED">Overprepared / End of Service</option>
                    <option value="EXPIRED">Ingredient Expired / Passed Shelf Life</option>
                    <option value="SPOILED">Cooking Defect / Burnt / Spoilage</option>
                    <option value="QUALITY_REJECTED">Quality Inspection Rejected</option>
                    <option value="CUSTOMER_CANCELLED">Customer Cancellation</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWasteModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={wasteSubmitting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                  >
                    {wasteSubmitting ? 'Logging...' : 'Record Waste'}
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
