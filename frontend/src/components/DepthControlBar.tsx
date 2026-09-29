// frontend/src/components/DepthControlBar.tsx
import React from 'react';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface DepthControlBarProps {
  currentDepth: number;
  onDepthChange: (depth: number) => void;
}

const STANDARD_LEVELS = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];

export const DepthControlBar: React.FC<DepthControlBarProps> = ({
  currentDepth,
  onDepthChange
}) => {
  const isStandard = STANDARD_LEVELS.includes(currentDepth);

  return (
    <div className="bg-[#1e1e1e]/95 border border-[#373737] backdrop-blur-md rounded-lg p-2.5 shadow-2xl space-y-2 select-none font-sans text-[#ffffff]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-[#ffffff]" />
          <span className="text-xs font-semibold text-[#ffffff]">
            Reconstruction Depth Level (3D Ocean Volume)
          </span>
        </div>

        {/* Level Tag */}
        <div className="flex items-center space-x-2">
          {isStandard ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#000000] border border-[#373737] text-[#ffffff] text-[10px] font-mono font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>MODEL OUTPUT ({currentDepth}m)</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#000000] border border-[#373737] text-[#ffffff] text-[10px] font-mono font-medium">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>INTERPOLATED VALUE ({currentDepth}m)</span>
            </span>
          )}

          <div className="px-2.5 py-0.5 bg-[#373737] rounded text-[#ffffff] font-mono font-bold text-xs border border-[#545454]">
            {currentDepth} m
          </div>
        </div>
      </div>

      {/* Depth Slider */}
      <div className="flex items-center space-x-3">
        <span className="text-[10px] font-mono text-[#545454] w-6">0m</span>
        <input
          type="range"
          min={0}
          max={1000}
          step={5}
          value={currentDepth}
          onChange={(e) => onDepthChange(parseFloat(e.target.value))}
          className="w-full accent-[#ffffff] cursor-pointer h-1.5 bg-[#000000] rounded-lg appearance-none border border-[#373737]"
        />
        <span className="text-[10px] font-mono text-[#545454] w-10">1000m</span>
      </div>

      {/* Quick Standard Level Badges */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin">
        <span className="text-[9px] font-mono text-[#545454] uppercase tracking-wider shrink-0 pr-1">
          Standard Levels:
        </span>
        {STANDARD_LEVELS.map((lvl) => {
          const active = currentDepth === lvl;
          return (
            <button
              key={lvl}
              onClick={() => onDepthChange(lvl)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all shrink-0 border ${
                active
                  ? 'bg-[#373737] text-[#ffffff] font-bold border-[#545454]'
                  : 'bg-[#000000] text-[#545454] border-[#373737] hover:bg-[#373737] hover:text-[#ffffff]'
              }`}
            >
              {lvl}m
            </button>
          );
        })}
      </div>
    </div>
  );
};
