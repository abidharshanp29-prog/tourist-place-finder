import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.places import router as places_router
from routers.routes import router as routes_router
from routers.config import router as config_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tourist_planner")

app = FastAPI(
    title="Smart Tourist Places Finder & Travel Planner API",
    description="Backend API proxy for Google Places, Google Routes/Directions, and Google Maps integration.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(places_router)
app.include_router(routes_router)
app.include_router(config_router)

@app.get("/")
async def root():
    return {
        "app": "Smart Tourist Places Finder & Travel Planner API",
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
