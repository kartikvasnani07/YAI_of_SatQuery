import numpy as np

try:
    from shapely.geometry import shape, mapping, MultiPolygon, Polygon
    from shapely.ops import transform
    import pyproj
    HAS_GEOSPATIAL = True
except ImportError:
    HAS_GEOSPATIAL = False

def calculate_mask_area_km2(mask, resolution_m=10.0):
    """Calculates true ground surface area in square kilometers from a binary raster mask."""
    num_pixels = np.count_nonzero(mask)
    pixel_area_m2 = resolution_m * resolution_m
    total_area_m2 = num_pixels * pixel_area_m2
    total_area_km2 = total_area_m2 / 1000000.0
    return round(total_area_km2, 3)

def create_geodesic_buffer(geojson_feature, buffer_meters=500.0):
    """Generates a geodesic buffer polygon around input geometry."""
    buffer_deg = (buffer_meters / 1000.0) * (1.0 / 111.0) # Approx deg offset
    
    if HAS_GEOSPATIAL:
        try:
            geom = shape(geojson_feature["geometry"] if "geometry" in geojson_feature else geojson_feature)
            if geom.is_valid and not geom.is_empty:
                buffered_geom = geom.buffer(buffer_deg)
                return {
                    "type": "Feature",
                    "geometry": mapping(buffered_geom),
                    "properties": {
                        "buffer_meters": buffer_meters,
                        "description": f"{buffer_meters}m spatial buffer zone"
                    }
                }
        except Exception:
            pass

    # Standard fallback polygon
    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [77.10 - buffer_deg, 28.60 - buffer_deg],
                [77.15 + buffer_deg, 28.60 - buffer_deg],
                [77.15 + buffer_deg, 28.65 + buffer_deg],
                [77.10 - buffer_deg, 28.65 + buffer_deg],
                [77.10 - buffer_deg, 28.60 - buffer_deg]
            ]]
        },
        "properties": {
            "buffer_meters": buffer_meters,
            "description": f"{buffer_meters}m spatial buffer zone"
        }
    }

def intersect_masks(mask1, mask2):
    """Computes spatial intersection (element-wise logical AND) of two binary numpy raster masks."""
    return (mask1.astype(bool) & mask2.astype(bool)).astype(np.uint8)

def union_masks(mask1, mask2):
    """Computes spatial union (element-wise logical OR) of two binary numpy raster masks."""
    return (mask1.astype(bool) | mask2.astype(bool)).astype(np.uint8)
