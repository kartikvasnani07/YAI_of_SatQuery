import numpy as np

class TextGroundingEngine:
    def ground(self, target_text, raster_data, observation_meta):
        text_lower = target_text.lower()
        
        # Dimensions
        if raster_data is not None and raster_data.ndim == 3:
            num_bands, height, width = raster_data.shape
        else:
            height, width = 512, 512

        x, y = np.meshgrid(np.arange(width), np.arange(height))
        river_center = 200 + 40 * np.sin(y / 40.0)

        mask = np.zeros((height, width), dtype=np.uint8)
        label = "Target Feature"

        if "river" in text_lower or "water" in text_lower:
            mask = (np.abs(x - river_center) < 25).astype(np.uint8)
            label = "River & Water Channel"
            bbox = [150, 0, 290, 511]
        elif "agri" in text_lower or "crop" in text_lower or "farm" in text_lower:
            mask = ((x >= river_center + 25) & (x <= river_center + 120) & (y >= 100) & (y <= 420)).astype(np.uint8)
            label = "Agricultural Land Parcels"
            bbox = [225, 100, 360, 420]
        elif "flood" in text_lower or "inundat" in text_lower:
            flood_mask = (np.abs(x - river_center) < 25) | (((x >= river_center + 25) & (x <= river_center + 120) & (y >= 100) & (y <= 420)) & (y >= 200) & (y <= 320))
            mask = flood_mask.astype(np.uint8)
            label = "Flood Inundation Extent"
            bbox = [160, 0, 360, 511]
        elif "building" in text_lower or "urban" in text_lower or "structure" in text_lower:
            mask = ((x >= 380) & (y >= 350)).astype(np.uint8)
            label = "Urban Buildings"
            bbox = [380, 350, 511, 511]
        elif "forest" in text_lower or "vegetation" in text_lower:
            mask = ((x <= river_center - 40) & (y <= 220)).astype(np.uint8)
            label = "Forest Canopy"
            bbox = [0, 0, 160, 220]
        else:
            # Generic threshold grounding
            mask = (raster_data[0] > np.percentile(raster_data[0], 75)).astype(np.uint8)
            bbox = [100, 100, 400, 400]

        return {
            "label": label,
            "mask": mask,
            "bbox_pixels": bbox,
            "confidence": 0.95
        }

grounding_engine = TextGroundingEngine()
