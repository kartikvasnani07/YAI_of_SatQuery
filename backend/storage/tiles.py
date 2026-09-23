import os
from backend.geospatial.raster_ops import load_raster_data, raster_to_png_bytes

CACHE = {}

def get_layer_png_bytes(observation_id, band_type="rgb"):
    cache_key = f"{observation_id}_{band_type}"
    if cache_key in CACHE:
        return CACHE[cache_key]

    # Map observation_id to filename
    mapping = {
        "obs_cartosat_t1": ("cartosat_optical_t1.tif", (0, 1, 2)),
        "obs_cartosat_t2": ("cartosat_optical_t2.tif", (0, 1, 2)),
        "obs_cartosat_t3": ("cartosat_optical_t3.tif", (0, 1, 2)),
        "obs_risat_sar_t1": ("risat_sar_t1.tif", (0, 1, 0)),
        "obs_risat_sar_t2": ("risat_sar_t2.tif", (0, 1, 0)),
        "obs_dem": ("dem_elevation.tif", (0, 0, 0)),
        "obs_rgb_only": ("optical_rgb_only.tif", (0, 1, 2))
    }

    if observation_id not in mapping:
        filename, bands = ("cartosat_optical_t1.tif", (0, 1, 2))
    else:
        filename, bands = mapping[observation_id]

    data, bounds, crs, transform = load_raster_data(filename)
    png_bytes = raster_to_png_bytes(data, band_indices=bands)
    CACHE[cache_key] = png_bytes
    return png_bytes
