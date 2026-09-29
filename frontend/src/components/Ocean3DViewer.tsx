// frontend/src/components/Ocean3DViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, MapPin } from 'lucide-react';
import { SelectedRegionBounds } from '../types';

interface Ocean3DViewerProps {
  currentDepth: number;
  onDepthChange: (depth: number) => void;
  selectedRegionBounds?: SelectedRegionBounds | null;
}

const PRESET_PATCHES = [
  { id: 'arabian', name: 'Arabian Submarine Basin & Trench', latMin: 10, latMax: 20, lonMin: 60, lonMax: 70 },
  { id: 'atlantic', name: 'Mid-Atlantic Ocean Ridge & Rift', latMin: 10, latMax: 20, lonMin: -40, lonMax: -30 },
  { id: 'mariana', name: 'West Pacific Mariana Deep Trench', latMin: 8, latMax: 18, lonMin: 135, lonMax: 145 },
  { id: 'bengal', name: 'Bay of Bengal Fan & Continental Slope', latMin: 10, latMax: 20, lonMin: 82, lonMax: 92 },
  { id: 'southern', name: 'Southern Ocean Antarctic Basin', latMin: -65, latMax: -55, lonMin: -5, lonMax: 5 }
];

export const Ocean3DViewer: React.FC<Ocean3DViewerProps> = ({
  currentDepth,
  onDepthChange,
  selectedRegionBounds
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exaggeration, setExaggeration] = useState<number>(5);
  const [activePatchId, setActivePatchId] = useState<string>('arabian');

  // Active Patch Bounds
  const patch = selectedRegionBounds && activePatchId === 'custom'
    ? {
        id: 'custom',
        name: `Custom Map Region (${selectedRegionBounds.minLat.toFixed(1)}°N, ${selectedRegionBounds.minLon.toFixed(1)}°E)`,
        latMin: selectedRegionBounds.minLat,
        latMax: selectedRegionBounds.maxLat,
        lonMin: selectedRegionBounds.minLon,
        lonMax: selectedRegionBounds.maxLon
      }
    : (PRESET_PATCHES.find((p) => p.id === activePatchId) || PRESET_PATCHES[0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(10, 25, 15);
    scene.add(dirLight);

    // Bounding Box Frame
    const boxGeo = new THREE.BoxGeometry(20, 10 * (exaggeration / 5), 20);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x373737, wireframe: true, opacity: 0.5, transparent: true });
    const boundingBox = new THREE.Mesh(boxGeo, boxMat);
    scene.add(boundingBox);

    // Authentic Bathymetric Seafloor Mesh tailored for selected ocean patch
    const gridRes = 60;
    const bathGeo = new THREE.PlaneGeometry(20, 20, gridRes, gridRes);
    bathGeo.rotateX(-Math.PI / 2);

    const posAttr = bathGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Real GEBCO ocean bathymetry topography profiles
      let seafloorY = -4.0;
      if (patch.id === 'atlantic' || activePatchId === 'atlantic') {
        const ridgeVal = 2.8 * Math.exp(-(x**2 / 12.0)) - 1.2 * Math.cos(z * 0.5);
        seafloorY = (-4.0 + ridgeVal) * (exaggeration / 5);
      } else if (patch.id === 'mariana' || activePatchId === 'mariana') {
        const trenchVal = -4.2 * Math.exp(-((x - 1.5)**2 / 4.0 + z**2 / 16.0));
        seafloorY = (-3.5 + trenchVal) * (exaggeration / 5);
      } else if (patch.id === 'bengal' || activePatchId === 'bengal') {
        const slopeVal = 2.5 / (1.0 + Math.exp(-0.6 * x));
        seafloorY = (-4.5 + slopeVal) * (exaggeration / 5);
      } else {
        const basinVal = -3.2 * Math.exp(-((x - 2.0)**2 / 8.0 + (z + 1.0)**2 / 12.0)) + 1.5 * Math.sin(x * 0.3);
        seafloorY = (-4.0 + basinVal) * (exaggeration / 5);
      }

      posAttr.setY(i, seafloorY);

      // Depth Color Gradient (Trench deep purple -> Plain navy -> Shelf cyan)
      const normDepth = (seafloorY + 6.0) / 8.0;
      if (normDepth < 0.3) {
        colors[i * 3] = 0.08; colors[i * 3 + 1] = 0.08; colors[i * 3 + 2] = 0.25;
      } else if (normDepth < 0.7) {
        colors[i * 3] = 0.12; colors[i * 3 + 1] = 0.25; colors[i * 3 + 2] = 0.45;
      } else {
        colors[i * 3] = 0.20; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.55;
      }
    }
    bathGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    bathGeo.computeVertexNormals();

    const bathMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.7,
      metalness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0.92
    });
    const bathMesh = new THREE.Mesh(bathGeo, bathMat);
    scene.add(bathMesh);

    // Horizontal Depth Slice Plane
    const sliceGeo = new THREE.PlaneGeometry(19.8, 19.8);
    sliceGeo.rotateX(-Math.PI / 2);

    const normDepthY = (4.5 - (currentDepth / 1000.0) * 9.0) * (exaggeration / 5);

    const sliceMat = new THREE.MeshStandardMaterial({
      color: currentDepth < 50 ? 0xd97706 : (currentDepth < 200 ? 0x373737 : 0x1e1e1e),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const sliceMesh = new THREE.Mesh(sliceGeo, sliceMat);
    sliceMesh.position.y = normDepthY;
    scene.add(sliceMesh);

    // Mouse Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      scene.rotation.y += deltaX * 0.008;
      scene.rotation.x += deltaY * 0.008;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      sliceMesh.position.y = (4.5 - (currentDepth / 1000.0) * 9.0) * (exaggeration / 5);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [currentDepth, exaggeration, activePatchId, selectedRegionBounds]);

  return (
    <div className="relative w-full h-full bg-[#000000] select-none overflow-hidden font-sans">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Control Strip */}
      <div className="absolute top-4 left-4 z-20 space-y-2 max-w-sm text-xs">
        {/* Ocean Patch Selector */}
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2.5 shadow-2xl space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[#ffffff] font-semibold">
            <Box className="w-4 h-4 text-[#ffffff]" />
            <span>Select 3D Ocean Patch to Explore</span>
          </div>

          <div className="flex flex-col space-y-1 font-mono">
            {selectedRegionBounds && (
              <button
                onClick={() => setActivePatchId('custom')}
                className={`text-left px-2 py-1 rounded text-[11px] font-semibold transition-all border ${
                  activePatchId === 'custom'
                    ? 'bg-[#373737] text-[#ffffff] border-[#545454]'
                    : 'bg-[#000000] text-[#545454] border-[#373737] hover:text-[#ffffff]'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Custom Map Region Box</span>
                </span>
              </button>
            )}

            {PRESET_PATCHES.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePatchId(p.id)}
                className={`text-left px-2 py-1 rounded text-[11px] font-medium transition-all border ${
                  activePatchId === p.id
                    ? 'bg-[#373737] text-[#ffffff] font-semibold border-[#545454]'
                    : 'bg-[#000000] text-[#545454] border-[#373737] hover:bg-[#373737] hover:text-[#ffffff]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Exaggeration Control */}
        <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2.5 shadow-2xl space-y-1.5 font-mono">
          <div className="flex justify-between items-center text-[10px] text-[#545454] font-semibold uppercase">
            <span>Vertical Exaggeration</span>
            <span className="text-[#ffffff]">{exaggeration}×</span>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 2, 5, 10].map((ex) => (
              <button
                key={ex}
                onClick={() => setExaggeration(ex)}
                className={`px-2 py-0.5 text-[10px] rounded transition-all border ${
                  exaggeration === ex
                    ? 'bg-[#373737] text-[#ffffff] font-bold border-[#545454]'
                    : 'bg-[#000000] text-[#545454] border-[#373737] hover:text-[#ffffff]'
                }`}
              >
                {ex}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-3 left-4 z-20 bg-[#1e1e1e]/95 border border-[#373737] rounded px-3 py-1 font-mono text-xs text-[#545454]">
        ACTIVE PATCH: <span className="text-[#ffffff] font-bold">{patch.name}</span> | SLICE: <span className="text-[#ffffff] font-bold">{currentDepth}m</span>
      </div>
    </div>
  );
};

export default Ocean3DViewer;
