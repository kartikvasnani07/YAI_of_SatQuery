# backend/main.py
"""
OCEANEMBED — Satellite Embedding-Based Deep Learning Framework
for Reconstruction of Subsurface Ocean Temperature from Surface Satellite Observations
Problem Statement: SIH26066 | Ministry of Earth Sciences (MoES) / INCOIS
Domain: Space Technology / Ocean & Earth Observation
"""
import os
import shutil
from typing import Optional, List, Any, Dict
from fastapi import FastAPI, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel

from backend.config import REPORTS_DIR
from backend.storage.projects import load_projects_data, create_project, delete_chat_from_project, clear_project_chats

from backend.oceanembed.data_model import ObservationCubeSpec, ModelExecutionMode
from backend.oceanembed.reconstruction_engine import (
    get_surface_inputs_status,
    synthesize_profile_physics,
    get_continuous_depth_temperature,
    generate_spatial_grid_slice,
    generate_cross_section_transect,
    STANDARD_DEPTHS,
    DOMAIN_BOUNDS
)
from backend.oceanembed.argo_validation import (
    get_argo_catalog_geojson,
    compare_argo_with_model
)
from backend.oceanembed.embedding_engine import generate_embedding_space_points
from backend.oceanembed.bathymetry_engine import (
    get_bathymetry_contours_geojson,
    get_seafloor_depth
)
from backend.oceanembed.query_planner import parse_ocean_query
from backend.oceanembed.report_generator import generate_oceanembed_pdf_report
from backend.oceanembed.graph_engine import (
    render_profile_plot_png,
    render_gradient_plot_png,
    render_argo_plot_png
)

app = FastAPI(
    title="OCEANEMBED API",
    description="Subsurface Ocean Temperature Reconstruction Platform — SIH26066 (MoES / INCOIS)",
    version="2026.1"
)

# Enable CORS for React frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/presentation flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    depth_m: Optional[float] = 100.0
    latitude: Optional[float] = 15.25
    longitude: Optional[float] = 72.50
    date: Optional[str] = "2026-01-15"
    project_id: Optional[str] = "proj_default"
    attached_files: Optional[List[Any]] = []

class ProjectCreateRequest(BaseModel):
    name: str

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "OCEANEMBED Workstation API",
        "domain": "North Indian Ocean (5°N–30°N, 45°E–105°E)",
        "problem_statement": "SIH26066 (MoES / INCOIS)",
        "model_status": "DEMO RECONSTRUCTION",
        "version": "2026.1"
    }

@app.get("/api/ocean/status")
def get_ocean_status():
    return {
        "project": "OCEANEMBED",
        "description": "Satellite Embedding-Based Deep Learning Framework for Subsurface Ocean Temperature Reconstruction",
        "domain_bounds": DOMAIN_BOUNDS,
        "standard_depths": STANDARD_DEPTHS,
        "surface_inputs": get_surface_inputs_status("2026-01-15"),
        "model_execution_mode": ModelExecutionMode.DEMO_MODEL,
        "model_status_label": "DEMO RECONSTRUCTION",
        "target_grid": "0.25° x 0.25° Daily Harmonized Grid"
    }

@app.get("/api/ocean/reconstruct")
def get_ocean_reconstruction_slice(
    depth_m: float = 100.0,
    date: str = "2026-01-15",
    variable: str = "temperature",
    lat: float = 15.0,
    lon: float = 75.0,
    region: str = "North Indian Ocean"
):
    """Returns 2D spatial grid map for specified depth and region coordinates."""
    return generate_spatial_grid_slice(
        depth_m=depth_m,
        date_str=date,
        variable=variable,
        lat_center=lat,
        lon_center=lon,
        region=region
    )

@app.get("/api/ocean/profile")
def get_ocean_point_profile(lat: float = 15.25, lon: float = 72.50, date: str = "2026-01-15"):
    """Returns vertical temperature profile T(z) & thermocline analysis at lat, lon."""
    prof = synthesize_profile_physics(lat=lat, lon=lon, date_str=date)
    seafloor = get_seafloor_depth(lat, lon)
    prof["seafloor_depth_m"] = seafloor
    return prof

@app.get("/api/ocean/argo")
def get_argo_locations():
    """Returns GeoJSON FeatureCollection of ARGO float locations."""
    return get_argo_catalog_geojson()

@app.get("/api/ocean/argo/{float_id}")
def get_argo_float_validation(float_id: str, date: str = "2026-01-15"):
    """Compares OceanEmbed reconstruction with in-situ ARGO float profile."""
    return compare_argo_with_model(float_id=float_id, date_str=date)

@app.get("/api/ocean/embeddings")
def get_ocean_embeddings(date: str = "2026-01-15"):
    """Returns 2D projected embeddings of latent ocean states."""
    return generate_embedding_space_points(date_str=date)

@app.get("/api/ocean/bathymetry")
def get_bathymetry_layers():
    """Returns GEBCO bathymetric contours & depth levels."""
    return get_bathymetry_contours_geojson()

@app.get("/api/ocean/cross-section")
def get_cross_section(transect: str = "mumbai_to_bay_of_bengal", date: str = "2026-01-15"):
    """Returns latitude-depth or longitude-depth cross-section along ocean transects."""
    return generate_cross_section_transect(transect_name=transect, date_str=date)

@app.get("/api/ocean/graph/profile")
def get_profile_graph(lat: float = 15.25, lon: float = 72.50, date: str = "2026-01-15", region: str = "Target Region"):
    """Returns publication-grade Matplotlib PNG graph of vertical profile T(z)."""
    png_bytes = render_profile_plot_png(lat=lat, lon=lon, date_str=date, region_name=region)
    return Response(content=png_bytes, media_type="image/png")

@app.get("/api/ocean/graph/gradient")
def get_gradient_graph(lat: float = 15.25, lon: float = 72.50, date: str = "2026-01-15"):
    """Returns publication-grade Matplotlib PNG graph of vertical gradient |dT/dz|."""
    png_bytes = render_gradient_plot_png(lat=lat, lon=lon, date_str=date)
    return Response(content=png_bytes, media_type="image/png")

@app.get("/api/ocean/graph/argo")
def get_argo_graph(float_id: str = "ARGO_2901542", date: str = "2026-01-15"):
    """Returns publication-grade Matplotlib PNG graph of ARGO vs OceanEmbed comparison."""
    png_bytes = render_argo_plot_png(float_id=float_id, date_str=date)
    return Response(content=png_bytes, media_type="image/png")

@app.post("/api/ocean/query")
def submit_ocean_query(req: QueryRequest):
    """Executes structured ocean query plan and routes to requested geographic region & field."""
    plan = parse_ocean_query(req.query)

    intent = plan["intent"]
    depth_m = plan["parameters"]["depth_m"] if req.depth_m == 100.0 else (req.depth_m or plan["parameters"]["depth_m"])
    lat = plan["parameters"]["latitude"]
    lon = plan["parameters"]["longitude"]
    zoom = plan["parameters"]["zoom"]
    region_name = plan["parameters"]["region"]
    target_field = plan["parameters"]["target_field"]
    date_str = req.date or "2026-01-15"

    profile_data = synthesize_profile_physics(lat, lon, date_str, region_hint=region_name)
    argo_val = compare_argo_with_model("ARGO_2901542", date_str)
    grid_data = generate_spatial_grid_slice(depth_m, date_str, variable=target_field, lat_center=lat, lon_center=lon, region=region_name)

    field_title = target_field.upper() if target_field != "temperature" else "Subsurface Temperature"
    
    # Simple, kid-friendly explanation
    answer_summary = (
        f"🌊 Simple Explanation: You asked about {region_name}! "
        f"The map has flown right over {region_name} ({lat:.1f}°N, {lon:.1f}°E). "
        f"At the surface, the water is {profile_data['sst_c']}°C. "
        f"As you go down to {depth_m:.0f}m depth, the water cools down to {profile_data['profile'][6]['temperature_c']}°C. "
        f"The thermocline boundary layer (where water gets cold fast) sits at ~{profile_data['thermocline_depth_m']:.0f} meters!"
    )

    result_payload = {
        "id": f"analysis_{os.urandom(4).hex()}",
        "status": "completed",
        "query": req.query,
        "intent": intent,
        "depth_m": depth_m,
        "target_field": target_field,
        "location": {
            "name": region_name,
            "center": [lon, lat],
            "zoom": zoom,
            "bbox": plan["parameters"].get("bbox", [lon - 10.0, lat - 8.0, lon + 10.0, lat + 8.0]),
            "depth_m": depth_m
        },
        "plan": plan["operation_plan"],
        "answer_summary": answer_summary,
        "profile": profile_data,
        "argo_validation": argo_val,
        "grid": grid_data,
        "graph_url": f"/api/ocean/graph/profile?lat={lat}&lon={lon}&date={date_str}&region={region_name}",
        "gradient_graph_url": f"/api/ocean/graph/gradient?lat={lat}&lon={lon}&date={date_str}",
        "model_status": "DEMO RECONSTRUCTION",
        "metrics": {
            "target_region": region_name,
            "target_field": target_field,
            "target_depth_m": depth_m,
            "reconstructed_temp_c": profile_data["profile"][6]["temperature_c"],
            "uncertainty_c": profile_data["profile"][6]["uncertainty_c"],
            "thermocline_depth_m": profile_data["thermocline_depth_m"],
            "mixed_layer_depth_m": profile_data["mixed_layer_depth_m"],
            "argo_rmse_c": argo_val["metrics"]["rmse_c"]
        },
        "report_path": f"/api/reports/report_latest.pdf"
    }

    return result_payload

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    upload_dir = os.path.join(REPORTS_DIR, "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "filepath": file_path, "status": "attached"}

@app.get("/api/projects")
def get_projects():
    return load_projects_data()

@app.post("/api/projects")
def add_new_project(req: ProjectCreateRequest):
    return create_project(req.name.strip())

@app.delete("/api/projects/{proj_id}/chats/{chat_id}")
def delete_chat(proj_id: str, chat_id: str):
    return {"status": "deleted", "chat_id": chat_id}

@app.delete("/api/projects/{proj_id}/chats")
def clear_chats(proj_id: str):
    return {"status": "cleared"}

@app.get("/api/reports/{job_id}/view", response_class=HTMLResponse)
def view_report_in_new_tab(job_id: str):
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OCEANEMBED Scientific Report — {job_id}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-8 font-sans">
  <div class="max-w-4xl mx-auto bg-slate-900 border border-cyan-900/40 rounded-xl p-8 space-y-6">
    <div class="border-b border-slate-800 pb-4 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-cyan-400 font-mono">OCEANEMBED</h1>
        <p class="text-xs text-slate-400 font-mono">Satellite Embedding-Based Deep Learning Framework — Subsurface Ocean Temperature</p>
      </div>
      <span class="px-3 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold rounded">DEMO RECONSTRUCTION</span>
    </div>
    <div class="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono space-y-2">
      <div class="text-cyan-400 font-bold">RESEARCH REPORT ID: {job_id}</div>
      <div>Domain: North Indian Ocean (5°N–30°N, 45°E–105°E)</div>
      <div>Problem Statement: SIH26066 | Ministry of Earth Sciences (MoES) / INCOIS</div>
      <div>Validation Benchmark: INCOIS ARGO Float Network</div>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed font-mono">
      This report summarizes subsurface ocean temperature reconstruction from surface satellite observations (SST, SSS, SSH, Surface Currents).
    </p>
  </div>
</body>
</html>
"""
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
