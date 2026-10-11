import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UtensilsCrossed } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', {
        email:    email.trim().toLowerCase(),
        password: password.trim(),
      });
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if      (role === 'CANTEEN_STAFF')   navigate('/staff');
      else if (role === 'CANTEEN_MANAGER') navigate('/manager');
      else if (role === 'COLLEGE_ADMIN')   navigate('/admin');
      else if (role === 'SUPER_ADMIN')     navigate('/super-admin');
      else if (role === 'FACULTY')         navigate('/faculty');
      else                                 navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-200/30 dark:bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-200/30 dark:bg-violet-900/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* BRAND HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/30 mb-5">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            CanteenX
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Anurag University
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-800 p-8 space-y-5">

          <div className="text-center">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Sign in to your account</h2>
          </div>

          {/* ERROR */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* SUBMIT */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* REGISTER LINK */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            New here?{' '}
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6">
          © 2026 CanteenX · Anurag University · All rights reserved
        </p>
      </div>
    </div>
  );
}
