from fastapi import APIRouter, Header
from pydantic import BaseModel, Field
from typing import Optional
from services.routes_service import compute_route, calculate_distance_matrix

router = APIRouter(prefix="/api/routes", tags=["Routes"])

class RouteRequest(BaseModel):
    origin_lat: float = Field(..., description="Latitude of starting point")
    origin_lng: float = Field(..., description="Longitude of starting point")
    dest_lat: float = Field(..., description="Latitude of destination point")
    dest_lng: float = Field(..., description="Longitude of destination point")
    mode: str = Field("driving", description="Travel mode: driving or walking")

class DistanceCompareRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float

@router.post("/calculate")
async def calculate_route(
    req: RouteRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Google-Maps-Key")
):
    result = await compute_route(
        origin_lat=req.origin_lat,
        origin_lng=req.origin_lng,
        dest_lat=req.dest_lat,
        dest_lng=req.dest_lng,
        mode=req.mode,
        custom_key=x_api_key
    )
    return result

@router.post("/compare")
async def compare_modes(
    req: DistanceCompareRequest,
    x_api_key: Optional[str] = Header(None, alias="X-Google-Maps-Key")
):
    result = await calculate_distance_matrix(
        origin_lat=req.origin_lat,
        origin_lng=req.origin_lng,
        dest_lat=req.dest_lat,
        dest_lng=req.dest_lng,
        custom_key=x_api_key
    )
    return result
