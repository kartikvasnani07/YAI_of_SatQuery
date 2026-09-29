// frontend/src/components/OceanCurrentsTidesView.tsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Wind, Waves, Play, Pause, Compass, Activity } from 'lucide-react';

interface OceanCurrentsTidesViewProps {
  selectedDate: string;
}

const MAJOR_CURRENTS = [
  { name: 'Gulf Stream Jet', lat: 32.5, lon: -72.0, speed: '1.35 m/s', dir: 'NNE (35°)', temp: '27.4°C' },
  { name: 'Kuroshio Current', lat: 28.0, lon: 128.5, speed: '1.25 m/s', dir: 'NE (45°)', temp: '26.8°C' },
  { name: 'Agulhas Current', lat: -32.0, lon: 30.5, speed: '1.15 m/s', dir: 'SW (215°)', temp: '24.2°C' },
  { name: 'Somali Monsoonal Current', lat: 8.5, lon: 52.0, speed: '1.10 m/s', dir: 'NE (55°)', temp: '28.1°C' },
  { name: 'Antarctic Circumpolar Current', lat: -58.0, lon: 0.0, speed: '0.85 m/s', dir: 'E (90°)', temp: '2.1°C' },
  { name: 'East India Coastal Current (EICC)', lat: 16.5, lon: 84.0, speed: '0.95 m/s', dir: 'N (10°)', temp: '29.0°C' }
];

export const OceanCurrentsTidesView: React.FC<OceanCurrentsTidesViewProps> = ({ selectedDate }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [tidePhase, setTidePhase] = useState<'spring' | 'neap' | 'flood'>('spring');
  const [currentLayerDepth, setCurrentLayerDepth] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [inspectorPoint, setInspectorPoint] = useState<any>(MAJOR_CURRENTS[0]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [75.0, 10.0],
      zoom: 3.8,
      pitch: 0,
      bearing: 0
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      // Generate global ocean vector current grid
      const features: any[] = [];
      const step = 2.0;

      for (let lat = -65; lat <= 65; lat += step) {
        for (let lon = -180; lon <= 178; lon += step) {
          // Mask land
          if (lat > 8 && lat < 24 && lon > 72 && lon < 88) continue;
          if (lat > 25 && lat < 70 && lon > -130 && lon < -60) continue;

          const speed = Math.min(1.35, Math.max(0.12, 0.35 + 0.3 * Math.sin(lat * 0.15) * Math.cos(lon * 0.1)));
          const u = Number((speed * Math.cos(lat * 0.1)).toFixed(2));
          const v = Number((speed * Math.sin(lon * 0.1)).toFixed(2));

          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lon, lat] },
            properties: {
              speed,
              u,
              v,
              direction_deg: Math.round((Math.atan2(v, u) * 180 / Math.PI + 360) % 360),
              tide_amplitude_m: Number((1.2 + 0.6 * Math.sin(lon * 0.2)).toFixed(2))
            }
          });
        }
      }

      mapInstance.addSource('currents-vectors-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features }
      });

      mapInstance.addLayer({
        id: 'currents-vector-circles',
        type: 'circle',
        source: 'currents-vectors-source',
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'speed'],
            0.10, '#312e81',
            0.35, '#0284c7',
            0.70, '#10b981',
            1.00, '#f59e0b',
            1.30, '#ef4444'
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 6, 6.0],
          'circle-opacity': 0.85
        }
      });

      mapInstance.on('click', 'currents-vector-circles', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as any).coordinates;
        setInspectorPoint({
          name: `Current Vector (${coords[1].toFixed(1)}°N, ${coords[0].toFixed(1)}°E)`,
          lat: coords[1],
          lon: coords[0],
          speed: `${props.speed.toFixed(2)} m/s`,
          dir: `${props.direction_deg}°`,
          tide: `${props.tide_amplitude_m}m`
        });
      });
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#000000] select-none overflow-hidden font-sans text-[#ffffff]">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Left Control Box */}
      <div className="absolute top-4 left-4 z-20 space-y-2.5 max-w-sm text-xs">
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-[#373737] pb-2">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-[#38bdf8]" />
              <h2 className="text-sm font-bold text-[#ffffff]">Global Ocean Currents & Tides</h2>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded bg-[#000000] border border-[#373737] hover:bg-[#373737] text-[#ffffff] transition-all"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#34d399]" /> : <Play className="w-3.5 h-3.5 text-[#38bdf8]" />}
            </button>
          </div>

          {/* Tidal Phase Control */}
          <div className="space-y-1 font-mono">
            <div className="text-[10px] text-[#9ca3af] uppercase font-semibold">Tidal Dynamics Phase</div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setTidePhase('spring')}
                className={`py-1 text-[10px] font-bold rounded transition-all border ${
                  tidePhase === 'spring' ? 'bg-[#373737] text-[#ffffff] border-[#38bdf8]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                }`}
              >
                Spring Tide
              </button>
              <button
                onClick={() => setTidePhase('neap')}
                className={`py-1 text-[10px] font-bold rounded transition-all border ${
                  tidePhase === 'neap' ? 'bg-[#373737] text-[#ffffff] border-[#38bdf8]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                }`}
              >
                Neap Tide
              </button>
              <button
                onClick={() => setTidePhase('flood')}
                className={`py-1 text-[10px] font-bold rounded transition-all border ${
                  tidePhase === 'flood' ? 'bg-[#373737] text-[#ffffff] border-[#38bdf8]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                }`}
              >
                Flood Stream
              </button>
            </div>
          </div>

          {/* Depth Level Switcher */}
          <div className="space-y-1 font-mono pt-1 border-t border-[#373737]">
            <div className="text-[10px] text-[#9ca3af] uppercase font-semibold">Current Layer Depth</div>
            <div className="grid grid-cols-3 gap-1">
              {[0, 100, 500].map((d) => (
                <button
                  key={d}
                  onClick={() => setCurrentLayerDepth(d)}
                  className={`py-1 text-[10px] font-bold rounded transition-all border ${
                    currentLayerDepth === d ? 'bg-[#373737] text-[#ffffff] border-[#34d399]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                  }`}
                >
                  {d === 0 ? 'Surface (0m)' : `${d}m Layer`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vector Inspector Card */}
        {inspectorPoint && (
          <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-1.5 font-mono animate-fade-in">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ffffff]">
              <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{inspectorPoint.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="bg-[#000000] p-1.5 rounded border border-[#373737]">
                <div className="text-[#9ca3af]">FLOW VELOCITY</div>
                <div className="font-bold text-[#ffffff] text-xs">{inspectorPoint.speed}</div>
              </div>
              <div className="bg-[#000000] p-1.5 rounded border border-[#373737]">
                <div className="text-[#9ca3af]">HEADING DIR</div>
                <div className="font-bold text-[#ffffff] text-xs">{inspectorPoint.dir}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right Velocity Colorbar */}
      <div className="absolute bottom-8 right-4 z-20 bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-1 font-mono text-xs w-60 select-none">
        <div className="flex justify-between items-center text-[10px] text-[#9ca3af] font-semibold uppercase">
          <span>Ocean Current Velocity</span>
          <span className="text-[#ffffff]">m/s</span>
        </div>
        <div className="h-2.5 w-full rounded bg-gradient-to-r from-[#312e81] via-[#0284c7] via-[#10b981] via-[#f59e0b] to-[#ef4444]" />
        <div className="flex justify-between text-[9px] text-[#9ca3af]">
          <span>0.10 m/s</span>
          <span>0.50 m/s</span>
          <span>1.35 m/s</span>
        </div>
      </div>
    </div>
  );
};

export default OceanCurrentsTidesView;
