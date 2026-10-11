import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">CANTEEN<span className="text-amber-500">X</span></span>
          <span className="text-xs text-slate-500 ml-2">Smart Campus Food Service Platform</span>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for College Food Service Optimization
        </p>

        <div className="text-xs text-slate-500">
          © 2026 CanteenX Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
