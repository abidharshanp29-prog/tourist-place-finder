import React from 'react';
import { Star, MapPin, Info, Navigation, Flag, Check, ImageOff } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function TouristPlaceCard({
  place,
  index,
  onSelectDetails,
  onSetOrigin,
  onSetDestination,
  isOrigin,
  isDestination,
  onCenterMap,
  isSelected
}) {
  const [imgError, setImgError] = React.useState(false);

  // Fallback image gradient or travel placeholder if photo fails or none available
  const photoUrl = place.photo_url && !imgError 
    ? (place.photo_url.startsWith('http') ? place.photo_url : (API_BASE_URL ? `${API_BASE_URL}${place.photo_url}` : place.photo_url))
    : null;

  return (
    <div
      onClick={() => onCenterMap(place)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${
        isSelected
          ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20'
          : isOrigin
          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : isDestination
          ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      {/* Top Image Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100 text-slate-400">
            <ImageOff className="w-8 h-8 mb-1 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Photo Preview</span>
          </div>
        )}

        {/* Index Number Badge */}
        <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center justify-center shadow-md">
          {index + 1}
        </div>

        {/* Origin / Destination Indicators */}
        {isOrigin && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
            <Flag className="w-3 h-3" /> Start (A)
          </div>
        )}
        {isDestination && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
            <Navigation className="w-3 h-3" /> Destination (B)
          </div>
        )}

        {/* Rating overlay badge */}
        {place.rating > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-md shadow-sm flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{place.rating.toFixed(1)}</span>
            {place.user_ratings_total > 0 && (
              <span className="text-[10px] text-slate-500 font-normal">
                ({place.user_ratings_total.toLocaleString()})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Categories */}
          {place.categories && place.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {place.categories.slice(0, 2).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Place Name */}
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-sky-600 transition-colors">
            {place.name}
          </h3>

          {/* Address */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>{place.formatted_address || 'Address available in details'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetails(place);
            }}
            className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          <button
            type="button"
            title="Set as Route Start Point"
            onClick={(e) => {
              e.stopPropagation();
              onSetOrigin(place);
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              isOrigin
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isOrigin ? 'Start' : 'Set A'}</span>
          </button>

          <button
            type="button"
            title="Set as Route Destination Point"
            onClick={(e) => {
              e.stopPropagation();
              onSetDestination(place);
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              isDestination
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isDestination ? 'Dest' : 'Set B'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
