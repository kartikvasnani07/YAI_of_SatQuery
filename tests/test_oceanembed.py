# tests/test_oceanembed.py
"""
Unit and Integration Test Suite for OceanEmbed Engine
Tests depth selection, thermocline calculation, ARGO float comparison, query parsing, and data validation.
"""
import pytest
from backend.oceanembed.reconstruction_engine import (
    synthesize_profile_physics,
    get_continuous_depth_temperature,
    generate_spatial_grid_slice,
    STANDARD_DEPTHS
)
from backend.oceanembed.argo_validation import compare_argo_with_model, ARGO_FLOATS_CATALOG
from backend.oceanembed.query_planner import parse_ocean_query
from backend.oceanembed.bathymetry_engine import get_seafloor_depth
from backend.oceanembed.embedding_engine import generate_embedding_space_points

def test_standard_depths_structure():
    assert len(STANDARD_DEPTHS) == 15
    assert STANDARD_DEPTHS[0] == 0
    assert STANDARD_DEPTHS[-1] == 1000

def test_profile_physics_synthesis():
    prof = synthesize_profile_physics(15.25, 72.50, "2026-01-15")
    assert prof["latitude"] == 15.25
    assert prof["longitude"] == 72.50
    assert len(prof["profile"]) == 15
    assert prof["thermocline_depth_m"] > 0.0
    assert prof["max_temperature_gradient_c_m"] > 0.0

def test_continuous_depth_interpolation():
    # Test exact model level
    exact_res = get_continuous_depth_temperature(15.25, 72.50, "2026-01-15", 100.0)
    assert exact_res["is_exact_model_level"] is True
    assert exact_res["source_type"] == "MODEL OUTPUT"

    # Test interpolated custom depth e.g. 137m
    interp_res = get_continuous_depth_temperature(15.25, 72.50, "2026-01-15", 137.0)
    assert interp_res["is_exact_model_level"] is False
    assert interp_res["source_type"] == "INTERPOLATED DISPLAY VALUE"
    assert interp_res["temperature_c"] > 0.0

def test_argo_validation_metrics():
    float_id = ARGO_FLOATS_CATALOG[0]["float_id"]
    val_res = compare_argo_with_model(float_id, "2026-01-15")
    assert "metrics" in val_res
    assert val_res["metrics"]["rmse_c"] >= 0.0
    assert val_res["metrics"]["mae_c"] >= 0.0
    assert val_res["metrics"]["correlation_r"] <= 1.0
    assert len(val_res["comparison_profile"]) == 15

def test_ocean_query_planner():
    q1 = parse_ocean_query("Show temperature at 100 m in Arabian Sea")
    assert q1["intent"] == "DEPTH_SLICE" or q1["intent"] == "PROFILE"
    assert q1["parameters"]["depth_m"] == 100.0
    assert q1["parameters"]["region"] == "Arabian Sea"

    q2 = parse_ocean_query("Compare OceanEmbed with ARGO observations")
    assert q2["intent"] == "ARGO_VALIDATION"

def test_bathymetry_seafloor_depth():
    depth = get_seafloor_depth(15.25, 72.50)
    assert depth > 0.0

def test_embedding_generator():
    emb = generate_embedding_space_points("2026-01-15")
    assert emb["embedding_dimension"] == 64
    assert len(emb["points"]) > 0

if __name__ == '__main__':
    test_standard_depths_structure()
    test_profile_physics_synthesis()
    test_continuous_depth_interpolation()
    test_argo_validation_metrics()
    test_ocean_query_planner()
    test_bathymetry_seafloor_depth()
    test_embedding_generator()
    print("ALL OCEANEMBED UNIT TESTS PASSED SUCCESSFULLY!")

