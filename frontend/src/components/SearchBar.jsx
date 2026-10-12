import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  X,
  Loader2,
  Building2,
  Landmark,
  Compass,
  AlertCircle,
  Umbrella,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { autocompletePlaces } from '../services/api';

const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', emoji: '🗼' },
  { name: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { name: 'Rome', country: 'Italy', emoji: '🏛️' },
  { name: 'New York', country: 'USA', emoji: '🗽' },
  { name: 'Jaipur', country: 'India', emoji: '🏰' },
  { name: 'Barcelona', country: 'Spain', emoji: '🏖️' },
  { name: 'Dubai', country: 'UAE', emoji: '🏙️' },
  { name: 'London', country: 'UK', emoji: '🎡' },
];

const CATEGORIES = [
  'All Places',
  'Museum',
  'Park',
  'Historical',
  'Art Gallery',
  'Architecture',
  'Place Of Worship',
];

export default function SearchBar({
  onSearch,
  onSelectSuggestion,
  isLoading,
  selectedCategory,
  onSelectCategory,
  currentQuery
}) {
  const [query, setQuery] = useState(currentQuery || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync external currentQuery changes
  useEffect(() => {
    if (currentQuery && currentQuery !== query) {
      setQuery(currentQuery);
    }
  }, [currentQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Autocomplete with 300ms Debounce
  useEffect(() => {
    const trimmed = query.trim();

    // Cancel previous inflight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsLoadingSuggestions(false);
      setAutocompleteError(null);
      setSelectedIndex(-1);
      return;
    }

    setIsLoadingSuggestions(true);
    setAutocompleteError(null);

    const debounceTimer = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await autocompletePlaces(trimmed, null, controller.signal);
        setSuggestions(results);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Autocomplete error:', err);
          setAutocompleteError(err.message || 'Failed to fetch suggestions');
          setSuggestions([]);
          setIsDropdownOpen(true);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  // Handle manual search form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
      return;
    }
    if (query.trim()) {
      setIsDropdownOpen(false);
      onSearch(query.trim());
    }
  };

  // Handle selecting an autocomplete suggestion
  const handleSelect = (item) => {
    setQuery(item.name);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    } else {
      onSearch(item.name, item.location);
    }
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handlePresetClick = (destName) => {
    setQuery(destName);
    setIsDropdownOpen(false);
    onSearch(destName);
  };

  // Helper for suggestion icon
  const getSuggestionIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('beach')) return <Umbrella className="w-4 h-4 text-cyan-600" />;
    if (t.includes('temple') || t.includes('worship') || t.includes('monument') || t.includes('museum')) {
      return <Landmark className="w-4 h-4 text-amber-600" />;
    }
    if (t.includes('city') || t.includes('town') || t.includes('region') || t.includes('district')) {
      return <Building2 className="w-4 h-4 text-sky-600" />;
    }
    return <MapPin className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-6 relative">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 z-10 pointer-events-none">
          <MapPin className="w-5 h-5 text-sky-600" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 && suggestions.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter a city, district, or landmark (e.g., Virudhachalam, Ooty, Coimbatore, Marina Beach, Paris)..."
          className="w-full pl-12 pr-32 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm sm:text-base"
          autoComplete="off"
        />

        {/* Clear or loading indicator inside input */}
        <div className="absolute right-32 flex items-center gap-1">
          {isLoadingSuggestions && (
            <Loader2 className="w-4 h-4 text-sky-600 animate-spin mr-1" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsDropdownOpen(false);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Find Places Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:hover:bg-sky-600 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Places</span>
            </>
          )}
        </button>
      </form>

      {/* LIVE AUTOCOMPLETE DROPDOWN */}
      {isDropdownOpen && (
        <div className="absolute left-5 right-5 top-[76px] z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto animate-in fade-in duration-100">
          {/* Header */}
          <div className="px-4 py-2 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Places Matching "{query}"</span>
            {isLoadingSuggestions && (
              <span className="flex items-center gap-1 text-sky-600 normal-case font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Searching...
              </span>
            )}
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id || index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-sky-50/80 text-sky-950' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getSuggestionIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate flex items-center gap-2">
                        <span>{item.name}</span>
                      </div>
                      {item.secondary_text && (
                        <div className="text-xs text-slate-500 truncate">
                          {item.secondary_text}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.type && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full border border-slate-200/60">
                        {item.type}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })
          ) : !isLoadingSuggestions ? (
            /* Empty State */
            <div className="p-6 text-center text-xs text-slate-500">
              {autocompleteError ? (
                <div className="flex items-center justify-center gap-2 text-rose-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{autocompleteError}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Compass className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700">No matching places found</span>
                  <span>Try a different spelling or click "Find Places" to search directly</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Popular Destination Quick Chips */}
      <div className="mt-4 flex items-center flex-wrap gap-2 text-xs">
        <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular:
        </span>
        {POPULAR_DESTINATIONS.map((dest) => (
          <button
            key={dest.name}
            type="button"
            onClick={() => handlePresetClick(dest.name)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 text-slate-700 font-medium rounded-full border border-slate-200/60 transition-all"
          >
            <span className="mr-1">{dest.emoji}</span>
            {dest.name}
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap">Filter:</span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat || (cat === 'All Places' && !selectedCategory);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat === 'All Places' ? '' : cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
