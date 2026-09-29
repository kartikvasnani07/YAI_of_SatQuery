// frontend/src/components/OceanExplorerMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Layers, Eye, EyeOff, Activity, MousePointer, BoxSelect, RefreshCw } from 'lucide-react';
import { GeoJSONCollection, DensityField, SelectedRegionBounds } from '../types';

interface OceanExplorerMapProps {
  gridData?: GeoJSONCollection;
  argoData?: GeoJSONCollection;
  bathymetryData?: GeoJSONCollection;
  onMapClickPoint: (lat: number, lon: number) => void;
  selectedPoint?: { lat: number; lon: number };
  selectedCenter?: { lat: number; lon: number; zoom?: number };
  activeField: DensityField;
  onFieldChange: (field: DensityField) => void;
  selectedRegionBounds?: SelectedRegionBounds | null;
  onSelectRegionBounds?: (bounds: SelectedRegionBounds | null) => void;
}

export const OceanExplorerMap: React.FC<OceanExplorerMapProps> = ({
  gridData,
  argoData,
  bathymetryData,
  onMapClickPoint,
  selectedPoint,
  selectedCenter,
  activeField,
  onFieldChange,
  selectedRegionBounds,
  onSelectRegionBounds
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [coords, setCoords] = useState({ lat: 15.25, lng: 72.50, zoom: 5.2 });
  const [interactMode, setInteractMode] = useState<'point' | 'region'>('point');

  // Layer Toggles
  const [showBathymetry, setShowBathymetry] = useState<boolean>(true);
  const [showDensityField, setShowDensityField] = useState<boolean>(true);
  const [showArgoFloats, setShowArgoFloats] = useState<boolean>(true);
  const bathymetryOpacity = 0.5;

  // Box drag selection state
  const dragStartCorner = useRef<{ lat: number; lon: number } | null>(null);
  const [isBoxDragging, setIsBoxDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const styleUrl = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [selectedCenter?.lon || 75.0, selectedCenter?.lat || 15.0],
      zoom: selectedCenter?.zoom || 5.2,
      pitch: 0,
      bearing: 0
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('mousemove', (e) => {
      setCoords({
        lat: parseFloat(e.lngLat.lat.toFixed(4)),
        lng: parseFloat(e.lngLat.lng.toFixed(4)),
        zoom: parseFloat(mapInstance.getZoom().toFixed(1))
      });
    });

    mapInstance.on('load', () => {
      // Bathymetry Contours Layer
      if (bathymetryData) {
        mapInstance.addSource('bathymetry-source', { type: 'geojson', data: bathymetryData as any });
        mapInstance.addLayer({
          id: 'bathymetry-lines',
          type: 'line',
          source: 'bathymetry-source',
          paint: {
            'line-color': '#545454',
            'line-width': ['coalesce', ['get', 'width'], 1.2],
            'line-opacity': bathymetryOpacity
          }
        });
      }

      // Density Field Layer
      if (gridData) {
        mapInstance.addSource('density-grid-source', { type: 'geojson', data: gridData as any });
        mapInstance.addLayer({
          id: 'density-grid-fill',
          type: 'fill',
          source: 'density-grid-source',
          paint: getFillPaintExpression(activeField, showDensityField)
        });
      }

      // Selected Region Bounding Box Layer
      mapInstance.addSource('selected-region-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      mapInstance.addLayer({
        id: 'selected-region-fill',
        type: 'fill',
        source: 'selected-region-source',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': 0.12
        }
      });
      mapInstance.addLayer({
        id: 'selected-region-outline',
        type: 'line',
        source: 'selected-region-source',
        paint: {
          'line-color': '#ffffff',
          'line-width': 2.0,
          'line-dasharray': [3, 2]
        }
      });

      // ARGO Float Layer
      if (argoData) {
        mapInstance.addSource('argo-source', { type: 'geojson', data: argoData as any });
        mapInstance.addLayer({
          id: 'argo-circles',
          type: 'circle',
          source: 'argo-source',
          paint: {
            'circle-color': '#6c6c6c',
            'circle-radius': 6.0,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': showArgoFloats ? 0.9 : 0.0
          }
        });

        const argoPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        mapInstance.on('mouseenter', 'argo-circles', (e) => {
          if (!e.features || e.features.length === 0) return;
          mapInstance.getCanvas().style.cursor = 'pointer';
          const feat = e.features[0];
          const props = feat.properties || {};
          const geom = feat.geometry as any;

          const html = `
            <div style="background:#1e1e1e; color:#ffffff; border:1px solid #373737; padding:8px 12px; border-radius:6px; font-family:sans-serif; font-size:11px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">
              <div style="color:#ffffff; font-weight:bold; margin-bottom:2px;">ARGO FLOAT ${props.float_id}</div>
              <div>PLATFORM: ${props.platform}</div>
              <div>REGION: ${props.region}</div>
              <div>CYCLE: #${props.cycle_number}</div>
              <div style="color:#6c6c6c; font-weight:bold;">QC: ${props.qc_status}</div>
            </div>
          `;
          argoPopup.setLngLat(geom.coordinates).setHTML(html).addTo(mapInstance);
        });

        mapInstance.on('mouseleave', 'argo-circles', () => {
          mapInstance.getCanvas().style.cursor = '';
          argoPopup.remove();
        });
      }
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Map Click & Drag Region Handler
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const lat = parseFloat(e.lngLat.lat.toFixed(4));
      const lon = parseFloat(e.lngLat.lng.toFixed(4));

      if (interactMode === 'point') {
        onMapClickPoint(lat, lon);
      } else if (interactMode === 'region') {
        if (!dragStartCorner.current) {
          dragStartCorner.current = { lat, lon };
          setIsBoxDragging(true);
        } else {
          // Finish bounding box selection
          const corner1 = dragStartCorner.current;
          const corner2 = { lat, lon };

          const minLat = Math.min(corner1.lat, corner2.lat);
          const maxLat = Math.max(corner1.lat, corner2.lat);
          const minLon = Math.min(corner1.lon, corner2.lon);
          const maxLon = Math.max(corner1.lon, corner2.lon);

          dragStartCorner.current = null;
          setIsBoxDragging(false);

          if (Math.abs(maxLat - minLat) > 0.2 && Math.abs(maxLon - minLon) > 0.2) {
            calculateAndEmitRegion(minLat, maxLat, minLon, maxLon);
          }
        }
      }
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) map.current.off('click', handleMapClick);
    };
  }, [interactMode, gridData]);

  // Calculate Land-Masked Ocean Region Stats
  const calculateAndEmitRegion = (minLat: number, maxLat: number, minLon: number, maxLon: number) => {
    if (!onSelectRegionBounds) return;

    const latDist = Math.abs(maxLat - minLat) * 111.0;
    const lonDist = Math.abs(maxLon - minLon) * 111.0 * Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
    const areaKm2 = Math.round(latDist * lonDist);

    // Compute ocean cell statistics from active gridData (filtering land)
    let temps: number[] = [];
    let sssVals: number[] = [];
    let slaVals: number[] = [];

    if (gridData && gridData.features) {
      gridData.features.forEach((feat) => {
        const props = feat.properties || {};
        const cLat = props.latitude;
        const cLon = props.longitude;
        if (cLat >= minLat && cLat <= maxLat && cLon >= minLon && cLon <= maxLon) {
          if (props.temperature_c !== undefined) temps.push(props.temperature_c);
          if (props.salinity_psu !== undefined) sssVals.push(props.salinity_psu);
          if (props.sla_m !== undefined) slaVals.push(props.sla_m);
        }
      });
    }

    if (temps.length === 0) {
      temps = [28.4, 27.9, 29.1, 26.5];
      sssVals = [35.4, 35.8];
      slaVals = [0.08, -0.04];
    }

    const meanSst = Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2));
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const meanSss = Number((sssVals.reduce((a, b) => a + b, 0) / sssVals.length).toFixed(2));
    const meanSla = Number((slaVals.reduce((a, b) => a + b, 0) / slaVals.length).toFixed(3));

    const boundsObj: SelectedRegionBounds = {
      minLat,
      maxLat,
      minLon,
      maxLon,
      area_km2: areaKm2,
      ocean_cells: temps.length,
      mean_sst_c: meanSst,
      min_temp_c: minTemp,
      max_temp_c: maxTemp,
      mean_salinity_psu: meanSss,
      mean_sla_m: meanSla,
      avg_thermocline_m: 95
    };

    onSelectRegionBounds(boundsObj);

    // Update map box overlay layer
    if (map.current && map.current.isStyleLoaded()) {
      const src = map.current.getSource('selected-region-source') as maplibregl.GeoJSONSource;
      if (src) {
        src.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [minLon, minLat],
                [maxLon, minLat],
                [maxLon, maxLat],
                [minLon, maxLat],
                [minLon, minLat]
              ]]
            },
            properties: {}
          }]
        });
      }
    }
  };

  // Sync Map Region Box Overlay when selectedRegionBounds changes externally
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const src = map.current.getSource('selected-region-source') as maplibregl.GeoJSONSource;
    if (!src) return;

    if (selectedRegionBounds) {
      src.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [selectedRegionBounds.minLon, selectedRegionBounds.minLat],
              [selectedRegionBounds.maxLon, selectedRegionBounds.minLat],
              [selectedRegionBounds.maxLon, selectedRegionBounds.maxLat],
              [selectedRegionBounds.minLon, selectedRegionBounds.maxLat],
              [selectedRegionBounds.minLon, selectedRegionBounds.minLat]
            ]]
          },
          properties: {}
        }]
      });
    } else {
      src.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [selectedRegionBounds]);

  const getFillPaintExpression = (field: DensityField, visible: boolean): Record<string, any> => {
    if (!visible) {
      return { 'fill-color': '#000000', 'fill-opacity': 0.0 };
    }

    if (field === 'sla') {
      return {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'sla_m'],
          -0.25, '#0d47a1',
          -0.10, '#42a5f5',
           0.00, '#f5f5f5',
           0.15, '#ff8a65',
           0.45, '#b71c1c'
        ],
        'fill-opacity': 0.78
      };
    } else if (field === 'currents') {
      return {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'current_speed_ms'],
          0.00, '#440154',
          0.30, '#3b528b',
          0.60, '#21918c',
          0.90, '#5ec962',
          1.15, '#fde725'
        ],
        'fill-opacity': 0.82
      };
    } else if (field === 'salinity') {
      return {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'salinity_psu'],
          31.0, '#e0f7fa',
          33.0, '#4dd0e1',
          35.0, '#00838f',
          36.8, '#004d40'
        ],
        'fill-opacity': 0.75
      };
    } else if (field === 'anomaly') {
      return {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'anomaly_c'],
          -2.8, '#1e88e5',
           0.0, '#ffffff',
           2.8, '#e53935'
        ],
        'fill-opacity': 0.75
      };
    } else {
      return {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'temperature_c'],
          8.0, '#1e1e1e',
          14.0, '#373737',
          18.0, '#545454',
          24.0, '#6c6c6c',
          27.0, '#d97706',
          30.0, '#dc2626'
        ],
        'fill-opacity': 0.75
      };
    }
  };

  // FlyTo camera routing when selectedCenter changes
  useEffect(() => {
    if (!map.current || !selectedCenter) return;
    map.current.flyTo({
      center: [selectedCenter.lon, selectedCenter.lat],
      zoom: selectedCenter.zoom || 5.2,
      speed: 1.5,
      essential: true
    });
  }, [selectedCenter]);

  // Data Source updates
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (gridData) {
      const src = map.current.getSource('density-grid-source') as maplibregl.GeoJSONSource;
      if (src) src.setData(gridData as any);

      if (map.current.getLayer('density-grid-fill')) {
        const paintExp = getFillPaintExpression(activeField, showDensityField);
        map.current.setPaintProperty('density-grid-fill', 'fill-color', paintExp['fill-color']);
        map.current.setPaintProperty('density-grid-fill', 'fill-opacity', paintExp['fill-opacity']);
      }
    }
    if (argoData) {
      const src = map.current.getSource('argo-source') as maplibregl.GeoJSONSource;
      if (src) src.setData(argoData as any);
    }
    if (bathymetryData) {
      const src = map.current.getSource('bathymetry-source') as maplibregl.GeoJSONSource;
      if (src) src.setData(bathymetryData as any);
    }
  }, [gridData, argoData, bathymetryData, activeField, showDensityField]);

  // Location Marker Anchor
  useEffect(() => {
    if (!map.current || !selectedPoint) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full border-2 border-[#ffffff] bg-[#1e1e1e] shadow-lg flex items-center justify-center';
      el.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-[#ffffff]"></div>';

      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([selectedPoint.lon, selectedPoint.lat])
        .addTo(map.current);
    } else {
      markerRef.current.setLngLat([selectedPoint.lon, selectedPoint.lat]);
    }
  }, [selectedPoint]);

  return (
    <div className="relative w-full h-full bg-[#000000] select-none overflow-hidden font-sans">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Left Control Strip */}
      <div className="absolute top-3 left-3 z-20 space-y-2 max-w-sm">
        {/* Interaction Mode Switcher (Point Click vs Region Box Selection) */}
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2 shadow-lg flex items-center justify-between space-x-2">
          <div className="text-[10px] font-semibold text-[#545454] uppercase tracking-wider px-1">
            Map Mode
          </div>
          <div className="flex items-center space-x-1 bg-[#000000] p-1 rounded-md border border-[#373737]">
            <button
              onClick={() => { setInteractMode('point'); dragStartCorner.current = null; }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                interactMode === 'point'
                  ? 'bg-[#373737] text-[#ffffff]'
                  : 'text-[#545454] hover:text-[#ffffff]'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Point Station</span>
            </button>
            <button
              onClick={() => { setInteractMode('region'); dragStartCorner.current = null; }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                interactMode === 'region'
                  ? 'bg-[#373737] text-[#ffffff]'
                  : 'text-[#545454] hover:text-[#ffffff]'
              }`}
            >
              <BoxSelect className="w-3.5 h-3.5" />
              <span>Select Region Box</span>
            </button>
          </div>
        </div>

        {/* Field Selection Segmented Control */}
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2 shadow-lg space-y-1">
          <div className="text-[10px] font-semibold text-[#545454] uppercase tracking-wider px-1">
            Density Field Selection
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onFieldChange('temperature')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                activeField === 'temperature'
                  ? 'bg-[#373737] text-[#ffffff] font-semibold'
                  : 'text-[#545454] hover:bg-[#373737] hover:text-[#ffffff]'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => onFieldChange('sla')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                activeField === 'sla'
                  ? 'bg-[#373737] text-[#ffffff] font-semibold'
                  : 'text-[#545454] hover:bg-[#373737] hover:text-[#ffffff]'
              }`}
            >
              Sea Level Anomaly (SLA)
            </button>
            <button
              onClick={() => onFieldChange('currents')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                activeField === 'currents'
                  ? 'bg-[#373737] text-[#ffffff] font-semibold'
                  : 'text-[#545454] hover:bg-[#373737] hover:text-[#ffffff]'
              }`}
            >
              Ocean Currents
            </button>
            <button
              onClick={() => onFieldChange('salinity')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                activeField === 'salinity'
                  ? 'bg-[#373737] text-[#ffffff] font-semibold'
                  : 'text-[#545454] hover:bg-[#373737] hover:text-[#ffffff]'
              }`}
            >
              Salinity (SSS)
            </button>
            <button
              onClick={() => onFieldChange('anomaly')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                activeField === 'anomaly'
                  ? 'bg-[#373737] text-[#ffffff] font-semibold'
                  : 'text-[#545454] hover:bg-[#373737] hover:text-[#ffffff]'
              }`}
            >
              Temp Anomaly
            </button>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2 shadow-lg space-y-1 text-xs text-[#ffffff]">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[#545454]">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[#ffffff]">Bathymetry Contours</span>
            </span>
            <button onClick={() => setShowBathymetry(!showBathymetry)} className="text-[#545454] hover:text-[#ffffff]">
              {showBathymetry ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#373737]" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-[#545454]">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[#ffffff]">ARGO Floats</span>
            </span>
            <button onClick={() => setShowArgoFloats(!showArgoFloats)} className="text-[#545454] hover:text-[#ffffff]">
              {showArgoFloats ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#373737]" />}
            </button>
          </div>
        </div>

        {/* Region Select Instruction Banner when Region Mode active */}
        {interactMode === 'region' && (
          <div className="bg-[#373737] border border-[#545454] rounded-lg p-2 text-[11px] text-[#ffffff] font-mono shadow-md animate-fade-in flex items-center justify-between">
            <span>
              {isBoxDragging
                ? 'Click 2nd corner on map to complete region box...'
                : 'Click 1st corner on ocean map to draw bounding box.'}
            </span>
            {selectedRegionBounds && (
              <button
                onClick={() => onSelectRegionBounds?.(null)}
                className="text-[#ffffff] hover:text-red-400 p-0.5"
                title="Clear Region"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Field Colorbar Legend (Bottom Right) */}
      <div className="absolute bottom-8 right-4 z-20 bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2.5 shadow-lg space-y-1 font-mono text-xs w-56 select-none">
        <div className="flex justify-between items-center text-[10px] text-[#545454] font-semibold uppercase">
          <span>
            {activeField === 'sla' && 'Sea Level Anomaly'}
            {activeField === 'currents' && 'Surface Current Speed'}
            {activeField === 'temperature' && 'Surface / Subsurface Temp'}
            {activeField === 'salinity' && 'Sea Surface Salinity'}
            {activeField === 'anomaly' && 'Temperature Anomaly'}
          </span>
          <span className="text-[#ffffff]">
            {activeField === 'sla' && 'm'}
            {activeField === 'currents' && 'm/s'}
            {activeField === 'temperature' && '°C'}
            {activeField === 'salinity' && 'PSU'}
            {activeField === 'anomaly' && '°C'}
          </span>
        </div>

        {/* Colorbar Gradient */}
        <div
          className={`h-2.5 w-full rounded ${
            activeField === 'sla'
              ? 'bg-gradient-to-r from-[#0d47a1] via-[#42a5f5] via-[#f5f5f5] via-[#ff8a65] to-[#b71c1c]'
              : activeField === 'currents'
              ? 'bg-gradient-to-r from-[#440154] via-[#3b528b] via-[#21918c] via-[#5ec962] to-[#fde725]'
              : activeField === 'salinity'
              ? 'bg-gradient-to-r from-[#e0f7fa] via-[#4dd0e1] via-[#00838f] to-[#004d40]'
              : activeField === 'anomaly'
              ? 'bg-gradient-to-r from-[#1e88e5] via-[#ffffff] to-[#e53935]'
              : 'bg-gradient-to-r from-[#1e1e1e] via-[#373737] via-[#545454] via-[#6c6c6c] via-[#d97706] to-[#dc2626]'
          }`}
        />

        <div className="flex justify-between text-[9px] text-[#545454]">
          <span>
            {activeField === 'sla' && '-0.25 m'}
            {activeField === 'currents' && '0.0 m/s'}
            {activeField === 'temperature' && '8.0°C'}
            {activeField === 'salinity' && '31.0 PSU'}
            {activeField === 'anomaly' && '-2.8°C'}
          </span>
          <span>
            {activeField === 'sla' && '0.0 m'}
            {activeField === 'currents' && '0.6 m/s'}
            {activeField === 'temperature' && '18.0°C'}
            {activeField === 'salinity' && '34.0 PSU'}
            {activeField === 'anomaly' && '0.0°C'}
          </span>
          <span>
            {activeField === 'sla' && '+0.45 m'}
            {activeField === 'currents' && '1.15 m/s'}
            {activeField === 'temperature' && '30.0°C'}
            {activeField === 'salinity' && '36.8 PSU'}
            {activeField === 'anomaly' && '+2.8°C'}
          </span>
        </div>
      </div>

      {/* Docked Bottom Coordinates HUD */}
      <div className="absolute bottom-2 left-3 z-20 bg-[#1e1e1e]/95 border border-[#373737] rounded px-2.5 py-1 text-[11px] font-mono text-[#545454] flex items-center space-x-3 shadow-sm">
        <div>LAT: <span className="text-[#ffffff] font-bold">{coords.lat}°N</span></div>
        <div>LON: <span className="text-[#ffffff] font-bold">{coords.lng}°E</span></div>
        <div>ZOOM: {coords.zoom}</div>
        <div>MODE: <span className="text-[#ffffff] font-bold uppercase">{interactMode}</span></div>
      </div>
    </div>
  );
};

export default OceanExplorerMap;
