import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  UtensilsCrossed, Sun, Moon, ShoppingBag, LogOut,
  ChefHat, LayoutDashboard, Ticket,
  Bell, Megaphone, Menu as MenuIcon, X, Sparkles
} from 'lucide-react';

export default function Navbar({ onOpenCart }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      try {
        const res = await axios.get('/api/notifications');
        setUnreadCount(res.data?.unread_count || 0);
      } catch (_) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const getRoleBadge = (role) => {
    const map = {
      CANTEEN_MANAGER: <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">MANAGER</span>,
      CANTEEN_STAFF:   <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">KITCHEN STAFF</span>,
      FACULTY:         <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold">FACULTY</span>,
    };
    return map[role] || <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">STUDENT</span>;
  };

  const close = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link to={user ? (
            user.role === 'CANTEEN_STAFF' ? '/staff' :
            user.role === 'CANTEEN_MANAGER' ? '/manager' :
            user.role === 'FACULTY' ? '/faculty' : '/student'
          ) : '/login'} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              CANTEEN<span className="text-amber-500">X</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">Anurag University</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-5">
          {user ? (
            <>
              {/* STUDENT */}
              {user.role === 'STUDENT' && (
                <>
                  <Link to="/student" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-indigo-500" /> Menu & Order
                  </Link>
                  <Link to="/orders" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-indigo-500" /> My Orders
                  </Link>
                  <Link to="/rewards" className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">⭐ Rewards</Link>
                  <Link to="/announcements" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-indigo-500" /> Updates
                  </Link>
                </>
              )}

              {/* FACULTY */}
              {user.role === 'FACULTY' && (
                <>
                  <Link to="/student" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-indigo-500" /> Menu & Order
                  </Link>
                  <Link to="/faculty" className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Cabin Delivery
                  </Link>
                  <Link to="/orders" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-indigo-500" /> My Orders
                  </Link>
                  <Link to="/announcements" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-indigo-500" /> Updates
                  </Link>
                </>
              )}

              {/* KITCHEN STAFF */}
              {user.role === 'CANTEEN_STAFF' && (
                <>
                  <Link to="/staff" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4" /> Kitchen Display
                  </Link>
                  <Link to="/announcements" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-indigo-500" /> Announcements
                  </Link>
                </>
              )}

              {/* MANAGER */}
              {user.role === 'CANTEEN_MANAGER' && (
                <>
                  <Link to="/manager" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" /> Manager Ops
                  </Link>
                  <Link to="/announcements" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-indigo-500" /> Announcements
                  </Link>
                </>
              )}
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">Sign In</Link>
          )}
        </nav>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2.5">
          {/* DARK MODE */}
          <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle theme">
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* NOTIFICATION BELL */}
          {user && (
            <Link to="/notifications" className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* CART (Student & Faculty only) */}
          {user && (user.role === 'STUDENT' || user.role === 'FACULTY') && (
            <button onClick={onOpenCart} className="relative p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors" title="Cart">
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* USER / SIGN IN */}
          {!user ? (
            <Link to="/login" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors">
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user.name || user.full_name}</p>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>
              <Link to="/profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform" title="My Profile">
                {((user.name || user.full_name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase())}
              </Link>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 space-y-1 backdrop-blur-md">
          {!user ? (
            <Link onClick={close} to="/login" className="block py-2 text-sm font-semibold text-indigo-600">Sign In</Link>
          ) : (
            <>
              {user.role === 'STUDENT' && (
                <>
                  <Link onClick={close} to="/student"       className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">🍔 Menu & Order</Link>
                  <Link onClick={close} to="/orders"        className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">🧾 My Orders</Link>
                  <Link onClick={close} to="/rewards"       className="block py-2 text-sm font-semibold text-amber-600 dark:text-amber-400">⭐ Rewards</Link>
                  <Link onClick={close} to="/announcements" className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">📢 Updates</Link>
                </>
              )}
              {user.role === 'FACULTY' && (
                <>
                  <Link onClick={close} to="/student"       className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">🍔 Menu & Order</Link>
                  <Link onClick={close} to="/faculty"       className="block py-2 text-sm font-semibold text-amber-600 dark:text-amber-400">✨ Cabin Delivery</Link>
                  <Link onClick={close} to="/orders"        className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">🧾 My Orders</Link>
                  <Link onClick={close} to="/announcements" className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">📢 Updates</Link>
                </>
              )}
              {user.role === 'CANTEEN_STAFF' && (
                <>
                  <Link onClick={close} to="/staff"         className="block py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">👨‍🍳 Kitchen Display</Link>
                  <Link onClick={close} to="/announcements" className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">📢 Announcements</Link>
                </>
              )}
              {user.role === 'CANTEEN_MANAGER' && (
                <>
                  <Link onClick={close} to="/manager"       className="block py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">📊 Manager Ops</Link>
                  <Link onClick={close} to="/announcements" className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">📢 Announcements</Link>
                </>
              )}
              <Link onClick={close} to="/notifications" className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}</Link>
              <Link onClick={close} to="/profile"       className="block py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">👤 My Profile</Link>
              <button onClick={() => { logout(); navigate('/login'); close(); }} className="block py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 text-left w-full">🚪 Sign Out</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
