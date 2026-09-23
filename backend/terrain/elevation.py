import numpy as np

def compute_slope_aspect(dem_data, resolution_m=10.0):
    """Calculates slope in degrees and aspect from a 2D DEM raster array."""
    if dem_data.ndim == 3:
        dem_data = dem_data[0]

    py, px = np.gradient(dem_data, resolution_m, resolution_m)
    slope_rad = np.arctan(np.sqrt(px**2 + py**2))
    slope_deg = np.degrees(slope_rad)

    aspect_rad = np.arctan2(-px, py)
    aspect_deg = np.degrees(aspect_rad) % 360.0

    return slope_deg, aspect_deg

def extract_elevation_profile(dem_data, start_px=(0, 0), end_px=(511, 511), num_samples=100, elevation_base=None):
    """Extracts elevation profile values along a 2D transect line, adjusted for target location topography."""
    if dem_data.ndim == 3:
        dem_data = dem_data[0]

    x0, y0 = start_px
    x1, y1 = end_px

    x_samples = np.linspace(x0, x1, num_samples).astype(int)
    y_samples = np.linspace(y0, y1, num_samples).astype(int)

    # Clamp indices
    height, width = dem_data.shape
    x_samples = np.clip(x_samples, 0, width - 1)
    y_samples = np.clip(y_samples, 0, height - 1)

    raw_elevations = dem_data[y_samples, x_samples]
    
    if elevation_base is not None and elevation_base > 0:
        # Normalize raster variation around elevation_base
        norm_var = (raw_elevations - np.mean(raw_elevations))
        elevations = elevation_base + norm_var * (1.5 if elevation_base > 500 else 0.8)
    else:
        elevations = raw_elevations

    distances_m = np.linspace(0, np.sqrt((x1 - x0)**2 + (y1 - y0)**2) * 10.0, num_samples)

    profile_points = [
        {"distance_m": float(round(d, 1)), "elevation_m": float(round(e, 1)), "px": int(x), "py": int(y)}
        for d, e, x, y in zip(distances_m, elevations, x_samples, y_samples)
    ]

    return {
        "start": {"x": x0, "y": y0},
        "end": {"x": x1, "y": y1},
        "elevation_base": elevation_base or 300.0,
        "max_elevation": float(round(np.max(elevations), 1)),
        "min_elevation": float(round(np.min(elevations), 1)),
        "mean_elevation": float(round(np.mean(elevations), 1)),
        "profile": profile_points
    }

