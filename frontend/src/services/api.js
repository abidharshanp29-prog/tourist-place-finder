const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Retrieve current API Key configuration status from backend
 */
export async function getConfigStatus() {
  const res = await fetch(`${API_BASE_URL}/config/status`);
  if (!res.ok) throw new Error('Failed to fetch config status');
  return res.json();
}

/**
 * Update Google Maps API key on the backend
 */
export async function updateApiKey(apiKey) {
  const res = await fetch(`${API_BASE_URL}/config/update-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to update API key');
  return res.json();
}

/**
 * Test a candidate Google Maps API Key
 */
export async function testApiKey(apiKey) {
  const res = await fetch(`${API_BASE_URL}/config/test-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to test API key');
  return res.json();
}

/**
 * Live search autocomplete for places, cities, districts, attractions
 */
export async function autocompletePlaces(query, customKey = null, signal = null) {
  if (!query || query.trim().length < 2) return [];

  const headers = {};
  if (customKey) headers['X-Google-Maps-Key'] = customKey;

  const url = `${API_BASE_URL}/places/autocomplete?query=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { headers, signal });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Autocomplete failed');
  }
  return data.suggestions || [];
}

/**
 * Search tourist attractions for a given location (with optional direct coordinates)
 */
export async function searchTouristPlaces(location, coords = null, customKey = null) {
  const headers = {};
  if (customKey) headers['X-Google-Maps-Key'] = customKey;

  let url = `${API_BASE_URL}/places/search?location=${encodeURIComponent(location)}`;
  if (coords && coords.lat != null && coords.lng != null) {
    url += `&lat=${coords.lat}&lng=${coords.lng}`;
  }

  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to search places');
  }
  return data;
}

/**
 * Fetch detailed information for a single place
 */
export async function getPlaceDetails(placeId, customKey = null) {
  const headers = {};
  if (customKey) headers['X-Google-Maps-Key'] = customKey;

  const res = await fetch(`${API_BASE_URL}/places/details/${placeId}`, { headers });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load place details');
  }
  return data.place;
}

/**
 * Calculate driving or walking route between two places
 */
export async function calculateRoute({ origin_lat, origin_lng, dest_lat, dest_lng, mode = 'driving' }, customKey = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (customKey) headers['X-Google-Maps-Key'] = customKey;

  const res = await fetch(`${API_BASE_URL}/routes/calculate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      origin_lat,
      origin_lng,
      dest_lat,
      dest_lng,
      mode,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to compute route directions');
  }
  return data;
}

/**
 * Compare driving and walking metrics
 */
export async function compareModes({ origin_lat, origin_lng, dest_lat, dest_lng }, customKey = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (customKey) headers['X-Google-Maps-Key'] = customKey;

  const res = await fetch(`${API_BASE_URL}/routes/compare`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ origin_lat, origin_lng, dest_lat, dest_lng }),
  });
  const data = await res.json();
  return data;
}
