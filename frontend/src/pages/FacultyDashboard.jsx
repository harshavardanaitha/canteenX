import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Building, Sparkles, Clock, MapPin, CheckCircle2, ArrowRight,
  Coffee, Utensils, Users, ShieldCheck, BookmarkCheck
} from 'lucide-react';

const FACULTY_COMBOS = [
  {
    id: 'fac_combo_1',
    name: 'Executive South Indian Lunch Thali',
    desc: 'Rice, Sambar, Rasam, 2 Poriyals, Curd, Appalam, Sweet & Filter Coffee',
    price: 120,
    prepTime: 10,
    icon: '🍱'
  },
  {
    id: 'fac_combo_2',
    name: 'Morning Energy Combo',
    desc: '2 Idlis + 1 Medu Vada with hot Sambar, Coconut Chutney & Filter Coffee',
    price: 65,
    prepTime: 5,
    icon: '☕'
  },
  {
    id: 'fac_combo_3',
    name: 'Department Meeting Tea & Snacks (10 Portions)',
    desc: '10x Hot Samosas with Mint Chutney + 10x Fresh Masala Chai flask',
    price: 350,
    prepTime: 15,
    icon: '👥'
  }
];

export default function FacultyDashboard() {
  const { cabinDetails, setCabinDetails, setOrderType, addToCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [building, setBuilding] = useState(cabinDetails.building || 'Tech Block A (CSE)');
  const [floor, setFloor] = useState(cabinDetails.floor || '2nd Floor');
  const [room, setRoom] = useState(cabinDetails.room || 'Cabin 204');
  const [deliveryTime, setDeliveryTime] = useState('13:10');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (token) {
      axios.get('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data?.orders) setRecentOrders(res.data.orders.slice(0, 3));
        })
        .catch(() => {});
    }
  }, [token]);

  const handleSaveLocation = () => {
    setCabinDetails({ building, floor, room });
    setOrderType('CABIN_DELIVERY');
    navigate('/student');
  };

  const handleQuickOrderCombo = (combo) => {
    setCabinDetails({ building, floor, room });
    setOrderType('CABIN_DELIVERY');
    // Add combo representation to cart
    addToCart({
      id: combo.id,
      name: combo.name,
      price: combo.price,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
    }, 'cnt_main');
    navigate('/student');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER BANNER */}
      <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              FACULTY VIP PORTAL
            </span>
            <span className="bg-amber-500/30 text-amber-100 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Priority Kitchen Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Faculty Cabin Meal Delivery</h1>
          <p className="text-xs text-amber-100">Schedule meals delivered directly to your department cabin or lecture hall without waiting.</p>
        </div>
        <Building className="w-12 h-12 text-amber-300 opacity-80 shrink-0" />
      </div>

      {/* CABIN LOCATION FORM */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" /> Configure Delivery Destination
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Saved for your profile</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Building Block</label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
            >
              <option value="Tech Block A (CSE)">Tech Block A (CSE)</option>
              <option value="Tech Block B (ECE)">Tech Block B (ECE)</option>
              <option value="Workshop Block (MECH)">Workshop Block (MECH)</option>
              <option value="Management Block (MBA)">Management Block (MBA)</option>
              <option value="Science Block (PHYSICS/CHEM)">Science Block (PHYSICS/CHEM)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Floor Level</label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
            >
              <option value="Ground Floor">Ground Floor</option>
              <option value="1st Floor">1st Floor</option>
              <option value="2nd Floor">2nd Floor</option>
              <option value="3rd Floor">3rd Floor</option>
              <option value="4th Floor">4th Floor</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Cabin / Room Number</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Cabin 204"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Target Delivery Slot Time
          </label>
          <input
            type="time"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={handleSaveLocation}
          className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
        >
          Confirm Cabin Delivery & Browse Menu <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FACULTY FAVORITE PRESETS & BULK ORDERING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> 1-Click Faculty Curated Combos
          </h2>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Fast priority prep</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FACULTY_COMBOS.map(combo => (
            <div
              key={combo.id}
              className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{combo.icon}</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                    ~{combo.prepTime} mins
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{combo.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{combo.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-base font-black text-slate-900 dark:text-white">₹{combo.price}</span>
                <button
                  onClick={() => handleQuickOrderCombo(combo)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  Order to Cabin <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT ORDERS */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-500" /> Recent Cabin Orders
          </h3>
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Token #{o.token_number}</span>
                  <span className="text-slate-500 ml-2">({o.order_status})</span>
                </div>
                <div className="text-slate-500">
                  ₹{o.total_amount} · {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Today'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
