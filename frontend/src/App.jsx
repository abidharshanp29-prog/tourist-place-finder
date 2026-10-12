import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TouristPlaceCard from './components/TouristPlaceCard';
import MapView from './components/MapView';
import DistanceCalculator from './components/DistanceCalculator';
import PlaceDetailsModal from './components/PlaceDetailsModal';
import ApiKeyModal from './components/ApiKeyModal';
import {
  searchTouristPlaces,
  calculateRoute,
} from './services/api';
import {
  AlertTriangle,
  Map as MapIcon,
  LayoutGrid,
  Columns,
  Sparkles,
  Compass,
  Route,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Search & Places State
  const [currentQuery, setCurrentQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default Paris
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Independent Travel Route Planning State
  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [travelMode, setTravelMode] = useState('driving'); // 'driving' | 'walking'
  
  // Separate states for Driving and Walking routes
  const [drivingRoute, setDrivingRoute] = useState(null);
  const [walkingRoute, setWalkingRoute] = useState(null);
  const [drivingError, setDrivingError] = useState(null);
  const [walkingError, setWalkingError] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Modal & Selection State
  const [selectedPlaceForDetails, setSelectedPlaceForDetails] = useState(null);
  const [highlightedPlace, setHighlightedPlace] = useState(null);

  // View Layout State (mobile/desktop responsive tabs)
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'places' | 'map'

  // Active route displayed on the map and header based on current travelMode
  const activeRoute = travelMode === 'walking' ? walkingRoute : drivingRoute;

  // Load initial search on mount (e.g., Paris) for instant ready-to-use demonstration
  useEffect(() => {
    handleSearch('Paris');
  }, []);

  // Recalculate both routes whenever originPlace or destinationPlace changes
  useEffect(() => {
    if (originPlace && destinationPlace && originPlace.place_id !== destinationPlace.place_id) {
      calculateBothRoutes(originPlace, destinationPlace);
    } else {
      setDrivingRoute(null);
      setWalkingRoute(null);
      setDrivingError(null);
      setWalkingError(null);
    }
  }, [originPlace, destinationPlace]);

  // Trigger place search
  const handleSearch = async (queryText, coords = null) => {
    if (!queryText || !queryText.trim()) return;
    const cleanQuery = queryText.trim();
    setIsSearching(true);
    setSearchError(null);
    setCurrentQuery(cleanQuery);
    setDrivingRoute(null);
    setWalkingRoute(null);

    // Center map immediately if coordinates are provided
    if (coords && coords.lat != null && coords.lng != null) {
      setMapCenter(coords);
    }

    try {
      const data = await searchTouristPlaces(cleanQuery, coords);
      const resultsArray = Array.isArray(data?.results) ? data.results : [];
      setPlaces(resultsArray);

      if (data?.center && (!coords || coords.lat == null)) {
        setMapCenter(data.center);
      }

      if (resultsArray.length >= 2) {
        setOriginPlace(resultsArray[0]);
        setDestinationPlace(resultsArray[1]);
      } else if (resultsArray.length === 1) {
        setOriginPlace(resultsArray[0]);
        setDestinationPlace(null);
      } else {
        setOriginPlace(null);
        setDestinationPlace(null);
      }
    } catch (err) {
      console.error('[Search Error] Failed to search places:', err);
      setSearchError(err.message || 'Failed to search places.');
      setPlaces([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (!suggestion) return;
    setCurrentQuery(suggestion.name);
    handleSearch(suggestion.name, suggestion.location);
  };

  // Compute TWO SEPARATE ROUTES independently
  const calculateBothRoutes = async (orig = originPlace, dest = destinationPlace) => {
    if (!orig || !dest || orig.place_id === dest.place_id) return;

    setIsCalculatingRoute(true);
    setDrivingError(null);
    setWalkingError(null);

    const baseCoords = {
      origin_lat: orig.location.lat,
      origin_lng: orig.location.lng,
      dest_lat: dest.location.lat,
      dest_lng: dest.location.lng,
    };

    // 1. Separate Driving route calculation
    const drivePromise = calculateRoute({ ...baseCoords, mode: 'driving' })
      .then((res) => {
        setDrivingRoute(res);
        setDrivingError(null);
      })
      .catch((err) => {
        setDrivingRoute(null);
        setDrivingError(err.message || 'Driving route unavailable');
      });

    // 2. Separate Walking route calculation
    const walkPromise = calculateRoute({ ...baseCoords, mode: 'walking' })
      .then((res) => {
        setWalkingRoute(res);
        setWalkingError(null);
      })
      .catch((err) => {
        setWalkingRoute(null);
        setWalkingError(err.message || 'Walking route unavailable');
      });

    try {
      await Promise.allSettled([drivePromise, walkPromise]);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleModeChange = (newMode) => {
    setTravelMode(newMode);
  };

  const handleSwapPlaces = () => {
    const temp = originPlace;
    setOriginPlace(destinationPlace);
    setDestinationPlace(temp);
  };

  const handleClearRoute = () => {
    setOriginPlace(null);
    setDestinationPlace(null);
    setDrivingRoute(null);
    setWalkingRoute(null);
  };

  // Filter places by category
  const filteredPlaces = selectedCategory
    ? places.filter((p) =>
        p.categories?.some((c) =>
          c.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )
    : places;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation */}
      <Header
        placeCount={places.length}
        activeRoute={activeRoute}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar & Destination Quick Chips */}
        <SearchBar
          onSearch={(q) => handleSearch(q)}
          onSelectSuggestion={handleSelectSuggestion}
          isLoading={isSearching}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          currentQuery={currentQuery}
        />

        {/* Search Error Notice */}
        {searchError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Search Notice</h4>
              <p className="text-xs mt-0.5">{searchError}</p>
            </div>
          </div>
        )}

        {/* View Toggle Bar (Split / Places Only / Map Only) */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-slate-500">
            {places.length > 0
              ? `Showing ${filteredPlaces.length} of ${places.length} places in ${currentQuery}`
              : 'Search any city or select a destination above to start'}
          </div>

          <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'split' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('places')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'places' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Places ({filteredPlaces.length})</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Interactive Distance Calculator & Route Directions */}
        {places.length > 0 && (
          <DistanceCalculator
            places={places}
            originPlace={originPlace}
            destinationPlace={destinationPlace}
            onSelectOrigin={(p) => setOriginPlace(p)}
            onSelectDestination={(p) => setDestinationPlace(p)}
            onSwap={handleSwapPlaces}
            travelMode={travelMode}
            onChangeMode={handleModeChange}
            onCalculateRoutes={() => calculateBothRoutes(originPlace, destinationPlace)}
            onClearRoute={handleClearRoute}
            drivingRoute={drivingRoute}
            walkingRoute={walkingRoute}
            drivingError={drivingError}
            walkingError={walkingError}
            isCalculating={isCalculatingRoute}
          />
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tourist Place Cards */}
          {(viewMode === 'split' || viewMode === 'places') && (
            <div className={viewMode === 'split' ? 'lg:col-span-6 xl:col-span-7' : 'lg:col-span-12'}>
              {filteredPlaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredPlaces.map((place, idx) => (
                    <TouristPlaceCard
                      key={place.place_id || idx}
                      place={place}
                      index={idx}
                      onSelectDetails={setSelectedPlaceForDetails}
                      onSetOrigin={(p) => setOriginPlace(p)}
                      onSetDestination={(p) => setDestinationPlace(p)}
                      isOrigin={originPlace?.place_id === place.place_id}
                      isDestination={destinationPlace?.place_id === place.place_id}
                      onCenterMap={(p) => {
                        setMapCenter(p.location);
                        setHighlightedPlace(p);
                      }}
                      isSelected={highlightedPlace?.place_id === place.place_id}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Ready to Explore
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Search for a destination like "Paris", "Tokyo", or "Jaipur" to discover top tourist attractions, real photo galleries, and road routes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Interactive Leaflet Map */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={viewMode === 'split' ? 'lg:col-span-6 xl:col-span-5 sticky top-20' : 'lg:col-span-12'}>
              <MapView
                places={filteredPlaces}
                center={mapCenter}
                selectedPlace={highlightedPlace}
                originPlace={originPlace}
                destinationPlace={destinationPlace}
                activeRoute={activeRoute}
                onSelectPlace={(p) => {
                  setHighlightedPlace(p);
                  setSelectedPlaceForDetails(p);
                }}
                onSetOrigin={(p) => setOriginPlace(p)}
                onSetDestination={(p) => setDestinationPlace(p)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Place Details Modal */}
      {selectedPlaceForDetails && (
        <PlaceDetailsModal
          place={selectedPlaceForDetails}
          onClose={() => setSelectedPlaceForDetails(null)}
          onSetOrigin={(p) => setOriginPlace(p)}
          onSetDestination={(p) => setDestinationPlace(p)}
        />
      )}

      {/* 100% Free Info Modal */}
      <ApiKeyModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
