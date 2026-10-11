import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed, Clock, QrCode, Shield, Sparkles, TrendingUp,
  Award, ArrowRight, Zap, Users, Building, Leaf
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI-Powered Smart Campus Food Service Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none max-w-4xl mx-auto">
            SMART FOOD. <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">ZERO QUEUES.</span> BETTER CAMPUS.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized digital food service platform unifying online ordering, real-time availability, AI queue estimation, demand forecasting, faculty cabin delivery, and inventory intelligence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-base hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              Launch Demo Platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/student"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              Browse Live Menus
            </Link>
          </div>

          {/* KEY STATS BAR */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">&lt; 8 Mins</p>
              <p className="text-xs text-slate-500 mt-0.5">Average Queue Wait Time</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-amber-500">92%</p>
              <p className="text-xs text-slate-500 mt-0.5">AI Demand Accuracy</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-emerald-500">88.5/100</p>
              <p className="text-xs text-slate-500 mt-0.5">Sustainability Score</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">100%</p>
              <p className="text-xs text-slate-500 mt-0.5">Paperless QR Token Pickup</p>
            </div>
          </div>

        </div>
      </section>

      {/* CORE MODULES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">CanteenX Core Capabilities</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">Modernizing higher education dining operations across all campus stakeholders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Real-Time Availability & Queue AI</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Live menu item availability (`AVAILABLE`, `LOW_STOCK`, `SOLD_OUT`) with AI queue wait-time estimation.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Faculty Cabin Delivery</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Dedicated scheduling and cabin meal delivery for faculty members specifying department, building, floor, and room.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Digital QR Token Verification</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unique QR code generation per order with single-scan staff counter validation preventing double redemption.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Demand & Prep Planner</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              XGBoost hourly demand forecasting informing kitchen staff WHAT, WHEN, and HOW MUCH to prepare.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Operations Copilot</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Natural-language operational assistant answering manager queries grounded strictly in real database analytics.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Food Waste & Sustainability</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Structured waste logging, reason tracking, cost analytics, and quantitative canteen sustainability scoring.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
