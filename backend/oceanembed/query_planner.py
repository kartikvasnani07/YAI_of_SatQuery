# backend/oceanembed/query_planner.py
"""
Scientific Ocean Query Planner for OceanEmbed
Translates natural language prompts into structured operational execution plans.
Supports global ocean geographic routing (Atlantic, Pacific, Indian, Southern, Arctic, Arabian Sea, Bay of Bengal).
"""
from typing import Dict, Any, List
import re

def parse_ocean_query(prompt: str) -> Dict[str, Any]:
    """
    Parses user natural language ocean query into a deterministic operational plan schema.
    """
    query_lower = prompt.lower()

    intent = "DEPTH_SLICE"
    target_depth = 100.0
    lat = 15.0
    lon = 72.5
    zoom = 5.2
    region = "North Indian Ocean"
    target_field = "temperature"

    # Extract depth if present e.g., "100 m", "100m", "200 m"
    depth_match = re.search(r'(\d+)\s*m', query_lower)
    if depth_match:
        target_depth = float(depth_match.group(1))

    # Detect field
    if "anomaly" in query_lower or "temp anomaly" in query_lower:
        target_field = "anomaly"
        intent = "ANOMALY"
    elif "sea level" in query_lower or "sla" in query_lower or "height anomaly" in query_lower:
        target_field = "sla"
        intent = "DEPTH_SLICE"
    elif "current" in query_lower or "speed" in query_lower:
        target_field = "currents"
        intent = "DEPTH_SLICE"
    elif "salinity" in query_lower or "sss" in query_lower:
        target_field = "salinity"
        intent = "DEPTH_SLICE"
    elif "profile" in query_lower or "vertical" in query_lower:
        intent = "PROFILE"
    elif "thermocline" in query_lower:
        intent = "THERMOCLINE"
    elif "argo" in query_lower or "validation" in query_lower:
        intent = "ARGO_VALIDATION"
    elif "embedding" in query_lower or "latent" in query_lower:
        intent = "EMBEDDING_EXPLORER"

    # Detect Ocean / Region
    if "atlantic" in query_lower:
        region = "Atlantic Ocean"
        lat, lon, zoom = 15.0, -35.0, 3.5
        bbox = [-65.0, -20.0, 10.0, 45.0]
    elif "pacific" in query_lower:
        region = "Pacific Ocean"
        lat, lon, zoom = 0.0, -160.0, 3.0
        bbox = [-175.0, -25.0, -110.0, 25.0]
    elif "arabian sea" in query_lower:
        region = "Arabian Sea"
        lat, lon, zoom = 16.0, 65.0, 5.8
        bbox = [55.0, 8.0, 75.0, 24.0]
    elif "bay of bengal" in query_lower:
        region = "Bay of Bengal"
        lat, lon, zoom = 15.0, 88.0, 5.8
        bbox = [80.0, 8.0, 96.0, 22.0]
    elif "southern" in query_lower or "antarctic" in query_lower:
        region = "Southern Ocean"
        lat, lon, zoom = -60.0, 0.0, 3.0
        bbox = [-40.0, -70.0, 40.0, -50.0]
    elif "arctic" in query_lower:
        region = "Arctic Ocean"
        lat, lon, zoom = 82.0, 0.0, 3.0
        bbox = [-30.0, 70.0, 30.0, 88.0]
    else:
        region = "Indian Ocean"
        lat, lon, zoom = 10.0, 75.0, 4.5
        bbox = [50.0, -15.0, 95.0, 25.0]

    params = {
        "depth_m": target_depth,
        "latitude": lat,
        "longitude": lon,
        "zoom": zoom,
        "region": region,
        "bbox": bbox,
        "date": "2026-01-15",
        "target_field": target_field
    }

    # Generate structured steps for UI workflow trace
    steps = [
        {"id": "step_1", "title": f"Route Map View to {region}", "tool": "GeographicRouter", "status": "completed"},
        {"id": "step_2", "title": f"Harmonize {target_field.upper()} Surface Observations", "tool": "GridHarmonizer", "status": "completed"},
        {"id": "step_3", "title": f"Encode Latent Representation ({region})", "tool": "OceanEncoder", "status": "completed"},
        {"id": "step_4", "title": f"Decode {target_field.upper()} Field at depth z={target_depth}m", "tool": "DepthConditionedDecoder", "status": "completed"},
        {"id": "step_5", "title": "Generate Matplotlib Scientific Plot", "tool": "MatplotlibGraphEngine", "status": "completed"}
    ]

    query_summary = f"Identified request for {target_field.upper()} in {region} at {target_depth}m depth. Map camera routed to ({lat}°N, {lon}°E)."

    return {
        "intent": intent,
        "parameters": params,
        "operation_plan": {
            "intent": intent,
            "steps": steps
        },
        "query_summary": query_summary
    }
