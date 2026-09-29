# backend/oceanembed/data_model.py
"""
Data Abstraction and Schemas for OceanEmbed
North Indian Ocean Subsurface Temperature Reconstruction Framework
"""
from typing import List, Dict, Optional, Any
from enum import Enum
from pydantic import BaseModel, Field


class VariableStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    MISSING = "MISSING"
    MASKED = "MASKED"
    INVALID = "INVALID"
    LOW_QUALITY = "LOW_QUALITY"


class ModelExecutionMode(str, Enum):
    REAL_MODEL = "REAL_MODEL"
    DEMO_MODEL = "DEMO_MODEL"
    NO_MODEL = "NO_MODEL"


class SurfaceVariableMeta(BaseModel):
    name: str
    code: str
    units: str
    status: VariableStatus
    coverage_pct: float
    description: str
    last_updated: Optional[str] = None


class DatasetMetadata(BaseModel):
    dataset_name: str
    provider: str
    variables: List[str]
    units: Dict[str, str]
    timestamp: str
    spatial_resolution: str = "0.25° x 0.25°"
    temporal_resolution: str = "daily"
    latitude_bounds: List[float] = [5.0, 30.0]   # North Indian Ocean
    longitude_bounds: List[float] = [45.0, 105.0] # North Indian Ocean
    coordinate_reference_system: str = "EPSG:4326 (WGS 84)"
    missing_value_convention: str = "NaN / -9999.0"
    quality_flags: Dict[str, str] = {
        "good": "QC=1",
        "suspect": "QC=2",
        "bad": "QC=4"
    }
    source_url: str
    processing_version: str = "v1.0-harmonized"


class ObservationCubeSpec(BaseModel):
    time: str
    latitude_min: float = 5.0
    latitude_max: float = 30.0
    longitude_min: float = 45.0
    longitude_max: float = 105.0
    variables_status: Dict[str, SurfaceVariableMeta]
    metadata: DatasetMetadata
