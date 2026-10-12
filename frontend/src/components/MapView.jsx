import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Flag, Info, Layers } from 'lucide-react';

export default function MapView({
  places,
  center,
  selectedPlace,
  originPlace,
  destinationPlace,
  activeRoute,
  onSelectPlace,
  onSetOrigin,
  onSetDestination,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = center || { lat: 48.8566, lng: 2.3522 };
    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 13,
      zoomControl: true,
    });

    // Add high-resolution OpenStreetMap tile layer (100% Free, No API Key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan to center when location changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo([center.lat, center.lng]);
    }
  }, [center]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (!places || places.length === 0) return;

    const bounds = L.latLngBounds();

    places.forEach((place, index) => {
      const lat = place.location.lat;
      const lng = place.location.lng;
      bounds.extend([lat, lng]);

      const isStart = originPlace?.place_id === place.place_id;
      const isEnd = destinationPlace?.place_id === place.place_id;
      const isSelected = selectedPlace?.place_id === place.place_id;

      let pinColor = '#0284c7'; // brand sky
      if (isStart) pinColor = '#10b981'; // emerald green
      else if (isEnd) pinColor = '#f43f5e'; // rose red
      else if (isSelected) pinColor = '#f59e0b'; // amber

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%);">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
              <path d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 25 17 25s17-12.2 17-25C34 7.6 26.4 0 17 0z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
              <circle cx="17" cy="17" r="10" fill="#ffffff"/>
              <text x="17" y="21" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${pinColor}" text-anchor="middle">${index + 1}</text>
            </svg>
          </div>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const photoUrl = place.photo_url || '';
      const popupHtml = `
        <div style="min-width: 210px; max-width: 260px; font-family: system-ui, sans-serif; padding: 2px;">
          ${photoUrl ? `<img src="${photoUrl}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0f172a;">${place.name}</h4>
          <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">${place.formatted_address || ''}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; color: #f59e0b;">
            <span>★ ${place.rating.toFixed(1)}</span>
            <span style="color: #0284c7; cursor: pointer; text-decoration: underline;" id="popup-detail-${place.place_id}">Click card for full details</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersLayerRef.current.addLayer(marker);
    });

    // Auto-fit bounds if no route is active
    if (!activeRoute && places.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [places, originPlace, destinationPlace, selectedPlace, activeRoute]);

  // Update Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      const isWalking = activeRoute.mode === 'walking';
      const polyline = L.polyline(activeRoute.coordinates, {
        color: isWalking ? '#10b981' : '#0284c7',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });

      routeLayerRef.current.addLayer(polyline);

      // Fit map bounds to the active route
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute]);

  return (
    <div className="relative w-full h-[540px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Overlay Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-semibold text-slate-700 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>OpenStreetMap • Free Real-Road Routing</span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs font-medium text-slate-700 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
          <span>Attractions</span>
        </div>
        {originPlace && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Start (A)</span>
          </div>
        )}
        {destinationPlace && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Dest (B)</span>
          </div>
        )}
        {activeRoute && (
          <div className="flex items-center gap-1.5 border-l pl-2 border-slate-200">
            <span className={`w-3 h-1 rounded ${activeRoute.mode === 'walking' ? 'bg-emerald-500' : 'bg-sky-600'}`} />
            <span className="capitalize">{activeRoute.mode} Route</span>
          </div>
        )}
      </div>
    </div>
  );
}
