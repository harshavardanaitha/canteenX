import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      if (res.data.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders list:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">My Orders & Tokens</h1>
          <p className="text-xs text-slate-500">Track current tokens and review past meal history</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-medium">
          You haven't placed any food orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 block group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-black">
                  <span className="text-[10px] uppercase text-indigo-400 font-bold">TOKEN</span>
                  <span className="text-base leading-none">#{order.token_number}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                    {order.order_number} ({order.canteen_name || 'Main Canteen'})
                  </h4>
                  <p className="text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 1} items • ₹{parseFloat(order.final_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  order.order_status === 'COMPLETED'
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                }`}>
                  {order.order_status}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
