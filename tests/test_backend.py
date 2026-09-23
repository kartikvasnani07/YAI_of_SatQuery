import pytest
import os
from backend.planner.parser import parser
from backend.validation.validator import validate_tool_compatibility
from backend.orchestrator.engine import orchestrator, get_observation_meta
from backend.geospatial.vector_ops import calculate_mask_area_km2
import numpy as np

def test_query_parser():
    prompt = "Identify agricultural land within 500 meters of the river that experienced flooding, calculate the affected area, and determine whether vegetation recovered within three months."
    parsed = parser.parse(prompt)
    assert parsed["intent"] == "multi_hop_geospatial_fusion"
    assert "river" in parsed["entities"]
    assert "agricultural_land" in parsed["entities"]
    assert parsed["spatial_constraints"]["buffer_meters"] == 500

def test_scientific_refusal():
    rgb_meta = get_observation_meta("obs_rgb_only")
    val_res = validate_tool_compatibility("ndvi", rgb_meta)
    assert val_res.is_valid is False
    assert "NIR" in val_res.missing_bands
    assert "Scientific Refusal" in val_res.refusal_reason

def test_flagship_multihop_analysis():
    prompt = "Identify agricultural land within 500 meters of the river that experienced flooding, calculate the affected area, and determine whether vegetation recovered within three months."
    result = orchestrator.run_analysis(prompt, "obs_cartosat_t1")
    assert result["status"] == "completed"
    assert result["result"]["metrics"]["affected_agricultural_area_km2"] > 0
    assert len(result["layers"]) >= 5
    assert result["uncertainty"]["overall_uncertainty_score"] < 0.20
    assert "report_path" in result

def test_area_calculation():
    mask = np.ones((100, 100), dtype=np.uint8)
    area = calculate_mask_area_km2(mask, resolution_m=10.0)
    # 10000 pixels * 100 m2 = 1,000,000 m2 = 1.0 km2
    assert area == 1.0
