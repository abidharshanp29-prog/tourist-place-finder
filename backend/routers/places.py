from fastapi import APIRouter, Query, Header, HTTPException, Response
from typing import Optional
from services.places_service import (
    search_places,
    get_place_details,
    fetch_photo_stream,
    autocomplete_places
)

router = APIRouter(prefix="/api/places", tags=["Places"])

@router.get("/autocomplete")
async def autocomplete_endpoint(
    query: str = Query(..., min_length=2, description="Partial search query"),
    x_api_key: Optional[str] = Header(None, alias="X-Google-Maps-Key")
):
    """Live autocomplete returning matching place predictions with coordinates and location types"""
    result = await autocomplete_places(query.strip(), custom_key=x_api_key)
    return result

@router.get("/search")
async def search_tourist_places(
    location: str = Query(..., description="City, district, or landmark to search"),
    lat: Optional[float] = Query(None, description="Optional latitude for direct area search"),
    lng: Optional[float] = Query(None, description="Optional longitude for direct area search"),
    x_api_key: Optional[str] = Header(None, alias="X-Google-Maps-Key")
):
    if not location or len(location.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search location must be at least 2 characters.")
    
    result = await search_places(location.strip(), lat=lat, lng=lng, custom_key=x_api_key)
    return result

@router.get("/details/{place_id}")
async def get_details(
    place_id: str,
    x_api_key: Optional[str] = Header(None, alias="X-Google-Maps-Key")
):
    result = await get_place_details(place_id, custom_key=x_api_key)
    return result

@router.get("/photo")
async def get_photo(
    photo_reference: str = Query(..., description="Google Places photo reference"),
    max_width: int = Query(800, ge=100, le=1600),
    x_api_key: Optional[str] = Header(None, alias="X-Google-Maps-Key")
):
    photo_bytes, content_type_or_err = await fetch_photo_stream(photo_reference, max_width=max_width, custom_key=x_api_key)
    if not photo_bytes:
        raise HTTPException(status_code=404, detail=f"Could not load photo: {content_type_or_err}")
    
    return Response(content=photo_bytes, media_type=content_type_or_err)
