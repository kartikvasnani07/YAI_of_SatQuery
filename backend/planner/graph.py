class ScientificAnalysisPlan:
    def __init__(self, query_struct, observation_meta):
        self.query_struct = query_struct
        self.observation_meta = observation_meta
        self.steps = []
        self.build_plan()

    def build_plan(self):
        ops = self.query_struct.get("required_operations", [])
        intent = self.query_struct.get("intent")

        if intent == "ndvi_spectral_analysis":
            self.steps = [
                {"id": "step_val", "title": "Validate Imagery Band Prerequisites", "tool": "validator", "status": "pending"},
                {"id": "step_ndvi", "title": "Compute NDVI (NIR - RED) / (NIR + RED)", "tool": "ndvi", "status": "pending"},
                {"id": "step_mask", "title": "Generate Vegetation Density Mask", "tool": "grounding", "status": "pending"},
                {"id": "step_area", "title": "Calculate Total Vegetation Area (km²)", "tool": "area_measurement", "status": "pending"}
            ]
        elif intent == "multi_hop_geospatial_fusion":
            self.steps = [
                {"id": "step_1", "title": "Validate Spatial & Sensor Alignment (Optical Cartosat + SAR RISAT)", "tool": "validator", "status": "pending"},
                {"id": "step_2", "title": "Extract River & Main Water Channel Geometry", "tool": "grounding", "status": "pending"},
                {"id": "step_3", "title": f"Generate {self.query_struct['spatial_constraints']['buffer_meters']}m Geodesic Buffer Zone around River", "tool": "buffer", "status": "pending"},
                {"id": "step_4", "title": "Segment Agricultural Land Parcels", "tool": "grounding", "status": "pending"},
                {"id": "step_5", "title": "Detect Inundated Specular Surface in RISAT SAR (VV/VH Backscatter)", "tool": "sar_analysis", "status": "pending"},
                {"id": "step_6", "title": "Fuse Optical Spectral Signatures with SAR Radar Evidence", "tool": "optical_sar_fusion", "status": "pending"},
                {"id": "step_7", "title": "Compute Spatial Intersection (River Buffer ∩ Agriculture ∩ Flood Extent)", "tool": "intersection", "status": "pending"},
                {"id": "step_8", "title": "Calculate Exact Flood-Affected Agricultural Area (km²)", "tool": "area_measurement", "status": "pending"},
                {"id": "step_9", "title": "Evaluate 3-Month Post-Event Vegetation Recovery Index (T3 vs T2)", "tool": "change_detection", "status": "pending"},
                {"id": "step_10", "title": "Synthesize Spatial Uncertainty & Multi-Model Consensus Map", "tool": "uncertainty", "status": "pending"}
            ]
        elif intent == "multitemporal_analysis":
            self.steps = [
                {"id": "step_val", "title": "Validate Co-registration of T1 & T2 Imagery", "tool": "validator", "status": "pending"},
                {"id": "step_diff", "title": "Compute Pixel-Wise Multitemporal Difference Mask", "tool": "change_detection", "status": "pending"},
                {"id": "step_area", "title": "Calculate Net Land Cover Change Area (km²)", "tool": "area_measurement", "status": "pending"},
                {"id": "step_summary", "title": "Synthesize Spatiotemporal Transition Summary", "tool": "captioning", "status": "pending"}
            ]
        else:
            self.steps = [
                {"id": "step_val", "title": "Validate Input Observation", "tool": "validator", "status": "pending"},
                {"id": "step_exec", "title": f"Execute {intent.upper()} Analysis Pipeline", "tool": "vqa", "status": "pending"},
                {"id": "step_evid", "title": "Generate Evidence Map Overlay", "tool": "evidence", "status": "pending"}
            ]

    def to_dict(self):
        return {
            "intent": self.query_struct.get("intent"),
            "steps": self.steps
        }
