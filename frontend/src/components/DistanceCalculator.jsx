import React, { useState } from 'react';
import {
  Car,
  Footprints,
  ArrowRightLeft,
  Route,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  XCircle,
  Flag,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function DistanceCalculator({
  places,
  originPlace,
  destinationPlace,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  travelMode,
  onChangeMode,
  onCalculateRoutes,
  onClearRoute,
  drivingRoute,
  walkingRoute,
  drivingError,
  walkingError,
  isCalculating,
}) {
  const [showSteps, setShowSteps] = useState(false);

  // Active route based on selected mode
  const activeRoute = travelMode === 'walking' ? walkingRoute : drivingRoute;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Distance Calculator & Route Planner
            </h2>
            <p className="text-[11px] text-slate-500">
              Independent road network calculation for Driving and Walking
            </p>
          </div>
        </div>

        {(drivingRoute || walkingRoute) && (
          <button
            type="button"
            onClick={onClearRoute}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" /> Clear Route
          </button>
        )}
      </div>

      {/* Origin & Destination Selectors */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Origin Selector */}
        <div className="md:col-span-5 relative">
          <label className="block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flag className="w-3 h-3 text-emerald-600" /> Start Place (A)
          </label>
          <select
            value={originPlace?.place_id || ''}
            onChange={(e) => {
              const p = places.find((item) => item.place_id === e.target.value);
              onSelectOrigin(p || null);
            }}
            className="w-full text-xs sm:text-sm font-medium py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">Select starting attraction...</option>
            {places.map((p, idx) => (
              <option key={`orig-${p.place_id}`} value={p.place_id}>
                {idx + 1}. {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="md:col-span-2 flex justify-center pt-3 md:pt-4">
          <button
            type="button"
            onClick={onSwap}
            title="Swap Origin and Destination"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Selector */}
        <div className="md:col-span-5 relative">
          <label className="block text-[11px] font-semibold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-rose-600" /> Destination Place (B)
          </label>
          <select
            value={destinationPlace?.place_id || ''}
            onChange={(e) => {
              const p = places.find((item) => item.place_id === e.target.value);
              onSelectDestination(p || null);
            }}
            className="w-full text-xs sm:text-sm font-medium py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="">Select destination attraction...</option>
            {places.map((p, idx) => (
              <option key={`dest-${p.place_id}`} value={p.place_id}>
                {idx + 1}. {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recalculate Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Select any two tourist places to compute both routes
        </span>

        <button
          type="button"
          disabled={!originPlace || !destinationPlace || isCalculating || originPlace.place_id === destinationPlace.place_id}
          onClick={onCalculateRoutes}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Calculating Routes...</span>
            </>
          ) : (
            <>
              <Route className="w-4 h-4 text-sky-400" />
              <span>Recalculate Routes</span>
            </>
          )}
        </button>
      </div>

      {/* SEPARATE DRIVING AND WALKING RESULT SECTIONS */}
      {(drivingRoute || walkingRoute || drivingError || walkingError) && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. DRIVING SECTION */}
            <div
              onClick={() => onChangeMode('driving')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                travelMode === 'driving'
                  ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-2 ring-sky-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Driving Route
                    </h3>
                    <span className="text-[10px] text-slate-500">via road network</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {travelMode === 'driving' && (
                    <span className="px-2 py-0.5 bg-sky-600 text-white rounded-full text-[10px] font-bold">
                      Active on Map
                    </span>
                  )}
                </div>
              </div>

              {drivingRoute ? (
                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Actual Road Distance
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {drivingRoute.distance_km} <span className="text-xs font-medium text-slate-600">km</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({drivingRoute.distance_text})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Estimated Duration
                    </span>
                    <span className="text-xl font-black text-sky-700 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-sky-600" />
                      {drivingRoute.duration_text}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      standard vehicle pace
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-100">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{drivingError || 'Driving route unavailable'}</span>
                </div>
              )}
            </div>

            {/* 2. WALKING SECTION */}
            <div
              onClick={() => onChangeMode('walking')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                travelMode === 'walking'
                  ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Walking Route
                    </h3>
                    <span className="text-[10px] text-slate-500">via pedestrian footpaths</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {travelMode === 'walking' && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                      Active on Map
                    </span>
                  )}
                </div>
              </div>

              {walkingRoute ? (
                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Actual Walking Distance
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {walkingRoute.distance_km} <span className="text-xs font-medium text-slate-600">km</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({walkingRoute.distance_text})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Estimated Duration
                    </span>
                    <span className="text-xl font-black text-emerald-700 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      {walkingRoute.duration_text}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      pedestrian walking pace
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-center gap-2 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span className="font-semibold">{walkingError || 'Walking route unavailable'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Traffic disclaimer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> Driving and walking distances follow separate road and pedestrian networks. Travel durations are estimates and may vary based on traffic, pedestrian crossings, signals, and weather conditions.
            </p>
          </div>

          {/* Turn-by-turn navigation steps for active mode */}
          {activeRoute?.steps && activeRoute.steps.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSteps(!showSteps)}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${travelMode === 'walking' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                  {travelMode === 'walking' ? 'Walking Directions' : 'Driving Directions'} ({activeRoute.steps.length} steps)
                </span>
                {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSteps && (
                <div className="mt-2 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {activeRoute.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div
                          className="font-medium text-slate-800"
                          dangerouslySetInnerHTML={{ __html: step.raw_html || step.instruction }}
                        />
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {step.distance} • {step.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
