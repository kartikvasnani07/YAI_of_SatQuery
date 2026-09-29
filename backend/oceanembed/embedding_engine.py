# backend/oceanembed/embedding_engine.py
"""
Latent Ocean Embedding Explorer Engine for OceanEmbed
Visualizes 64-dimensional learned ocean state embeddings projected into 2D (PCA/UMAP).
Clearly labeled with DEMO / SYNTHETIC EMBEDDING.
"""
from typing import List, Dict, Any
import math
import numpy as np


def generate_embedding_space_points(date_str: str) -> Dict[str, Any]:
    """
    Generates projected 2D embeddings (PC1 vs PC2) representing latent ocean state representations
    across Arabian Sea, Bay of Bengal, Equatorial Indian Ocean, and Andaman Sea.
    """
    regions = [
        {"name": "Arabian Sea (Upper Layer)", "center": (-2.5, 3.1), "color": "#06B6D4", "count": 25},
        {"name": "Arabian Sea (Thermocline)", "center": (-1.8, 1.2), "color": "#0284C7", "count": 20},
        {"name": "Bay of Bengal (Low Salinity Surface)", "center": (3.2, 2.5), "color": "#3B82F6", "count": 25},
        {"name": "Bay of Bengal (Thermocline)", "center": (2.4, -0.8), "color": "#6366F1", "count": 20},
        {"name": "Equatorial Indian Ocean", "center": (0.2, -3.2), "color": "#10B981", "count": 25},
        {"name": "Partial Data / High Cloud Mask", "center": (-4.0, -2.1), "color": "#F59E0B", "count": 15},
    ]

    points = []
    pt_id = 1

    for reg in regions:
        cx, cy = reg["center"]
        for i in range(reg["count"]):
            # Random jitter around cluster centroid
            px = round(cx + np.random.normal(0, 0.45), 3)
            py = round(cy + np.random.normal(0, 0.45), 3)
            
            lat = round(10.0 + np.random.uniform(-5, 12), 2)
            lon = round(60.0 + np.random.uniform(-10, 30), 2)

            points.append({
                "id": f"EMB-{pt_id:04d}",
                "pc1": px,
                "pc2": py,
                "region": reg["name"],
                "color": reg["color"],
                "latitude": lat,
                "longitude": lon,
                "date": date_str,
                "latent_dim": 64,
                "temporal_context": "T-2, T-1, T",
                "completeness_pct": 100 if "Partial" not in reg["name"] else 65
            })
            pt_id += 1

    return {
        "status": "success",
        "label": "DEMO / SYNTHETIC EMBEDDING",
        "embedding_dimension": 64,
        "projection_method": "PCA 2D Projection (92.4% Explained Variance)",
        "temporal_context_window": ["T-2 (2026-01-13)", "T-1 (2026-01-14)", "T (2026-01-15)"],
        "total_embeddings": len(points),
        "points": points
    }
