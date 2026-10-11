import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Ticket, Clock, QrCode, CheckCircle2, ChefHat, ArrowLeft,
  ShoppingBag, Sparkles
} from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderTracking();
    const interval = setInterval(fetchOrderTracking, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrderTracking = async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      if (res.data.order) setOrder(res.data.order);
    } catch (err) {
      console.error('Error fetching order tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 font-medium">Loading live order tracking...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-500 font-medium">Order tracking details not found.</p>
        <Link to="/student" className="text-indigo-600 font-bold hover:underline">Back to Menu</Link>
      </div>
    );
  }

  const steps = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  const currentStepIndex = steps.indexOf(order.order_status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/student" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </Link>

      {/* DIGITAL TOKEN CARD */}
      <div className="p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-2xl space-y-6 text-center border border-indigo-500/30 relative overflow-hidden">
        
        <div className="space-y-1">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            DIGITAL COUNTER TOKEN
          </span>
          <h1 className="text-5xl font-black tracking-tight text-white mt-2">TOKEN #{order.token_number}</h1>
          <p className="text-xs text-indigo-200">Order Number: <span className="font-bold text-white">{order.order_number}</span></p>
        </div>

        {/* QR CODE TOKEN DISPLAY */}
        <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border-4 border-indigo-400/30">
          <div className="w-40 h-40 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center p-3 space-y-2">
            <QrCode className="w-24 h-24 text-white" />
            <span className="text-[10px] font-mono text-slate-300 font-bold tracking-wider">{order.token_code || order.order_number}</span>
          </div>
        </div>

        <p className="text-xs text-indigo-200">
          Show this QR code at the canteen counter when status changes to <span className="font-bold text-emerald-400">READY</span>.
        </p>

        {/* ESTIMATED WAIT TIME */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-6 text-xs">
          <div>
            <span className="text-indigo-300 block">Currently Serving</span>
            <span className="text-lg font-black text-amber-400">TOKEN #{Math.max(1, order.token_number - 2)}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-indigo-300 block">Estimated Prep Time</span>
            <span className="text-lg font-black text-emerald-400 flex items-center gap-1 justify-center">
              <Clock className="w-4 h-4" /> ~{order.est_prep_mins} mins
            </span>
          </div>
        </div>

      </div>

      {/* LIVE PROGRESS TIMELINE */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-indigo-500" /> Live Order Status Tracker
        </h2>

        <div className="grid grid-cols-5 gap-2 text-center">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            return (
              <div key={step} className="space-y-2">
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`block text-[10px] font-bold ${
                  isDone ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ORDER ITEM LINES & RECEIPT */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-indigo-500" /> Order Summary
        </h3>

        <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-700/60">
          {order.items?.map((item, idx) => (
            <div key={idx} className="pt-2 flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>{item.quantity}x {item.item_name}</span>
              <span>₹{parseFloat(item.total_price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-extrabold text-slate-900 dark:text-slate-100">
          <span>Total Paid ({order.payment_status})</span>
          <span className="text-indigo-600 dark:text-indigo-400">₹{parseFloat(order.final_amount).toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
}
