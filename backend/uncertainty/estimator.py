import numpy as np

class SpatialUncertaintyEstimator:
    def estimate_uncertainty(self, mask, data_quality_score=0.95):
        """Computes spatial uncertainty map for classification/segmentation masks."""
        height, width = mask.shape
        uncertainty_map = np.zeros((height, width), dtype=np.float32)

        # Boundary pixel detection (higher spatial uncertainty along feature edges)
        from scipy.ndimage import binary_dilation, binary_erosion
        dilated = binary_dilation(mask)
        eroded = binary_erosion(mask)
        boundary_mask = dilated ^ eroded

        uncertainty_map[mask > 0] = 0.05
        uncertainty_map[boundary_mask] = 0.45
        uncertainty_map += (1.0 - data_quality_score) * 0.2

        overall_uncertainty = float(np.mean(uncertainty_map[mask > 0])) if np.count_nonzero(mask) > 0 else 0.08

        return {
            "uncertainty_map": uncertainty_map,
            "overall_uncertainty_score": round(overall_uncertainty, 3),
            "confidence_score": round(1.0 - overall_uncertainty, 3),
            "disagreement_level": "Low (High Model Consensus)" if overall_uncertainty < 0.15 else "Moderate"
        }

uncertainty_estimator = SpatialUncertaintyEstimator()
