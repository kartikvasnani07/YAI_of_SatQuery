// frontend/src/components/OceanCurrentsTidesView.tsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Wind, Play, Pause, Compass, Layers, Eye, EyeOff, Sparkles, Navigation } from 'lucide-react';

interface OceanCurrentsTidesViewProps {
  selectedDate: string;
}

// Major Global Ocean Current Streamline Trajectories
const CURRENT_STREAMLINES = [
  {
    id: 'north_equatorial',
    name: 'North Equatorial Current',
    coords: [[-20.0, 15.0], [-32.0, 16.0], [-48.0, 15.5], [-62.0, 14.0]],
    speed: '0.85 m/s (1.65 knots)',
    transport: '28 Sv',
    temp: '27.8°C'
  },
  {
    id: 'north_brazil',
    name: 'North Brazil Current',
    coords: [[-38.0, -5.0], [-44.0, -1.0], [-48.0, 3.0], [-56.0, 8.5], [-62.0, 11.5]],
    speed: '1.25 m/s (2.43 knots)',
    transport: '35 Sv',
    temp: '28.5°C'
  },
  {
    id: 'necc',
    name: 'NECC (Equatorial Countercurrent)',
    coords: [[-46.0, 4.0], [-34.0, 5.0], [-22.0, 4.5], [-16.0, 4.0]],
    speed: '0.95 m/s (1.85 knots)',
    transport: '22 Sv',
    temp: '28.2°C'
  },
  {
    id: 'guinea_current',
    name: 'Guinea Current (GC)',
    coords: [[-16.0, 4.0], [-10.0, 5.5], [-4.0, 5.0], [4.0, 3.0]],
    speed: '0.70 m/s (1.36 knots)',
    transport: '15 Sv',
    temp: '27.5°C'
  },
  {
    id: 'south_equatorial',
    name: 'Southern South Equatorial Current',
    coords: [[-5.0, -15.0], [-20.0, -14.0], [-35.0, -12.0], [-40.0, -10.0]],
    speed: '0.75 m/s (1.46 knots)',
    transport: '26 Sv',
    temp: '26.4°C'
  },
  {
    id: 'brazil_current',
    name: 'Brazil Current',
    coords: [[-40.0, -12.0], [-42.0, -20.0], [-46.0, -28.0], [-50.0, -34.0]],
    speed: '0.90 m/s (1.75 knots)',
    transport: '18 Sv',
    temp: '24.1°C'
  },
  {
    id: 'bcc_current',
    name: 'Brazil Coastal Current (BCC)',
    coords: [[-46.0, -28.0], [-48.5, -31.5], [-50.5, -34.0]],
    speed: '0.65 m/s (1.26 knots)',
    transport: '12 Sv',
    temp: '21.0°C'
  },
  {
    id: 'malvinas_current',
    name: 'Malvinas (Falkland) Current',
    coords: [[-64.0, -53.0], [-60.0, -48.0], [-56.0, -42.0], [-53.0, -38.0]],
    speed: '1.10 m/s (2.14 knots)',
    transport: '40 Sv',
    temp: '8.5°C'
  },
  {
    id: 'bmc_confluence',
    name: 'Brazil-Malvinas Confluence (BMC)',
    coords: [[-53.0, -38.0], [-46.0, -38.5], [-38.0, -39.0], [-25.0, -40.0]],
    speed: '1.45 m/s (2.82 knots)',
    transport: '70 Sv',
    temp: '16.2°C'
  },
  {
    id: 'gulf_stream',
    name: 'Gulf Stream Jet',
    coords: [[-80.0, 26.0], [-75.0, 33.0], [-68.0, 38.0], [-50.0, 42.0], [-30.0, 46.0]],
    speed: '1.85 m/s (3.60 knots)',
    transport: '85 Sv',
    temp: '27.4°C'
  },
  {
    id: 'kuroshio_jet',
    name: 'Kuroshio Jet',
    coords: [[122.0, 22.0], [128.0, 28.0], [136.0, 34.0], [148.0, 37.0]],
    speed: '1.70 m/s (3.30 knots)',
    transport: '55 Sv',
    temp: '26.8°C'
  },
  {
    id: 'agulhas_current',
    name: 'Agulhas Retroflection',
    coords: [[38.0, -26.0], [32.0, -32.0], [24.0, -37.0], [16.0, -38.0]],
    speed: '1.55 m/s (3.01 knots)',
    transport: '78 Sv',
    temp: '23.5°C'
  }
];

// Oceanographic Observation Station Nodes
const STATIONS = [
  { id: 'GGC5 / ODP 1063', name: 'GGC5 / ODP 1063 (Bermuda Rise)', lon: -57.6, lat: 33.7, depth: '4580m', type: 'ODP Deep Core' },
  { id: 'SU8118', name: 'SU8118 (Iberian Margin)', lon: -10.2, lat: 37.8, depth: '3450m', type: 'Deep Station' },
  { id: 'VM12-107', name: 'VM12-107 (Guiana Basin)', lon: -62.4, lat: 11.2, depth: '2100m', type: 'Sediment Core' },
  { id: 'M78/1-235-1', name: 'M78/1-235-1 (Demerara Rise)', lon: -54.2, lat: 8.5, depth: '2450m', type: 'R/V Meteor Core' },
  { id: 'GeoB16224-1', name: 'GeoB16224-1 (Equatorial Atlantic)', lon: -46.5, lat: 4.8, depth: '1980m', type: 'Piston Core' },
  { id: 'GeoB9508-5', name: 'GeoB9508-5 (NW Africa Coast)', lon: -18.2, lat: 15.5, depth: '3120m', type: 'Gravity Core' },
  { id: 'GeoB9526-5', name: 'GeoB9526-5 (Cape Verde Basin)', lon: -18.8, lat: 12.4, depth: '2840m', type: 'Gravity Core' },
  { id: 'GeoB3129-3911', name: 'GeoB3129-3911 (Ceara Rise)', lon: -38.5, lat: -3.8, depth: '1850m', type: 'CMEMS Station' },
  { id: 'M125-35-3', name: 'M125-35-3 (Brazil Shelf)', lon: -44.2, lat: -23.1, depth: '2410m', type: 'Meteor Diamond Core' },
  { id: '36GGC', name: '36GGC (Santos Basin)', lon: -46.8, lat: -27.5, depth: '1890m', type: 'Piston Core' },
  { id: 'BCC Station', name: 'BCC Zone Node', lon: -48.6, lat: -30.0, depth: '1420m', type: 'Coastal Station' },
  { id: 'GeoB6211-2', name: 'GeoB6211-2 (Argentine Basin)', lon: -50.2, lat: -32.5, depth: '1620m', type: 'Deep Core' }
];

// Precise Land Masking Function to keep particles 100% inside ocean water boundaries
function isLandCoordinate(lon: number, lat: number): boolean {
  let nLon = lon;
  while (nLon > 180) nLon -= 360;
  while (nLon < -180) nLon += 360;

  // Antarctica continental ice sheet
  if (lat < -62) return true;
  // Greenland
  if (lat > 60 && lat < 83 && nLon > -73 && nLon < -12) return true;
  // North America
  if (lat > 15 && lat < 72 && nLon > -168 && nLon < -52) {
    if (lat < 28 && nLon < -85) return true;
    if (lat >= 28 && nLon < -76) return true;
  }
  // South America
  if (lat > -56 && lat < 12 && nLon > -82 && nLon < -35) {
    if (lat < -40 || nLon < -42) return true;
  }
  // Eurasia (Europe + Asia)
  if (lat > 8 && lat < 78 && nLon > -10 && nLon < 180) {
    if (lat > 30 && lat < 45 && nLon > 0 && nLon < 35) return false; // Mediterranean
    if (lat > 10 && lat < 30 && nLon > 38 && nLon < 75) return false; // Arabian Sea / Red Sea / Persian Gulf
    if (lat > 35 && nLon > 10 && nLon < 145) return true;
    if (lat > 8 && lat <= 35 && nLon > 68 && nLon < 140) return true;
  }
  // Africa
  if (lat > -35 && lat < 37 && nLon > -18 && nLon < 52) {
    if (lat > 12 && lat < 30 && nLon > 32 && nLon < 43) return false; // Red Sea
    return true;
  }
  // Australia
  if (lat > -44 && lat < -10 && nLon > 112 && nLon < 154) return true;

  return false;
}

// Global Ocean Velocity Field Physics Model (U, V components in m/s)
function getOceanVelocity(lon: number, lat: number): { u: number; v: number; speed: number; temp: number } {
  let nLon = lon;
  while (nLon > 180) nLon -= 360;
  while (nLon < -180) nLon += 360;

  let u = 0;
  let v = 0;

  // Antarctic Circumpolar Current (ACC)
  if (lat < -42 && lat > -62) {
    u += 0.95 + 0.3 * Math.sin(nLon * 0.08);
    v += 0.15 * Math.cos(nLon * 0.12);
  }

  // North Atlantic Circulation
  if (lat >= 5 && lat <= 65 && nLon >= -95 && nLon <= 15) {
    // Gulf Stream Jet
    if (lat >= 24 && lat <= 45 && nLon >= -82 && nLon <= -35) {
      const gsDist = Math.abs(lat - (25 + (nLon + 80) * 0.32));
      const gsIntensity = Math.exp(-Math.pow(gsDist / 3.5, 2));
      u += 1.8 * gsIntensity + 0.3;
      v += 1.2 * gsIntensity;
    }
    // North Equatorial Current (Westward)
    if (lat >= 10 && lat <= 20) {
      u -= 0.75;
      v -= 0.05;
    }
    // Equatorial Countercurrent (Eastward)
    if (lat >= 2 && lat < 9 && nLon >= -55 && nLon <= -10) {
      u += 0.85;
      v += 0.08;
    }
  }

  // South Atlantic & Brazil-Malvinas Confluence
  if (lat >= -58 && lat < 5 && nLon >= -70 && nLon <= 20) {
    // North Brazil Current
    if (lat >= -10 && lat <= 12 && nLon >= -58 && nLon <= -35) {
      u -= 0.85;
      v += 0.95;
    }
    // Brazil Current (Southward)
    if (lat >= -38 && lat <= -10 && nLon >= -52 && nLon <= -34) {
      u -= 0.25;
      v -= 0.85;
    }
    // Malvinas Current (Northward)
    if (lat >= -56 && lat <= -36 && nLon >= -68 && nLon <= -48) {
      u += 0.35;
      v += 1.15;
    }
    // South Equatorial Current (Westward)
    if (lat >= -22 && lat <= -6) {
      u -= 0.72;
    }
  }

  // Pacific Ocean Circulation & Kuroshio
  if (lat >= -40 && lat <= 60 && (nLon >= 100 || nLon <= -100)) {
    // Kuroshio Jet (Japan / Taiwan)
    if (lat >= 15 && lat <= 44 && nLon >= 118 && nLon <= 155) {
      const kDist = Math.abs(nLon - (122 + (lat - 15) * 0.85));
      const kIntensity = Math.exp(-Math.pow(kDist / 4.0, 2));
      u += 1.4 * kIntensity + 0.2;
      v += 1.6 * kIntensity;
    }
    // Pacific North Equatorial Current
    if (lat >= 8 && lat <= 22) {
      u -= 0.82;
    }
  }

  // Indian Ocean & Somali Monsoonal Current
  if (lat >= -40 && lat <= 25 && nLon >= 35 && nLon <= 110) {
    // Somali Current
    if (lat >= -4 && lat <= 18 && nLon >= 40 && nLon <= 62) {
      u += 0.95;
      v += 1.45;
    }
    // Agulhas Current (SE Africa)
    if (lat >= -42 && lat <= -25 && nLon >= 15 && nLon <= 42) {
      u -= 0.95;
      v -= 1.25;
    }
  }

  // Turbulent Eddies & Ocean Gyres
  u += 0.22 * Math.sin(lat * 0.18 + nLon * 0.12) * Math.cos(nLon * 0.14);
  v += 0.22 * Math.cos(lat * 0.15 - nLon * 0.11) * Math.sin(lat * 0.18);

  const speed = Math.sqrt(u * u + v * v);
  let temp = 28.5 * Math.cos(lat * (Math.PI / 180));
  if (lat < -40) temp = Math.max(1.0, 12.0 + (lat + 40) * 0.4);
  if (lat > 50) temp = Math.max(-1.5, 14.0 - (lat - 50) * 0.4);

  return { u, v, speed, temp };
}

// Particle Structure
interface FlowParticle {
  lon: number;
  lat: number;
  age: number;
  maxAge: number;
  prevX: number | null;
  prevY: number | null;
}

// Random Valid Ocean Point Generator
function getRandomOceanPoint(): { lon: number; lat: number } {
  let lon = 0;
  let lat = 0;
  let attempts = 0;
  do {
    lon = (Math.random() * 360) - 180;
    lat = (Math.random() * 120) - 60;
    attempts++;
  } while (isLandCoordinate(lon, lat) && attempts < 50);
  return { lon, lat };
}

export const OceanCurrentsTidesView: React.FC<OceanCurrentsTidesViewProps> = ({ selectedDate }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(2);
  const [particleDensity, setParticleDensity] = useState<number>(3000);
  const [colorMode, setColorMode] = useState<'speed' | 'temp'>('speed');
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [inspectorData, setInspectorData] = useState<any>(CURRENT_STREAMLINES[0]);

  const particlesRef = useRef<FlowParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize MapLibre GL Base Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-30.0, 5.0],
      zoom: 3.2,
      pitch: 0,
      bearing: 0
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

    mapInstance.on('load', () => {
      // Streamlines Layer
      const lineFeatures = CURRENT_STREAMLINES.map((stream) => ({
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: stream.coords },
        properties: { id: stream.id, name: stream.name, speed: stream.speed, transport: stream.transport, temp: stream.temp }
      }));

      mapInstance.addSource('current-streamlines-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: lineFeatures }
      });

      // Streamline Glow Line
      mapInstance.addLayer({
        id: 'current-streamlines-glow',
        type: 'line',
        source: 'current-streamlines-source',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 3.5,
          'line-opacity': showStreamlines ? 0.85 : 0.0
        }
      });

      // Streamline Text Labels
      mapInstance.addLayer({
        id: 'current-streamlines-labels',
        type: 'symbol',
        source: 'current-streamlines-source',
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-letter-spacing': 0.05,
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2.0
        }
      });

      // Oceanographic Observation Stations Layer
      const stationFeatures = STATIONS.map((st) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [st.lon, st.lat] },
        properties: { id: st.id, name: st.name, depth: st.depth, type: st.type }
      }));

      mapInstance.addSource('stations-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: stationFeatures }
      });

      mapInstance.addLayer({
        id: 'stations-circles',
        type: 'circle',
        source: 'stations-source',
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': 5.5,
          'circle-stroke-width': 2.0,
          'circle-stroke-color': '#000000',
          'circle-opacity': showStations ? 1.0 : 0.0
        }
      });

      mapInstance.addLayer({
        id: 'stations-labels',
        type: 'symbol',
        source: 'stations-source',
        layout: {
          'text-field': ['get', 'id'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5
        }
      });

      // Click Map Inspector
      mapInstance.on('click', (e) => {
        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [e.point.x - 5, e.point.y - 5],
          [e.point.x + 5, e.point.y + 5]
        ];
        const stationFeats = mapInstance.queryRenderedFeatures(bbox, { layers: ['stations-circles'] });
        if (stationFeats && stationFeats.length > 0) {
          const props = stationFeats[0].properties;
          setInspectorData({
            name: props.name,
            speed: 'Observation Station Node',
            transport: props.depth,
            temp: props.type,
            type: 'Core Observation Site'
          });
          return;
        }

        const lon = e.lngLat.lng;
        const lat = e.lngLat.lat;
        const vec = getOceanVelocity(lon, lat);
        const headingDeg = Math.round((Math.atan2(vec.v, vec.u) * (180 / Math.PI) + 360) % 360);
        const knots = (vec.speed * 1.94384).toFixed(2);

        setInspectorData({
          name: `Point Inspector [${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E]`,
          speed: `${vec.speed.toFixed(2)} m/s (${knots} knots)`,
          transport: `Direction ${headingDeg}°`,
          temp: `${vec.temp.toFixed(1)}°C`,
          type: 'Live Vector Field Point'
        });
      });
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Spawn Valid Ocean Particles
  useEffect(() => {
    const particles: FlowParticle[] = [];
    for (let i = 0; i < particleDensity; i++) {
      const pt = getRandomOceanPoint();
      particles.push({
        lon: pt.lon,
        lat: pt.lat,
        age: Math.floor(Math.random() * 80),
        maxAge: 60 + Math.floor(Math.random() * 80),
        prevX: null,
        prevY: null
      });
    }
    particlesRef.current = particles;
  }, [particleDensity]);

  // Canvas Particle Flow Animation (Transparent Overlay - Keeps Dark Map 100% Crisp!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      // Clear canvas each frame so MapLibre base map underneath is ALWAYS 100% visible!
      ctx.clearRect(0, 0, width, height);

      if (!isPlaying || !showParticles || !map.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const m = map.current;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Check if particle entered land -> Immediate Respawn in Ocean!
        if (isLandCoordinate(p.lon, p.lat)) {
          const newPt = getRandomOceanPoint();
          p.lon = newPt.lon;
          p.lat = newPt.lat;
          p.age = 0;
          p.prevX = null;
          p.prevY = null;
          continue;
        }

        const screenPt = m.project([p.lon, p.lat]);

        if (
          screenPt.x < 0 ||
          screenPt.x > width ||
          screenPt.y < 0 ||
          screenPt.y > height ||
          p.age >= p.maxAge
        ) {
          const newPt = getRandomOceanPoint();
          p.lon = newPt.lon;
          p.lat = newPt.lat;
          p.age = 0;
          p.prevX = null;
          p.prevY = null;
          continue;
        }

        const vec = getOceanVelocity(p.lon, p.lat);
        const dt = 0.05 * animSpeed;
        p.lon += vec.u * dt;
        p.lat += vec.v * dt;
        p.age++;

        // Draw dynamic glowing particle vector stroke
        ctx.beginPath();
        if (p.prevX !== null && p.prevY !== null) {
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(screenPt.x, screenPt.y);
        } else {
          ctx.arc(screenPt.x, screenPt.y, 1.2, 0, Math.PI * 2);
        }

        if (colorMode === 'speed') {
          const spd = vec.speed;
          if (spd > 1.8) {
            ctx.strokeStyle = '#ef4444';
          } else if (spd > 1.2) {
            ctx.strokeStyle = '#f59e0b';
          } else if (spd > 0.7) {
            ctx.strokeStyle = '#34d399';
          } else {
            ctx.strokeStyle = '#38bdf8';
          }
        } else {
          const t = vec.temp;
          if (t > 24) {
            ctx.strokeStyle = '#ef4444';
          } else if (t > 15) {
            ctx.strokeStyle = '#f59e0b';
          } else if (t > 5) {
            ctx.strokeStyle = '#34d399';
          } else {
            ctx.strokeStyle = '#0284c7';
          }
        }

        ctx.lineWidth = Math.min(2.5, 1.2 + vec.speed * 0.5);
        ctx.stroke();

        p.prevX = screenPt.x;
        p.prevY = screenPt.y;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, showParticles, animSpeed, particleDensity, colorMode]);

  // Toggle Streamlines Visibility
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    if (map.current.getLayer('current-streamlines-glow')) {
      map.current.setPaintProperty('current-streamlines-glow', 'line-opacity', showStreamlines ? 0.85 : 0.0);
    }
  }, [showStreamlines]);

  // Toggle Stations Visibility
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    if (map.current.getLayer('stations-circles')) {
      map.current.setPaintProperty('stations-circles', 'circle-opacity', showStations ? 1.0 : 0.0);
    }
  }, [showStations]);

  return (
    <div className="relative w-full h-full bg-[#000000] select-none overflow-hidden font-sans text-[#ffffff]">
      {/* Base Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Transparent Canvas Particle Overlay */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 w-full h-full" />

      {/* Top Left Floating Controls */}
      <div className="absolute top-4 left-4 z-20 space-y-2 max-w-xs text-xs">
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#373737] pb-2">
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-[#38bdf8]" />
              <h2 className="text-sm font-bold text-[#ffffff]">Global Particle Current Field</h2>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded bg-[#000000] border border-[#373737] hover:bg-[#373737] text-[#ffffff] transition-all"
              title={isPlaying ? "Pause Flow Animation" : "Play Flow Animation"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#34d399]" /> : <Play className="w-3.5 h-3.5 text-[#38bdf8]" />}
            </button>
          </div>

          {/* Flow Velocity Speed */}
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#9ca3af]">FLOW VELOCITY SPEED:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setAnimSpeed(sp)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                    animSpeed === sp ? 'bg-[#38bdf8] text-[#000000] border-[#38bdf8]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          {/* Particle Density */}
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#9ca3af]">PARTICLE DENSITY:</span>
            <div className="flex items-center space-x-1">
              {[
                { label: 'Low', val: 1500 },
                { label: 'Dense', val: 3000 },
                { label: 'Ultra', val: 5000 }
              ].map((d) => (
                <button
                  key={d.val}
                  onClick={() => setParticleDensity(d.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                    particleDensity === d.val ? 'bg-[#34d399] text-[#000000] border-[#34d399]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Mode */}
          <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-[#373737]">
            <span className="text-[#9ca3af]">PARTICLE COLORING:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setColorMode('speed')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                  colorMode === 'speed' ? 'bg-[#f59e0b] text-[#000000] border-[#f59e0b]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                }`}
              >
                Speed (m/s)
              </button>
              <button
                onClick={() => setColorMode('temp')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                  colorMode === 'temp' ? 'bg-[#38bdf8] text-[#000000] border-[#38bdf8]' : 'bg-[#000000] text-[#9ca3af] border-[#373737]'
                }`}
              >
                SST (°C)
              </button>
            </div>
          </div>

          {/* Layer Visibility */}
          <div className="space-y-1.5 pt-1.5 border-t border-[#373737] text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-[#9ca3af]">
                <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                <span className="text-[#ffffff]">Real-Time Flow Particles</span>
              </span>
              <button onClick={() => setShowParticles(!showParticles)} className="text-[#9ca3af] hover:text-[#ffffff]">
                {showParticles ? <Eye className="w-3.5 h-3.5 text-[#34d399]" /> : <EyeOff className="w-3.5 h-3.5 text-[#545454]" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-[#9ca3af]">
                <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[#ffffff]">Main Streamlines</span>
              </span>
              <button onClick={() => setShowStreamlines(!showStreamlines)} className="text-[#9ca3af] hover:text-[#ffffff]">
                {showStreamlines ? <Eye className="w-3.5 h-3.5 text-[#34d399]" /> : <EyeOff className="w-3.5 h-3.5 text-[#545454]" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-[#9ca3af]">
                <Navigation className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[#ffffff]">Observation Core Stations</span>
              </span>
              <button onClick={() => setShowStations(!showStations)} className="text-[#9ca3af] hover:text-[#ffffff]">
                {showStations ? <Eye className="w-3.5 h-3.5 text-[#34d399]" /> : <EyeOff className="w-3.5 h-3.5 text-[#545454]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Current / Point Inspector Card */}
        {inspectorData && (
          <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-2 font-mono animate-fade-in">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ffffff] border-b border-[#373737] pb-1.5">
              <Compass className="w-4 h-4 text-[#38bdf8]" />
              <span className="truncate">{inspectorData.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#000000] p-1.5 rounded border border-[#373737]">
                <div className="text-[#9ca3af]">SPEED / TYPE</div>
                <div className="font-bold text-[#ffffff] text-xs mt-0.5">{inspectorData.speed}</div>
              </div>
              <div className="bg-[#000000] p-1.5 rounded border border-[#373737]">
                <div className="text-[#9ca3af]">TRANSPORT / DEPTH</div>
                <div className="font-bold text-[#34d399] text-xs mt-0.5">{inspectorData.transport}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Flow Legend */}
      <div className="absolute bottom-8 right-4 z-20 bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-xl p-3 shadow-2xl space-y-1.5 font-mono text-xs w-64 select-none">
        <div className="flex justify-between items-center text-[10px] text-[#9ca3af] font-semibold uppercase">
          <span>{colorMode === 'speed' ? 'Current Velocity Speed' : 'Sea Surface Temperature'}</span>
          <span className="text-[#ffffff]">{colorMode === 'speed' ? 'm/s' : '°C'}</span>
        </div>

        {colorMode === 'speed' ? (
          <>
            <div className="h-3 w-full rounded bg-gradient-to-r from-[#38bdf8] via-[#34d399] via-[#f59e0b] to-[#ef4444]" />
            <div className="flex justify-between text-[9px] text-[#9ca3af]">
              <span>0.1 m/s (Slow)</span>
              <span>0.9 m/s</span>
              <span>2.0+ m/s (Fast Jet)</span>
            </div>
          </>
        ) : (
          <>
            <div className="h-3 w-full rounded bg-gradient-to-r from-[#0284c7] via-[#34d399] via-[#f59e0b] to-[#ef4444]" />
            <div className="flex justify-between text-[9px] text-[#9ca3af]">
              <span>-1.5°C (Polar)</span>
              <span>15.0°C</span>
              <span>28.5°C (Equator)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OceanCurrentsTidesView;
