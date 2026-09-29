# OCEANEMBED

**Satellite Embedding-Based Deep Learning Framework for Reconstruction of Subsurface Ocean Temperature from Surface Satellite Observations**

**Smart India Hackathon 2026** | **Problem Statement: SIH26066**  
**Organization:** Ministry of Earth Sciences (MoES) / INCOIS  
**Domain:** Space Technology / Ocean & Earth Observation  

---

## 🌊 Overview & Core Vision

**OceanEmbed** is a scientific oceanographic research and visualization workstation built to explore the hidden thermal structure of the ocean from observable surface satellite conditions.

Satellites can directly measure surface parameters such as Sea Surface Temperature (SST), Sea Surface Salinity (SSS), Sea Surface Height / Sea Level Anomaly (SSH/SLA), and surface vector fields. However, satellite sensors cannot penetrate deep ocean waters. **OceanEmbed** learns a continuous latent representation of the ocean state from multimodal surface inputs, decoding depth-conditioned subsurface ocean temperature fields down to 1000 meters while explicitly exposing prediction uncertainty, missing-data handling, and independent validation against in-situ ARGO float profiles.

---

## 🎯 Primary Scientific Focus

- **Primary Reconstructed Variable:** Subsurface Ocean Temperature ($T(z)$)
- **Target Geographic Domain:** North Indian Ocean ($5^\circ\text{N} \to 30^\circ\text{N}, 45^\circ\text{E} \to 105^\circ\text{E}$)
  - Arabian Sea
  - Bay of Bengal
  - Andaman Sea
  - Equatorial Indian Ocean
  - Oman Basin & Chagos Trench
- **Standard Depth Levels ($z$):**
  `0m`, `5m`, `10m`, `20m`, `30m`, `50m`, `75m`, `100m`, `125m`, `150m`, `200m`, `300m`, `500m`, `700m`, `1000m`
- **Continuous Depth Querying:** Supports continuous depth interpolation $T(z)$ (e.g. 137m) with explicit labeling (`MODEL OUTPUT` vs `INTERPOLATED DISPLAY VALUE`).

---

## 🧠 System & Model Architecture

```
SURFACE SATELLITE OBSERVATIONS (SST, SSS, SSH, Currents, Winds)
                       ↓
              DATA HARMONIZATION & QC
                       ↓
               MISSINGNESS MASKING
                       ↓
         SATELLITE EMBEDDING ENCODER (64D)
                       ↓
           LATENT OCEAN REPRESENTATION
                       ↓
                DEPTH CONDITIONING (z)
                       ↓
           TEMPERATURE DECODER (0–1000m)
                       ↓
         UNCERTAINTY HEAD (Mean, 95% CI)
                       ↓
      IN-SITU ARGO FLOAT INDEPENDENT VALIDATION
```

### Modular Python Backend Architecture (`backend/oceanembed/`)
- `data_model.py`: Scientific Observation Cube abstraction ($T \times V \times \text{Lat} \times \text{Lon}$) with dataset metadata standards.
- `model_architecture.py`: Modular interfaces (`OceanDataLoader`, `ObservationNormalizer`, `GridHarmonizer`, `MissingnessMasker`, `OceanEncoder`, `DepthConditionedDecoder`, `UncertaintyHead`, `ValidationEngine`, `OceanReconstructionModel`).
- `reconstruction_engine.py`: North Indian Ocean physics profile generator, thermocline gradient solver ($\left|\frac{dT}{dz}\right|$), 2D spatial grid generator, and transect cross-sections.
- `argo_validation.py`: INCOIS ARGO float network validator evaluating RMSE, MAE, Bias, Pearson Correlation ($R$), and depth-wise error distribution.
- `embedding_engine.py`: 64D latent ocean state space projection into 2D (PCA/UMAP) clearly labeled as `DEMO / SYNTHETIC EMBEDDING`.
- `bathymetry_engine.py`: GEBCO bathymetric contours ($100\text{m} \to 6000\text{m}$) and seafloor elevation model.
- `query_planner.py`: Scientific Ocean Query NLP parser mapping natural language requests into structured execution plans (`DEPTH_SLICE`, `PROFILE`, `THERMOCLINE`, `UNCERTAINTY`, `ARGO_VALIDATION`, `3D_VOLUME`, `EMBEDDING_EXPLORER`).
- `report_generator.py`: Scientific ReportLab PDF summary exporter.

---

## 🚀 Key Features & Hackathon Showcase Capabilities

1. **2D Scientific Ocean Explorer Map:**
   - MapLibre GL centered on North Indian Ocean ($5^\circ\text{N} \to 30^\circ\text{N}, 45^\circ\text{E} \to 105^\circ\text{E}$).
   - Layers: Reconstructed Temperature Heatmap, GEBCO Seafloor Bathymetry contours, ARGO Float Pins, Prediction Uncertainty, Surface Current Vectors.
   - Interactive Point-Click Extraction: Instant vertical profile & thermocline panel on clicking any coordinate.

2. **3D Volumetric Ocean Field Visualizer:**
   - Three.js WebGL canvas rendering 3D water column, depth slices, seafloor bathymetry surface grid, and floating ARGO spheres.
   - Vertical Exaggeration control ($1\times, 2\times, 5\times, 10\times$), rotation, pan, zoom, and depth clipping slider.

3. **Point-Click Vertical Profile & Thermocline Diagnostics:**
   - Depth vs Temperature curve showing isothermal mixed layer and rapid thermocline temperature drop.
   - Thermocline gradient magnitude curve ($\left|\frac{dT}{dz}\right|$).
   - Prediction uncertainty bands ($T \pm 0.8^\circ\text{C}$, 95% confidence interval).

4. **In-Situ ARGO Float Network Validation:**
   - Real float platform matching (ARGO 2901542, ARGO 2901588, ARGO 6903211).
   - Quantitative evaluation metrics: RMSE, MAE, Bias, Pearson Correlation ($R$), $R^2$.
   - Depth-wise MAE breakdown ($0\text{--}50\text{m}$, $50\text{--}100\text{m}$, $100\text{--}200\text{m}$, $200\text{--}500\text{m}$, $500\text{--}1000\text{m}$).

5. **Latent Ocean Embedding Explorer:**
   - 2D scatter plot (PCA) of 64-dimensional learned ocean embeddings colored by region and surface data completeness.

6. **Scientific Ocean Natural-Language Query Assistant:**
   - Translates prompts like *"Show temperature at 100 m in Arabian Sea"* into structured operational intents without executing arbitrary shell code.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+ & npm
- Python 3.9+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m backend.main
```

---

## 🏷️ Scientific Honesty & Demonstration Disclaimer

In compliance with scientific integrity guidelines:
- Outputs produced by demo heuristics are explicitly labeled **`DEMO RECONSTRUCTION`**, **`DEMO PROFILE`**, **`DEMO VALIDATION`**, or **`DEMO / SYNTHETIC EMBEDDING`**.
- Continuous depth interpolation values are explicitly tagged **`INTERPOLATED DISPLAY VALUE`** to distinguish them from standard level **`MODEL OUTPUT`**.
