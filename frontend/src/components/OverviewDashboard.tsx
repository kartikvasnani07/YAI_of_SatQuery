// frontend/src/components/OverviewDashboard.tsx
import React from 'react';
import { Waves, Layers, ArrowRight } from 'lucide-react';
import { DensityField } from '../types';

interface OverviewDashboardProps {
  onNavigateView: (view: any) => void;
  onSelectDepth: (depth: number) => void;
  onSelectField?: (field: DensityField) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigateView,
  onSelectDepth,
  onSelectField
}) => {
  return (
    <div className="h-full bg-[#000000] p-6 text-[#ffffff] font-sans text-xs overflow-y-auto space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-[#1e1e1e] border border-[#373737] rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-[#545454] font-medium text-xs font-mono">
              <Waves className="w-4 h-4 text-[#ffffff]" />
              <span className="text-[#545454]">Subsurface Ocean Reconstruction & Multi-Field Scientific Platform</span>
            </div>
            <h1 className="text-2xl font-bold text-[#ffffff] tracking-tight mt-1">
              OCEANEMBED Framework
            </h1>
            <p className="text-xs text-[#545454] mt-1 max-w-2xl leading-relaxed">
              Satellite Embedding-Based Deep Learning Framework for Reconstruction of Subsurface Ocean Temperature from Surface Satellite Observations
            </p>
          </div>

          <div className="text-right text-xs font-mono text-[#545454]">
            <div>Domain: <span className="text-[#ffffff]">Global Ocean Basins & Indian Ocean</span></div>
            <div>Grid Resolution: <span className="text-[#ffffff]">0.5° x 0.5° Gridded Fields</span></div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-1.5 pt-3 border-t border-[#373737] text-[10px] text-center font-mono font-medium">
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#ffffff]">SURFACE OBSERVATIONS</div>
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#545454]">HARMONIZATION</div>
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#545454]">EMBEDDING ENCODER</div>
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#ffffff]">DEPTH RECONSTRUCTION</div>
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#545454]">UNCERTAINTY HEAD</div>
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#ffffff]">3D OCEAN FIELD</div>
          <div className="bg-[#000000] p-1.5 rounded border border-[#373737] text-[#545454]">ARGO VALIDATION</div>
        </div>
      </div>

      {/* Multimodal Surface Observations Coverage */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#ffffff] tracking-tight">
          Multimodal Satellite Observation Fields
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono">
          <div
            onClick={() => { onSelectField?.('temperature'); onNavigateView('map'); }}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-lg p-3 space-y-1 cursor-pointer transition-all shadow-md"
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#ffffff]">
              <span>SST / Subsurface</span>
              <span className="text-emerald-400 text-[10px]">AVAILABLE</span>
            </div>
            <div className="text-[10px] text-[#545454]">Temperature Field</div>
            <div className="text-xs text-[#ffffff]">96.4% Coverage</div>
          </div>

          <div
            onClick={() => { onSelectField?.('sla'); onNavigateView('map'); }}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-lg p-3 space-y-1 cursor-pointer transition-all shadow-md"
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#ffffff]">
              <span>SLA (Altimetry)</span>
              <span className="text-emerald-400 text-[10px]">AVAILABLE</span>
            </div>
            <div className="text-[10px] text-[#545454]">Sea Level Anomaly</div>
            <div className="text-xs text-[#ffffff]">91.8% Coverage</div>
          </div>

          <div
            onClick={() => { onSelectField?.('currents'); onNavigateView('map'); }}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-lg p-3 space-y-1 cursor-pointer transition-all shadow-md"
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#ffffff]">
              <span>Ocean Currents</span>
              <span className="text-emerald-400 text-[10px]">AVAILABLE</span>
            </div>
            <div className="text-[10px] text-[#545454]">Surface Vectors</div>
            <div className="text-xs text-[#ffffff]">87.5% Coverage</div>
          </div>

          <div
            onClick={() => { onSelectField?.('salinity'); onNavigateView('map'); }}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-lg p-3 space-y-1 cursor-pointer transition-all shadow-md"
          >
            <div className="flex justify-between items-center text-xs font-bold text-[#ffffff]">
              <span>SSS (Salinity)</span>
              <span className="text-emerald-400 text-[10px]">AVAILABLE</span>
            </div>
            <div className="text-[10px] text-[#545454]">SMAP Satellite</div>
            <div className="text-xs text-[#ffffff]">82.1% Coverage</div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#373737] opacity-60 rounded-lg p-3 space-y-1 shadow-md">
            <div className="flex justify-between items-center text-xs font-bold text-[#ffffff]">
              <span>Surface Winds</span>
              <span className="text-red-400 text-[10px]">MASKED</span>
            </div>
            <div className="text-[10px] text-[#545454]">Scatterometer Vector</div>
            <div className="text-xs text-[#545454]">Orbital Cloud Gap</div>
          </div>
        </div>
      </div>

      {/* Action Launchers */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#ffffff] tracking-tight">
          Scientific Ocean Workspaces
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateView('map')}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-xl p-4 space-y-2 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-[#545454] group-hover:text-[#ffffff] transition-colors" />
              <ArrowRight className="w-4 h-4 text-[#545454] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[#ffffff]">2D Ocean Density Explorer</h4>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Analyze temperature, SLA, currents, salinity density maps, bathymetry contours, and point profiles.
            </p>
          </div>

          <div
            onClick={() => onNavigateView('3d')}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-xl p-4 space-y-2 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-[#545454] group-hover:text-[#ffffff] transition-colors" />
              <ArrowRight className="w-4 h-4 text-[#545454] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[#ffffff]">3D Ocean Volumetric Field</h4>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Interactive 3D ocean volume visualization with depth slice clipping and seafloor bathymetry surface.
            </p>
          </div>

          <div
            onClick={() => onNavigateView('argo')}
            className="bg-[#1e1e1e] border border-[#373737] hover:border-[#6c6c6c] rounded-xl p-4 space-y-2 cursor-pointer transition-all shadow-md group"
          >
            <div className="flex items-center justify-between">
              <Layers className="w-5 h-5 text-[#545454] group-hover:text-[#ffffff] transition-colors" />
              <ArrowRight className="w-4 h-4 text-[#545454] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h4 className="text-sm font-bold text-[#ffffff]">ARGO Float Validation</h4>
            <p className="text-[11px] text-[#545454] leading-relaxed">
              Validate OceanEmbed depth predictions against in-situ physical ARGO floats with RMSE and MAE depth metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
