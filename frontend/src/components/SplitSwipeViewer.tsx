import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

export const SplitSwipeViewer: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [leftDataset, setLeftDataset] = useState('obs_cartosat_t1');
  const [rightDataset, setRightDataset] = useState('obs_cartosat_t2');

  return (
    <div className="relative w-full h-full bg-[#000000] overflow-hidden select-none">
      {/* Header bar controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between bg-[#1E1E1E] border border-[#373737] rounded-lg px-4 py-2 text-xs shadow-2xl">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#6C6C6C]" />
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            Multitemporal & Paired Sensor Split-Swipe Comparison
          </span>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-[#545454]">LEFT TRANSECT:</span>
            <select
              value={leftDataset}
              onChange={(e) => setLeftDataset(e.target.value)}
              className="bg-[#000000] border border-[#373737] rounded px-2.5 py-1 text-xs text-white font-medium focus:outline-none"
            >
              <option value="obs_cartosat_t1">Cartosat Optical T1 (2026-01-15)</option>
              <option value="obs_risat_sar_t1">RISAT SAR T1 (2026-01-16)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[#545454]">RIGHT TRANSECT:</span>
            <select
              value={rightDataset}
              onChange={(e) => setRightDataset(e.target.value)}
              className="bg-[#000000] border border-[#373737] rounded px-2.5 py-1 text-xs text-white font-medium focus:outline-none"
            >
              <option value="obs_cartosat_t2">Cartosat Optical T2 (2026-03-20)</option>
              <option value="obs_risat_sar_t2">RISAT SAR T2 (2026-03-21)</option>
              <option value="obs_cartosat_t3">Cartosat Optical T3 (2026-06-15)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Synchronized Image Container */}
      <div className="relative w-full h-full pt-12">
        {/* Right Base Image (T2) */}
        <div className="absolute inset-0 pt-12">
          <img
            src={`/api/layers/${rightDataset}/png`}
            alt="Right Dataset"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 right-4 bg-[#000000]/90 border border-[#373737] text-white px-3 py-1 rounded text-xs font-mono font-bold shadow-xl">
            RIGHT: {rightDataset.toUpperCase()}
          </div>
        </div>

        {/* Left Clipped Image (T1) */}
        <div
          className="absolute inset-0 pt-12 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={`/api/layers/${leftDataset}/png`}
            alt="Left Dataset"
            className="w-full h-full object-cover"
            style={{ width: '100vw', maxWidth: 'none' }}
          />
          <div className="absolute bottom-4 left-4 bg-[#000000]/90 border border-[#373737] text-white px-3 py-1 rounded text-xs font-mono font-bold shadow-xl">
            LEFT: {leftDataset.toUpperCase()}
          </div>
        </div>

        {/* Swipe Handle Divider Line */}
        <div
          className="absolute top-12 bottom-0 w-0.5 bg-[#FFFFFF] cursor-ew-resize z-10 shadow-2xl"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#1E1E1E] border border-[#6C6C6C] text-white flex items-center justify-center text-xs font-bold shadow-2xl font-mono">
            ↔
          </div>
        </div>

        {/* Full Slider Input Element */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 pt-12 w-full h-full opacity-0 cursor-ew-resize z-20"
        />
      </div>
    </div>
  );
};

