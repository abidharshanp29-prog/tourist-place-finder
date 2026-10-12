import logging
import asyncio
import httpx
from typing import Dict, Any, Optional, List
from config import get_google_maps_api_key

logger = logging.getLogger(__name__)

# Free OpenStreetMap routing endpoints with dedicated profiles
OSM_CAR_URL = "https://routing.openstreetmap.de/routed-car/route/v1/driving"
OSM_FOOT_URL = "https://routing.openstreetmap.de/routed-foot/route/v1/driving"
FALLBACK_OSRM_CAR = "https://router.project-osrm.org/route/v1/driving"

# Google Maps API endpoints
GOOGLE_DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json"
GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"

USER_AGENT = "SmartTouristPlanner/2.0 (OpenRouting; contact@example.com)"

def format_duration(seconds: float) -> str:
    mins = round(seconds / 60)
    if mins < 60:
        return f"{max(1, mins)} mins"
    hours = mins // 60
    rem_mins = mins % 60
    if rem_mins == 0:
        return f"{hours} hr"
    return f"{hours} hr {rem_mins} mins"

def format_distance(meters: float) -> str:
    if meters < 1000:
        return f"{round(meters)} m"
    return f"{round(meters / 1000.0, 1)} km"

async def compute_google_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    mode: str,
    api_key: str
) -> Optional[Dict[str, Any]]:
    """Compute route via Google Maps Directions API using separate DRIVE and WALK modes"""
    google_mode = "walking" if mode.lower() in ["walking", "walk", "foot"] else "driving"
    params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": f"{dest_lat},{dest_lng}",
        "mode": google_mode,
        "key": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(GOOGLE_DIRECTIONS_URL, params=params)
            data = resp.json()

        if data.get("status") != "OK":
            return None

        route = data.get("routes", [])[0]
        leg = route.get("legs", [])[0]
        distance_val = leg.get("distance", {}).get("value", 0)
        duration_val = leg.get("duration", {}).get("value", 0)

        # Overview polyline points
        overview_polyline = route.get("overview_polyline", {}).get("points", "")
        
        # Decode polyline to coordinates if geometry is available
        import polyline
        coords = polyline.decode(overview_polyline) if overview_polyline else []
    except ImportError:
        coords = []
    except Exception as e:
        logger.warning(f"Google routing failed, falling back to OSM: {e}")
        return None

    steps = []
    for s in leg.get("steps", []):
        raw_html = s.get("html_instructions", "")
        clean = raw_html.replace("<b>", "").replace("</b>", "").replace('<div style="font-size:0.9em">', " (").replace("</div>", ")")
        steps.append({
            "instruction": clean,
            "raw_html": raw_html,
            "distance": s.get("distance", {}).get("text", ""),
            "duration": s.get("duration", {}).get("text", ""),
            "maneuver": s.get("maneuver", "straight"),
        })

    return {
        "success": True,
        "mode": google_mode,
        "distance_km": round(distance_val / 1000.0, 2),
        "distance_meters": distance_val,
        "distance_text": leg.get("distance", {}).get("text", format_distance(distance_val)),
        "duration_seconds": duration_val,
        "duration_text": leg.get("duration", {}).get("text", format_duration(duration_val)),
        "start_location": {"lat": origin_lat, "lng": origin_lng},
        "end_location": {"lat": dest_lat, "lng": dest_lng},
        "coordinates": coords,
        "polyline": overview_polyline,
        "steps": steps,
        "disclaimer": "Travel times are estimated via road/pedestrian networks and may change with traffic conditions."
    }

async def compute_osm_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    mode: str
) -> Dict[str, Any]:
    """Compute independent route using separate dedicated profiles: routed-car vs routed-foot"""
    is_walking = mode.lower() in ["walking", "walk", "foot"]
    valid_mode = "walking" if is_walking else "driving"
    base_url = OSM_FOOT_URL if is_walking else OSM_CAR_URL
    coords_path = f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
    url = f"{base_url}/{coords_path}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true",
    }
    headers = {"User-Agent": USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            data = resp.json()

        code = data.get("code")
        if code != "Ok":
            # If routed-car failed, try fallback
            if not is_walking:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp_fallback = await client.get(f"{FALLBACK_OSRM_CAR}/{coords_path}", params=params, headers=headers)
                    data = resp_fallback.json()
                    code = data.get("code")

        if code != "Ok":
            return {
                "success": False,
                "mode": valid_mode,
                "error_code": code or "ROUTING_ERROR",
                "message": f"{valid_mode.capitalize()} route unavailable between the selected locations.",
            }

        routes = data.get("routes", [])
        if not routes:
            return {
                "success": False,
                "mode": valid_mode,
                "error_code": "ZERO_RESULTS",
                "message": f"{valid_mode.capitalize()} route unavailable between the selected locations.",
            }

        route = routes[0]
        distance_val = route.get("distance", 0.0)  # meters
        duration_val = route.get("duration", 0.0)  # seconds
        distance_km = round(distance_val / 1000.0, 2)

        # Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng] format
        raw_coords = route.get("geometry", {}).get("coordinates", [])
        lat_lng_polyline = [[pt[1], pt[0]] for pt in raw_coords]

        # Parse steps
        legs = route.get("legs", [])
        formatted_steps: List[Dict[str, Any]] = []

        if legs:
            raw_steps = legs[0].get("steps", [])
            for s in raw_steps:
                maneuver = s.get("maneuver", {})
                m_type = maneuver.get("type", "").replace("_", " ").title()
                modifier = maneuver.get("modifier", "")
                street = s.get("name", "")
                
                direction_word = f"{m_type} {modifier}".strip()
                if street:
                    instruction = f"{direction_word} onto {street}"
                else:
                    instruction = direction_word or ("Follow path" if is_walking else "Continue along route")

                formatted_steps.append({
                    "instruction": instruction.strip(),
                    "raw_html": f"<b>{instruction.strip()}</b>",
                    "distance": format_distance(s.get("distance", 0)),
                    "duration": format_duration(s.get("duration", 0)),
                    "maneuver": m_type.lower(),
                })

        return {
            "success": True,
            "mode": valid_mode,
            "distance_km": distance_km,
            "distance_meters": round(distance_val),
            "distance_text": format_distance(distance_val),
            "duration_seconds": round(duration_val),
            "duration_text": format_duration(duration_val),
            "start_location": {"lat": origin_lat, "lng": origin_lng},
            "end_location": {"lat": dest_lat, "lng": dest_lng},
            "coordinates": lat_lng_polyline,
            "polyline": "",
            "steps": formatted_steps,
            "disclaimer": "Travel times are calculated using real open road/footway networks and may vary depending on pedestrian speed, traffic, and road conditions."
        }

    except Exception as e:
        logger.error(f"Error computing {valid_mode} route: {e}")
        return {
            "success": False,
            "mode": valid_mode,
            "error_code": "INTERNAL_ERROR",
            "message": f"{valid_mode.capitalize()} route unavailable ({str(e)}).",
        }

async def compute_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    mode: str = "driving",
    custom_key: Optional[str] = None
) -> Dict[str, Any]:
    """Calculate driving or walking route independently"""
    api_key = custom_key or get_google_maps_api_key()

    # If Google Maps API key is configured, attempt Google Routes/Directions API first
    if api_key and len(api_key) > 10:
        google_result = await compute_google_route(origin_lat, origin_lng, dest_lat, dest_lng, mode, api_key)
        if google_result and google_result.get("success"):
            return google_result

    # Dedicated open routing engine for driving vs walking
    return await compute_osm_route(origin_lat, origin_lng, dest_lat, dest_lng, mode)

async def calculate_distance_matrix(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    custom_key: Optional[str] = None
) -> Dict[str, Any]:
    """Calculate BOTH driving and walking routes completely independently using concurrent requests"""
    driving_task = compute_route(origin_lat, origin_lng, dest_lat, dest_lng, mode="driving", custom_key=custom_key)
    walking_task = compute_route(origin_lat, origin_lng, dest_lat, dest_lng, mode="walking", custom_key=custom_key)

    driving_res, walking_res = await asyncio.gather(driving_task, walking_task)

    return {
        "success": bool(driving_res.get("success") or walking_res.get("success")),
        "driving": driving_res if driving_res.get("success") else None,
        "walking": walking_res if walking_res.get("success") else None,
        "driving_error": driving_res.get("message") if not driving_res.get("success") else None,
        "walking_error": walking_res.get("message") if not walking_res.get("success") else None,
        "disclaimer": "Travel times are calculated using real open road/footway networks without straight-line approximations."
    }
