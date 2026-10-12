import React from 'react';
import { X, ShieldCheck, CheckCircle2, Globe, Map, Navigation, Image } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">100% Free & Open APIs Active</h3>
            <p className="text-xs text-slate-500">No credit card, no billing, zero cost required</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero-Cost Setup Active</span>
              <p className="mt-0.5 leading-relaxed">
                This website is powered by free, open-source world mapping and travel data services. You do not need to register, configure billing, or provide any paid API key.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Integrated Free Services:
            </h4>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-start gap-3">
              <Map className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">OpenStreetMap & Leaflet.js</span>
                <p className="text-slate-600 mt-0.5">Global high-definition interactive map tiles, responsive markers, and zoom controls.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-start gap-3">
              <Image className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Wikipedia & Wikimedia Commons</span>
                <p className="text-slate-600 mt-0.5">Authentic high-resolution photographs, visitor descriptions, history, and verified coordinates.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-start gap-3">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">OSRM (Open Source Routing Machine)</span>
                <p className="text-slate-600 mt-0.5">Real road and pedestrian network routes, actual road distances in km, and travel time estimation.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
