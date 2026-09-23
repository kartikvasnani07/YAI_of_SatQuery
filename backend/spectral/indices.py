import numpy as np

class MissingBandError(Exception):
    """Exception raised when required spectral band is missing."""
    pass

def compute_ndvi(data, band_mapping={"RED": 0, "NIR": 3}):
    """Computes Normalized Difference Vegetation Index (NDVI).
    NDVI = (NIR - RED) / (NIR + RED)
    Requires: RED and NIR bands.
    """
    if "RED" not in band_mapping or "NIR" not in band_mapping:
        raise MissingBandError("NDVI requires RED and NIR bands. Input data lacks NIR band.")

    num_bands = data.shape[0]
    red_idx = band_mapping["RED"]
    nir_idx = band_mapping["NIR"]

    if red_idx >= num_bands or nir_idx >= num_bands:
        raise MissingBandError("NDVI calculation failed: Band index exceeds available raster band count.")

    red = data[red_idx].astype(np.float32)
    nir = data[nir_idx].astype(np.float32)

    denom = nir + red
    denom[denom == 0] = 1e-5
    ndvi = (nir - red) / denom
    return np.clip(ndvi, -1.0, 1.0)

def compute_ndwi(data, band_mapping={"GREEN": 1, "NIR": 3}):
    """Computes Normalized Difference Water Index (NDWI).
    NDWI = (GREEN - NIR) / (GREEN + NIR)
    Requires: GREEN and NIR bands.
    """
    if "GREEN" not in band_mapping or "NIR" not in band_mapping:
        raise MissingBandError("NDWI requires GREEN and NIR bands.")

    green = data[band_mapping["GREEN"]].astype(np.float32)
    nir = data[band_mapping["NIR"]].astype(np.float32)

    denom = green + nir
    denom[denom == 0] = 1e-5
    ndwi = (green - nir) / denom
    return np.clip(ndwi, -1.0, 1.0)
