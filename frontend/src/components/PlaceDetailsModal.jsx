import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  Globe,
  Phone,
  Clock,
  ExternalLink,
  Flag,
  Navigation,
  Loader2,
  Calendar,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getPlaceDetails } from '../services/api';

export default function PlaceDetailsModal({
  place,
  onClose,
  onSetOrigin,
  onSetDestination,
  apiKey,
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!place?.place_id) return;

    setLoading(true);
    setError(null);

    getPlaceDetails(place.place_id, apiKey)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load details');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [place, apiKey]);

  if (!place) return null;

  const currentPlace = details || place;
  const photos = details?.photos || (place.photo_url ? [{ url: `http://127.0.0.1:8000${place.photo_url}` }] : []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[activePhotoIdx]?.url.startsWith('/') ? `http://127.0.0.1:8000${photos[activePhotoIdx].url}` : photos[activePhotoIdx]?.url}
                alt={currentPlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Photo carousel arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-16 right-4 px-2 py-1 bg-black/60 rounded-md text-[10px] text-white font-medium">
                    {activePhotoIdx + 1} / {photos.length} photos
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
              <Sparkles className="w-10 h-10 opacity-40" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Place Title on Hero */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-md">
              {currentPlace.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              {currentPlace.rating > 0 && (
                <div className="flex items-center gap-1 font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{currentPlace.rating.toFixed(1)}</span>
                  {currentPlace.user_ratings_total > 0 && (
                    <span className="font-normal text-[10px]">({currentPlace.user_ratings_total.toLocaleString()})</span>
                  )}
                </div>
              )}
              {currentPlace.types && currentPlace.types.slice(0, 3).map((type, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[11px] font-medium">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Body Details */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="flex items-center justify-center py-6 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
              <span className="text-sm font-medium">Loading place details from Google...</span>
            </div>
          )}

          {/* Editorial Overview / Summary */}
          {details?.editorial_summary && (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {details.editorial_summary}
              </p>
            </div>
          )}

          {/* Address & Contact Info */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{currentPlace.formatted_address || 'Address not listed'}</span>
            </div>

            {details?.formatted_phone_number && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:${details.formatted_phone_number}`} className="text-sky-600 hover:underline">
                  {details.formatted_phone_number}
                </a>
              </div>
            )}

            {details?.website && (
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={details.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 hover:underline flex items-center gap-1 font-medium truncate"
                >
                  Visit Official Website <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Opening Hours */}
          {details?.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Opening Hours
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                {details.opening_hours.weekday_text.map((line, idx) => (
                  <div key={idx} className="font-medium">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Reviews */}
          {details?.reviews && details.reviews.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Top Visitor Reviews
              </h4>
              <div className="space-y-3">
                {details.reviews.map((rev, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{rev.author_name}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-semibold text-[11px] text-slate-700">{rev.rating}★</span>
                        <span className="text-[10px] text-slate-400 ml-1">{rev.relative_time_description}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 line-clamp-3 leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSetOrigin(currentPlace);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" /> Start Route From Here
            </button>

            <button
              onClick={() => {
                onSetDestination(currentPlace);
                onClose();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" /> Route To Here
            </button>
          </div>

          {currentPlace.google_maps_url && (
            <a
              href={currentPlace.google_maps_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
