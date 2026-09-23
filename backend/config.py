#backend/config.py
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "sample_data")
CATALOG_PATH = os.path.join(DATASET_DIR, "catalog.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
REPORTS_DIR = os.path.join(OUTPUT_DIR, "reports")
TILES_DIR = os.path.join(OUTPUT_DIR, "tiles")

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(TILES_DIR, exist_ok=True)

HOST = "127.0.0.1"
PORT = 8000
