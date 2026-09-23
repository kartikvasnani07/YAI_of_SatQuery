import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { GeoJSONLayer } from '../types';

interface LayerManagerProps {
  layers: GeoJSONLayer[];
  onToggleVisibility: (layerId: string) => void;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  onToggleVisibility,
}) => {
  return (
    <div className="bg-[#273338] border border-[#618764] rounded p-3 space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#618764]/40 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#9CB080]" />
          <h3 className="text-xs font-bold text-[#9CB080] uppercase tracking-wide">
            Multi-Layer Manager ({layers.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Vector Layers</span>
      </div>

      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {layers.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">No GIS layers generated yet. Execute a query to populate map layers.</p>
        ) : (
          layers.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center justify-between p-2 rounded bg-[#1E282C] border border-[#618764]/60 text-xs hover:border-[#618764] transition-all"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <button
                  onClick={() => onToggleVisibility(layer.id)}
                  className="text-slate-300 hover:text-[#9CB080] transition-colors"
                >
                  {layer.visible !== false ? (
                    <Eye className="w-4 h-4 text-[#9CB080]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <div
                  className="w-3 h-3 rounded-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="font-medium text-slate-200 truncate">{layer.name}</span>
              </div>
              <span className="text-[10px] font-mono text-[#9CB080] bg-[#273338] px-1.5 py-0.5 rounded border border-[#618764]">
                {layer.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
