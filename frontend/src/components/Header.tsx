import React from 'react';
import { Layers, Box, Cpu, Award, Download, Calendar, Info, Wind } from 'lucide-react';
import { WaveLogo } from './WaveLogo';

interface HeaderProps {
  activeView: 'overview' | 'map' | 'currents' | '3d' | 'argo' | 'embedding';
  onViewChange: (view: 'overview' | 'map' | 'currents' | '3d' | 'argo' | 'embedding') => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onExportPdfReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  selectedDate,
  onDateChange,
  onExportPdfReport
}) => {
  return (
    <header className="bg-[#1e1e1e] border-b border-[#373737] px-5 py-2.5 flex items-center justify-between shrink-0 select-none font-sans shadow-md">
      {/* Brand Title & Animated Wave Shape Logo */}
      <div className="flex items-center space-x-3">
        <div className="p-1.5 rounded-lg bg-[#000000] border border-[#373737] flex items-center justify-center">
          <WaveLogo className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#ffffff] tracking-tight">
            OCEANEMBED
          </h1>
          <div className="text-[11px] text-[#9ca3af]">
            Subsurface Ocean Reconstruction & Multi-Field Scientific Platform
          </div>
        </div>
      </div>

      {/* View Navigation Segmented Buttons */}
      <div className="flex items-center bg-[#000000] border border-[#373737] rounded-lg p-1 space-x-1">
        <button
          onClick={() => onViewChange('overview')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            activeView === 'overview'
              ? 'bg-[#373737] text-[#ffffff] font-semibold'
              : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onViewChange('map')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            activeView === 'map'
              ? 'bg-[#373737] text-[#ffffff] font-semibold'
              : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ocean Explorer</span>
        </button>

        <button
          onClick={() => onViewChange('currents')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            activeView === 'currents'
              ? 'bg-[#373737] text-[#ffffff] font-semibold'
              : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Currents & Tides</span>
        </button>

        <button
          onClick={() => onViewChange('3d')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            activeView === '3d'
              ? 'bg-[#373737] text-[#ffffff] font-semibold'
              : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Ocean</span>
        </button>

        <button
          onClick={() => onViewChange('argo')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            activeView === 'argo'
              ? 'bg-[#373737] text-[#ffffff] font-semibold'
              : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>ARGO Validation</span>
        </button>

        <button
          onClick={() => onViewChange('embedding')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
            activeView === 'embedding'
              ? 'bg-[#373737] text-[#ffffff] font-semibold'
              : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Embeddings</span>
        </button>
      </div>

      {/* Date Control & Actions */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 bg-[#000000] border border-[#373737] rounded-lg px-2.5 py-1 text-xs text-[#545454]">
          <Calendar className="w-3.5 h-3.5 text-[#545454]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-[#ffffff] font-mono outline-none cursor-pointer text-xs"
          />
        </div>

        <button
          onClick={onExportPdfReport}
          className="bg-[#373737] hover:bg-[#545454] border border-[#545454] text-[#ffffff] px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};
