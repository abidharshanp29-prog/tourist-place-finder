from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/config", tags=["Configuration"])

@router.get("/status")
async def get_config_status():
    return {
        "is_configured": True,
        "is_free_mode": True,
        "provider": "Free Open APIs (OpenStreetMap + Leaflet + Wikipedia + OSRM)",
        "api_key": "FREE_OPEN_TIER",
        "masked_key": "100% Free & Open",
        "required_apis": [
            {"name": "Leaflet + OpenStreetMap", "purpose": "Free interactive maps, tiles, and markers (No API key needed)"},
            {"name": "Wikipedia & Wikimedia API", "purpose": "Free tourist places, descriptions, and authentic photos"},
            {"name": "OSRM (Open Source Routing Machine)", "purpose": "Free real driving and walking routes, distances & times"}
        ]
    }

class KeyUpdateRequest(BaseModel):
    api_key: str

@router.post("/update-key")
async def update_key(req: KeyUpdateRequest):
    return {
        "success": True,
        "message": "Using Free Open APIs. No API key required!",
        "is_configured": True,
    }

@router.post("/test-key")
async def test_key(req: KeyUpdateRequest):
    return {
        "valid": True,
        "status": "OK",
        "message": "Free Open APIs are fully operational and require no paid key."
    }
