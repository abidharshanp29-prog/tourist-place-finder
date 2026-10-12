import React from 'react';
import { Compass, Sparkles, CheckCircle, Route, ShieldCheck } from 'lucide-react';

export default function Header({ placeCount, activeRoute, onOpenInfoModal }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
              Smart Tourist Finder
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                100% Free Open APIs
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Discover attractions, calculate real road distances & plan routes
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {placeCount > 0 && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
              <span>{placeCount} places discovered</span>
            </div>
          )}

          {activeRoute && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
              <Route className="w-3.5 h-3.5" />
              <span>Route: {activeRoute.distance_km} km ({activeRoute.duration_text})</span>
            </div>
          )}

          {/* Free Open Badge */}
          <button
            onClick={onOpenInfoModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Free & Open Tier</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
