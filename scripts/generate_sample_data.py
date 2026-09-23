import os
import json
import numpy as np

try:
    import rasterio
    from rasterio.transform import from_origin
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

try:
    import tifffile
    HAS_TIFFFILE = True
except ImportError:
    HAS_TIFFFILE = False

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets", "sample_data"))

def create_geotiff_rasterio(filepath, data, crs="EPSG:32643", transform=(345000.0, 10.0, 0.0, 1420000.0, 0.0, -10.0)):
    """Creates a GeoTIFF raster using rasterio."""
    count, height, width = data.shape
    t = from_origin(transform[0], transform[3], transform[1], abs(transform[5]))
    with rasterio.open(
        filepath,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=count,
        dtype=data.dtype,
        crs=crs,
        transform=t,
    ) as dst:
        for i in range(count):
            dst.write(data[i], i + 1)
    print(f"Created GeoTIFF: {filepath} ({count} bands, {width}x{height})")

def create_geotiff_fallback(filepath, data):
    """Fallback TIFF writer using tifffile or numpy raw saving."""
    if HAS_TIFFFILE:
        tifffile.imwrite(filepath, data)
        print(f"Created TIFF (tifffile fallback): {filepath}")
    else:
        np.save(filepath.replace('.tif', '.npy'), data)
        print(f"Created NPY fallback: {filepath}")

def generate_datasets():
    os.makedirs(DATASET_DIR, exist_ok=True)
    height, width = 512, 512

    # Coordinate grids using meshgrid
    x, y = np.meshgrid(np.arange(width), np.arange(height))
    
    # Feature Geometry Definitions:
    # 1. River running vertically through center with sinusoidal curve
    river_center = 200 + 40 * np.sin(y / 40.0)
    river_mask = np.abs(x - river_center) < 25 # ~500m wide river (50 pixels * 10m)

    # 2. Agricultural fields adjacent to river (east side)
    agri_mask = (x >= river_center + 25) & (x <= river_center + 120) & (y >= 100) & (y <= 420)

    # 3. Forest area (north-west quadrant)
    forest_mask = (x <= river_center - 40) & (y <= 220)

    # 4. Urban settlement (south-east quadrant) - realistic urban texture
    urban_mask = (x >= 360) & (y >= 320) & ((x + y) % 6 < 4)

    # 5. Flood expansion at T2 over agricultural fields
    flood_t2_mask = river_mask | ((agri_mask) & (y >= 200) & (y <= 320))

    # --- OPTICAL T1 (4 Bands: Red, Green, Blue, NIR) ---
    opt_t1 = np.zeros((4, height, width), dtype=np.uint16)
    # Background soil
    opt_t1[0] = 1200; opt_t1[1] = 1100; opt_t1[2] = 900; opt_t1[3] = 1800
    # River (water: low NIR, dark blue-green)
    opt_t1[0, river_mask] = 400; opt_t1[1, river_mask] = 800; opt_t1[2, river_mask] = 1400; opt_t1[3, river_mask] = 200
    # Agricultural fields (vegetation: high NIR, high green)
    opt_t1[0, agri_mask] = 500; opt_t1[1, agri_mask] = 1800; opt_t1[2, agri_mask] = 600; opt_t1[3, agri_mask] = 4500
    # Forest (dense vegetation: very high NIR)
    opt_t1[0, forest_mask] = 300; opt_t1[1, forest_mask] = 1400; opt_t1[2, forest_mask] = 400; opt_t1[3, forest_mask] = 5500
    # Urban (natural building reflectance)
    opt_t1[0, urban_mask] = 1800; opt_t1[1, urban_mask] = 1750; opt_t1[2, urban_mask] = 1650; opt_t1[3, urban_mask] = 1900

    # Sensor noise
    opt_t1 = np.clip(opt_t1 + np.random.randint(-40, 40, opt_t1.shape), 0, 10000).astype(np.uint16)

    # --- OPTICAL T2 (Flood Event) ---
    opt_t2 = opt_t1.copy()
    # Apply flood mask over flooded agriculture
    opt_t2[0, flood_t2_mask] = 450; opt_t2[1, flood_t2_mask] = 850; opt_t2[2, flood_t2_mask] = 1500; opt_t2[3, flood_t2_mask] = 250

    # --- OPTICAL T3 (Post-flood Recovery) ---
    opt_t3 = opt_t1.copy()
    recovered_mask = flood_t2_mask & agri_mask
    opt_t3[0, recovered_mask] = 600; opt_t3[1, recovered_mask] = 1600; opt_t3[2, recovered_mask] = 700; opt_t3[3, recovered_mask] = 3400

    # --- SAR T1 (2 Bands: VV, VH) ---
    sar_t1 = np.zeros((2, height, width), dtype=np.uint16)
    sar_t1[0] = 1600; sar_t1[1] = 800
    sar_t1[0, river_mask] = 150; sar_t1[1, river_mask] = 80
    sar_t1[0, agri_mask] = 1900; sar_t1[1, agri_mask] = 950
    sar_t1[0, forest_mask] = 2400; sar_t1[1, forest_mask] = 1400
    sar_t1[0, urban_mask] = 2800; sar_t1[1, urban_mask] = 1900
    sar_t1 = np.clip(sar_t1 + np.random.randint(-50, 50, sar_t1.shape), 0, 10000).astype(np.uint16)

    # --- SAR T2 (Flood Event) ---
    sar_t2 = sar_t1.copy()
    sar_t2[0, flood_t2_mask] = 180; sar_t2[1, flood_t2_mask] = 90

    # --- DEM Raster (Elevation in meters) ---
    dem = np.zeros((1, height, width), dtype=np.float32)
    dist_from_river = np.abs(x - river_center)
    dem[0] = 80.0 + (dist_from_river * 0.4) + (y * 0.1)
    dem[0, x > 400] += (x[x > 400] - 400) * 1.5

    # --- RGB-ONLY Image (3 Bands: R, G, B) ---
    opt_rgb_only = opt_t1[0:3].copy()

    save_fn = create_geotiff_rasterio if HAS_RASTERIO else create_geotiff_fallback

    path_opt_t1 = os.path.join(DATASET_DIR, "cartosat_optical_t1.tif")
    path_opt_t2 = os.path.join(DATASET_DIR, "cartosat_optical_t2.tif")
    path_opt_t3 = os.path.join(DATASET_DIR, "cartosat_optical_t3.tif")
    path_sar_t1 = os.path.join(DATASET_DIR, "risat_sar_t1.tif")
    path_sar_t2 = os.path.join(DATASET_DIR, "risat_sar_t2.tif")
    path_dem    = os.path.join(DATASET_DIR, "dem_elevation.tif")
    path_rgb    = os.path.join(DATASET_DIR, "optical_rgb_only.tif")

    save_fn(path_opt_t1, opt_t1)
    save_fn(path_opt_t2, opt_t2)
    save_fn(path_opt_t3, opt_t3)
    save_fn(path_sar_t1, sar_t1)
    save_fn(path_sar_t2, sar_t2)
    save_fn(path_dem, dem)
    save_fn(path_rgb, opt_rgb_only)

    catalog = {
        "observations": [
            {
                "id": "obs_cartosat_t1",
                "name": "Cartosat-2S / Sentinel-2 Optical T1 (Pre-Flood)",
                "modality": "optical",
                "sensor": "Cartosat-2S / Sentinel-2",
                "acquisition_time": "2026-01-15T10:30:00Z",
                "crs": "EPSG:32643",
                "resolution_m": 10.0,
                "bands": ["RED", "GREEN", "BLUE", "NIR"],
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "cartosat_optical_t1.tif",
                "has_nir": True
            },
            {
                "id": "obs_cartosat_t2",
                "name": "Cartosat-2S / Sentinel-2 Optical T2 (Peak Flood)",
                "modality": "optical",
                "sensor": "Cartosat-2S / Sentinel-2",
                "acquisition_time": "2026-03-20T10:30:00Z",
                "crs": "EPSG:32643",
                "resolution_m": 10.0,
                "bands": ["RED", "GREEN", "BLUE", "NIR"],
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "cartosat_optical_t2.tif",
                "has_nir": True
            },
            {
                "id": "obs_cartosat_t3",
                "name": "Cartosat-2S / Sentinel-2 Optical T3 (Post-Flood 3 Months)",
                "modality": "optical",
                "sensor": "Cartosat-2S / Sentinel-2",
                "acquisition_time": "2026-06-15T10:30:00Z",
                "crs": "EPSG:32643",
                "resolution_m": 10.0,
                "bands": ["RED", "GREEN", "BLUE", "NIR"],
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "cartosat_optical_t3.tif",
                "has_nir": True
            },
            {
                "id": "obs_risat_sar_t1",
                "name": "RISAT-1 / Sentinel-1 SAR T1 (Pre-Flood)",
                "modality": "SAR",
                "sensor": "RISAT-1 C-Band SAR",
                "polarization": ["VV", "VH"],
                "acquisition_time": "2026-01-16T05:15:00Z",
                "crs": "EPSG:32643",
                "resolution_m": 10.0,
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "risat_sar_t1.tif",
                "has_nir": False
            },
            {
                "id": "obs_risat_sar_t2",
                "name": "RISAT-1 / Sentinel-1 SAR T2 (Peak Flood)",
                "modality": "SAR",
                "sensor": "RISAT-1 C-Band SAR",
                "polarization": ["VV", "VH"],
                "acquisition_time": "2026-03-21T05:15:00Z",
                "crs": "EPSG:32643",
                "resolution_m": 10.0,
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "risat_sar_t2.tif",
                "has_nir": False
            },
            {
                "id": "obs_dem",
                "name": "SRTM Digital Elevation Model (DEM)",
                "modality": "dem",
                "sensor": "SRTM / CartoDEM",
                "resolution_m": 10.0,
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "dem_elevation.tif",
                "has_nir": False
            },
            {
                "id": "obs_rgb_only",
                "name": "Aerial True-Color RGB-Only Snapshot",
                "modality": "optical",
                "sensor": "Commercial Drone RGB",
                "acquisition_time": "2026-02-01T12:00:00Z",
                "crs": "EPSG:32643",
                "resolution_m": 0.5,
                "bands": ["RED", "GREEN", "BLUE"],
                "bounds": [77.10, 28.60, 77.15, 28.65],
                "filepath": "optical_rgb_only.tif",
                "has_nir": False
            }
        ]
    }

    catalog_path = os.path.join(DATASET_DIR, "catalog.json")
    with open(catalog_path, "w") as f:
        json.dump(catalog, f, indent=2)
    print(f"Catalog saved to {catalog_path}")

if __name__ == "__main__":
    generate_datasets()
