import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

def get_google_maps_api_key() -> str:
    # Check current environment or reload from .env
    key = os.getenv("GOOGLE_MAPS_API_KEY", "").strip()
    if not key and ENV_PATH.exists():
        load_dotenv(dotenv_path=ENV_PATH, override=True)
        key = os.getenv("GOOGLE_MAPS_API_KEY", "").strip()
    return key

def save_google_maps_api_key(new_key: str) -> None:
    cleaned = new_key.strip()
    os.environ["GOOGLE_MAPS_API_KEY"] = cleaned
    
    # Write to .env file
    lines = []
    found = False
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
        new_lines = []
        for line in lines:
            if line.startswith("GOOGLE_MAPS_API_KEY="):
                new_lines.append(f"GOOGLE_MAPS_API_KEY={cleaned}\n")
                found = True
            else:
                new_lines.append(line)
        lines = new_lines
    if not found:
        lines.append(f"GOOGLE_MAPS_API_KEY={cleaned}\n")
        
    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.writelines(lines)
