import os
import io
import json
import numpy as np
from PIL import Image

try:
    import rasterio
    from rasterio.features import shapes
    from rasterio.warp import transform_bounds
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

try:
    import shapely.geometry
    import shapely.ops
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False

from backend.config import DATASET_DIR

def load_raster_data(filename):
    """Loads a raster file and returns data array, bounds, crs, transform."""
    filepath = os.path.join(DATASET_DIR, filename)
    if not os.path.exists(filepath):
        # Check npy fallback
        npy_path = filepath.replace('.tif', '.npy')
        if os.path.exists(npy_path):
            data = np.load(npy_path)
            return data, [77.10, 28.60, 77.15, 28.65], "EPSG:32643", None
        raise FileNotFoundError(f"Raster file not found: {filename}")

    if HAS_RASTERIO:
        with rasterio.open(filepath) as src:
            data = src.read()
            bounds = [src.bounds.left, src.bounds.bottom, src.bounds.right, src.bounds.top]
            crs = str(src.crs)
            transform = src.transform
            return data, bounds, crs, transform
    else:
        # Fallback numpy load
        data = np.load(filepath) if filepath.endswith('.npy') else np.zeros((4, 512, 512), dtype=np.uint16)
        return data, [77.10, 28.60, 77.15, 28.65], "EPSG:32643", None

def raster_to_png_bytes(data, band_indices=(0, 1, 2), stretch=True):
    """Converts multi-band raster data array to an RGBA PNG byte array with alpha blending."""
    if data.ndim == 2:
        img_array = data.astype(np.float32)
        if stretch:
            vmin, vmax = np.percentile(img_array, (2, 98))
            if vmax > vmin:
                img_array = np.clip((img_array - vmin) / (vmax - vmin) * 255.0, 0, 255)
            else:
                img_array = np.zeros_like(img_array)
        img = Image.fromarray(img_array.astype(np.uint8), mode='L').convert('RGBA')
    else:
        num_bands = data.shape[0]
        selected_bands = []
        for idx in band_indices:
            if idx < num_bands:
                b = data[idx].astype(np.float32)
            else:
                b = data[0].astype(np.float32)
            if stretch:
                vmin, vmax = np.percentile(b, (1, 99))
                if vmax > vmin:
                    b = np.clip((b - vmin) / (vmax - vmin) * 255.0, 0, 255)
                else:
                    b = np.zeros_like(b)
            selected_bands.append(b.astype(np.uint8))
        
        rgb = np.stack(selected_bands, axis=-1)
        # Create alpha channel (transparent for nodata/zero pixels)
        alpha = np.where(np.sum(rgb, axis=-1) > 0, 230, 0).astype(np.uint8)
        rgba = np.dstack((rgb, alpha))
        img = Image.fromarray(rgba, mode='RGBA')

    output = io.BytesIO()
    img.save(output, format='PNG')
    return output.getvalue()

def mask_to_geojson(mask, transform=None, bounds=[77.10, 28.60, 77.15, 28.65]):
    """Converts a binary boolean/uint8 2D numpy mask array into a GeoJSON FeatureCollection."""
    features = []
    
    if HAS_RASTERIO and transform is not None:
        mask_int = mask.astype(np.int32)
        results = (
            {'geometry': s, 'properties': {'value': int(v)}}
            for i, (s, v) in enumerate(shapes(mask_int, mask=mask_int > 0, transform=transform))
        )
        for r in results:
            features.append({
                "type": "Feature",
                "geometry": r['geometry'],
                "properties": r['properties']
            })
    else:
        # Fallback bounding box polygonization based on spatial extent
        height, width = mask.shape
        minx, miny, maxx, maxy = bounds
        dx = (maxx - minx) / width
        dy = (maxy - miny) / height

        # Find bounding box of active mask pixels
        y_indices, x_indices = np.where(mask > 0)
        if len(x_indices) > 0:
            poly_minx = minx + np.min(x_indices) * dx
            poly_maxx = minx + (np.max(x_indices) + 1) * dx
            poly_maxy = maxy - np.min(y_indices) * dy
            poly_miny = maxy - (np.max(y_indices) + 1) * dy

            geometry = {
                "type": "Polygon",
                "coordinates": [[
                    [poly_minx, poly_miny],
                    [poly_maxx, poly_miny],
                    [poly_maxx, poly_maxy],
                    [poly_minx, poly_maxy],
                    [poly_minx, poly_miny]
                ]]
            }
            features.append({
                "type": "Feature",
                "geometry": geometry,
                "properties": {"value": 1}
            })

    return {
        "type": "FeatureCollection",
        "features": features
    }
