import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Layers, Info } from 'lucide-react';
import { GeoJSONLayer, Observation } from '../types';

interface MapCanvasProps {
  layers: GeoJSONLayer[];
  observation?: Observation;
  selectedObsId: string;
  location?: any;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  layers,
  observation,
  selectedObsId,
  location,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [coords, setCoords] = useState({ lat: 26.9124, lng: 75.7873, zoom: 12.0 });
  const [baseStyle, setBaseStyle] = useState<'dark' | 'satellite' | 'terrain'>('dark');

  useEffect(() => {
    if (!mapContainer.current) return;

    const styleUrl =
      baseStyle === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : baseStyle === 'satellite'
        ? {
            version: 8,
            sources: {
              'esri-satellite': {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256
              }
            },
            layers: [{ id: 'esri-satellite', type: 'raster', source: 'esri-satellite' }]
          }
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl as any,
      center: location?.center || [75.7873, 26.9124], // Jaipur / Target Location Center
      zoom: location?.zoom || 12.0,
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
      // Add vector GeoJSON layers
      layers.forEach((layer) => {
        if (layer.data && layer.data.type === 'FeatureCollection') {
          const sourceId = `source-${layer.id}`;
          if (!mapInstance.getSource(sourceId)) {
            mapInstance.addSource(sourceId, { type: 'geojson', data: layer.data });

            mapInstance.addLayer({
              id: `fill-${layer.id}`,
              type: 'fill',
              source: sourceId,
              paint: { 'fill-color': layer.color, 'fill-opacity': 0.45 }
            });

            mapInstance.addLayer({
              id: `line-${layer.id}`,
              type: 'line',
              source: sourceId,
              paint: { 'line-color': layer.color, 'line-width': 2.5 }
            });
          }
        }
      });
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
    };
  }, [baseStyle]);

  // Handle location teleporting and vector layer rendering
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (location && location.bbox) {
      const [minx, miny, maxx, maxy] = location.bbox;
      map.current.fitBounds(
        [[minx, miny], [maxx, maxy]],
        { padding: 40, maxZoom: location.zoom || 12.0, duration: 1500 }
      );
    } else if (location && location.center) {
      map.current.flyTo({
        center: [location.center[0], location.center[1]],
        zoom: location.zoom || 12.0,
        speed: 1.5,
        essential: true
      });
    }

    // Render vector and point dot density layers
    layers.forEach((layer) => {
      const sourceId = `source-${layer.id}`;
      const existingSource = map.current?.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (existingSource && layer.data) {
        existingSource.setData(layer.data);
      } else if (!existingSource && layer.data && layer.data.type === 'FeatureCollection') {
        map.current?.addSource(sourceId, { type: 'geojson', data: layer.data });

        const isPointLayer = layer.type === 'point' || (layer.data.features && layer.data.features[0]?.geometry?.type === 'Point');

        if (isPointLayer) {
          const circleId = `circle-${layer.id}`;
          map.current?.addLayer({
            id: circleId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-color': ['coalesce', ['get', 'color'], layer.color],
              'circle-radius': 7.0,
              'circle-stroke-width': 1.2,
              'circle-stroke-color': '#000000',
              'circle-opacity': 0.85
            }
          });

          // Hover Popup Event
          const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
          map.current?.on('mouseenter', circleId, (e) => {
            if (!map.current || !e.features || e.features.length === 0) return;
            map.current.getCanvas().style.cursor = 'pointer';
            const feature = e.features[0];
            const props = feature.properties || {};
            const coords = (feature.geometry as any).coordinates.slice();

            let popupHtml = `<div style="background:#1E1E1E; color:#FFFFFF; border:1px solid #373737; padding:8px 12px; border-radius:6px; font-family:monospace; font-size:11px; font-weight:bold;">`;
            if (props.people_per_km2) popupHtml += `<div>DENSITY: ${props.people_per_km2}</div><div>ZONE: ${props.zone_type}</div><div>DISTRICT: ${props.district}</div>`;
            else if (props.assay_ppm) popupHtml += `<div>MINERAL: ${props.mineral_type}</div><div>GRADE: ${props.grade}</div><div>ASSAY: ${props.assay_ppm}</div>`;
            else popupHtml += `<div>TYPE: ${props.level || 'Point Feature'}</div>`;
            popupHtml += `</div>`;

            popup.setLngLat(coords).setHTML(popupHtml).addTo(map.current);
          });

          map.current?.on('mouseleave', circleId, () => {
            if (!map.current) return;
            map.current.getCanvas().style.cursor = '';
            popup.remove();
          });
        } else {
          map.current?.addLayer({
            id: `fill-${layer.id}`,
            type: 'fill',
            source: sourceId,
            paint: { 'fill-color': layer.color, 'fill-opacity': 0.45 }
          });
          map.current?.addLayer({
            id: `line-${layer.id}`,
            type: 'line',
            source: sourceId,
            paint: { 'line-color': layer.color, 'line-width': 3.0 }
          });
        }
      }
    });
  }, [layers, location]);




  return (
    <div className="relative w-full h-full bg-[#000000] select-none overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Left Basemap Switcher */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 bg-[#1E1E1E] border border-[#373737] rounded p-1 shadow-md">
        <button
          onClick={() => setBaseStyle('dark')}
          className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all ${
            baseStyle === 'dark' ? 'bg-[#373737] text-white font-bold' : 'text-[#545454] hover:text-white'
          }`}
        >
          Dark Vector
        </button>
        <button
          onClick={() => setBaseStyle('satellite')}
          className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all ${
            baseStyle === 'satellite' ? 'bg-[#373737] text-white font-bold' : 'text-[#545454] hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setBaseStyle('terrain')}
          className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all ${
            baseStyle === 'terrain' ? 'bg-[#373737] text-white font-bold' : 'text-[#545454] hover:text-white'
          }`}
        >
          Topographic
        </button>
      </div>

      {/* Active Layers Legend Box */}
      {layers.length > 0 && (
        <div className="absolute top-12 left-3 z-20 bg-[#1E1E1E] border border-[#373737] rounded p-2.5 shadow-xl space-y-1.5 max-w-xs animate-fade-in">
          <div className="text-[10px] font-bold text-[#6C6C6C] uppercase tracking-wider flex items-center space-x-1 font-mono">
            <Info className="w-3 h-3 text-[#6C6C6C]" />
            <span>GIS Map Layers ({layers.length})</span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {layers.map((l) => (
              <div key={l.id} className="flex items-center space-x-2 text-[11px] text-slate-200">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                <span className="truncate">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Coordinates & Resolution HUD */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#1E1E1E] border border-[#373737] rounded px-3 py-1 text-[11px] font-mono text-[#6C6C6C] flex items-center space-x-4 shadow-md">
        <div><span className="text-[#545454]">LAT:</span> {coords.lat}°</div>
        <div><span className="text-[#545454]">LON:</span> {coords.lng}°</div>
        <div><span className="text-[#545454]">ZOOM:</span> {coords.zoom}</div>
        <div><span className="text-[#545454]">CRS:</span> EPSG:32643</div>
        <div><span className="text-[#545454]">RES:</span> {observation?.resolution_m || 10}m</div>
      </div>
    </div>
  );
};
