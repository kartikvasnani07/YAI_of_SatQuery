import re

class QueryParser:
    def parse(self, prompt, observation_meta=None):
        prompt_lower = prompt.lower()
        
        entities = []
        if "river" in prompt_lower or "water" in prompt_lower:
            entities.append("river")
        if "agriculture" in prompt_lower or "agricultural" in prompt_lower or "crop" in prompt_lower or "farm" in prompt_lower:
            entities.append("agricultural_land")
        if "flood" in prompt_lower or "flooding" in prompt_lower or "inundat" in prompt_lower:
            entities.append("flood_extent")
        if "building" in prompt_lower or "urban" in prompt_lower or "structure" in prompt_lower:
            entities.append("urban_buildings")
        if "forest" in prompt_lower or "vegetation" in prompt_lower:
            entities.append("vegetation")
        if "slope" in prompt_lower or "elevation" in prompt_lower or "steep" in prompt_lower or "dem" in prompt_lower:
            entities.append("terrain")

        # Extract buffer distance in meters
        buffer_meters = None
        match_buf = re.search(r'(\d+)\s*(m|meter|km|kilometer)', prompt_lower)
        if match_buf:
            val = int(match_buf.group(1))
            unit = match_buf.group(2)
            buffer_meters = val * 1000 if "km" in unit else val

        # Intent detection logic
        if "ndvi" in prompt_lower:
            intent = "ndvi_spectral_analysis"
            ops = ["ndvi_calculation", "vegetation_mask"]
        elif "changed" in prompt_lower or "change" in prompt_lower or "recovered" in prompt_lower or "recovery" in prompt_lower or "trend" in prompt_lower:
            intent = "multitemporal_analysis"
            ops = ["multitemporal_change_detection", "area_measurement_km2"]
            if "recovered" in prompt_lower or "recovery" in prompt_lower:
                ops.append("vegetation_recovery_analysis")
        elif "grounding" in prompt_lower or "highlight" in prompt_lower or "show me" in prompt_lower or "locate" in prompt_lower or "find" in prompt_lower:
            intent = "grounding"
            ops = ["text_guided_grounding", "area_measurement_km2"]
        elif "caption" in prompt_lower or "describe" in prompt_lower:
            intent = "captioning"
            ops = ["scene_captioning"]
        else:
            intent = "vqa"
            ops = ["vqa_reasoning"]

        # Check multi-hop query features (Flagship query override)
        if len(entities) >= 3 and ("flood" in prompt_lower or "sar" in prompt_lower or buffer_meters is not None):
            intent = "multi_hop_geospatial_fusion"
            ops = [
                "validate_inputs",
                "detect_river",
                "generate_geodesic_buffer",
                "detect_agricultural_land",
                "detect_flood_extent",
                "optical_sar_evidence_fusion",
                "calculate_spatial_intersection",
                "compute_area_km2",
                "evaluate_temporal_recovery",
                "estimate_spatial_uncertainty"
            ]

        return {
            "query": prompt,
            "intent": intent,
            "entities": entities,
            "spatial_constraints": {
                "buffer_meters": buffer_meters or 500
            },
            "temporal_constraints": {
                "multitemporal": "changed" in prompt_lower or "recovered" in prompt_lower or "t1" in prompt_lower or "t2" in prompt_lower,
                "timespan_months": 3
            },
            "required_operations": ops
        }

parser = QueryParser()
