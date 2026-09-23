class CapabilityRegistry:
    def __init__(self):
        self.tools = {
            "vqa": {
                "name": "Single-Image Visual Question Answering",
                "description": "Answers natural language questions about land cover, scene objects, counts, and spatial structure.",
                "supported_modalities": ["optical", "SAR"],
                "required_bands": [],
                "min_bands": 1
            },
            "grounding": {
                "name": "Text-Guided Grounding & Segmentation",
                "description": "Locates target features specified in prompt and returns bounding box and segmentation masks.",
                "supported_modalities": ["optical", "SAR"],
                "required_bands": [],
                "min_bands": 1
            },
            "captioning": {
                "name": "Earth Observation Scene Captioning",
                "description": "Generates detailed multi-sentence description of sensor parameters, land cover, and key objects.",
                "supported_modalities": ["optical", "SAR"],
                "required_bands": [],
                "min_bands": 1
            },
            "ndvi": {
                "name": "Normalized Difference Vegetation Index (NDVI)",
                "description": "Calculates vegetation vigor index.",
                "supported_modalities": ["optical"],
                "required_bands": ["RED", "NIR"],
                "min_bands": 4
            },
            "ndwi": {
                "name": "Normalized Difference Water Index (NDWI)",
                "description": "Highlights open water bodies.",
                "supported_modalities": ["optical"],
                "required_bands": ["GREEN", "NIR"],
                "min_bands": 4
            },
            "change_detection": {
                "name": "Multitemporal Change Detection",
                "description": "Compares T1 vs T2 optical or SAR rasters to detect land cover changes, flood expansion, or urban growth.",
                "supported_modalities": ["optical", "SAR"],
                "required_bands": [],
                "min_bands": 1,
                "requires_multitemporal": True
            },
            "sar_analysis": {
                "name": "SAR Radar Backscatter & Surface Roughness",
                "description": "Analyzes specular water reflections and urban double bounce in VV/VH polarizations.",
                "supported_modalities": ["SAR"],
                "required_bands": ["VV"],
                "min_bands": 1
            },
            "optical_sar_fusion": {
                "name": "Optical-SAR Paired Image Fusion",
                "description": "Fuses optical spectral reflectance with SAR radar backscatter for cloud-resilient flood & land cover detection.",
                "supported_modalities": ["optical", "SAR"],
                "requires_paired_sensors": True
            },
            "terrain_slope": {
                "name": "DEM Terrain Slope & Aspect Analysis",
                "description": "Derives surface slope angles in degrees and elevation profiles from DEM rasters.",
                "supported_modalities": ["dem"],
                "required_bands": [],
                "min_bands": 1
            },
            "area_measurement": {
                "name": "Deterministic Geodesic Area Measurement",
                "description": "Computes exact surface area in square kilometers (km²) for detected feature masks.",
                "supported_modalities": ["optical", "SAR", "dem"],
                "required_bands": [],
                "min_bands": 1
            }
        }

    def get_tool(self, tool_id):
        return self.tools.get(tool_id)

    def list_tools(self):
        return list(self.tools.keys())

registry = CapabilityRegistry()
