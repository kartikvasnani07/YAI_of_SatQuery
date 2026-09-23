import React, { useState } from 'react';
import { Search, Sparkles, Play, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Observation } from '../types';

interface QueryPanelProps {
  onExecuteQuery: (query: string, obsId: string) => void;
  isLoading: boolean;
  selectedObsId: string;
  onSelectObsId: (id: string) => void;
  observations: Observation[];
}

const PRESET_QUERIES = [
  {
    title: "Flagship Multi-hop Query",
    obsId: "obs_cartosat_t1",
    query: "Identify agricultural land within 500 meters of the river that experienced flooding, calculate the affected area, and determine whether vegetation recovered within three months.",
    type: "multi-hop"
  },
  {
    title: "Optical + SAR VQA",
    obsId: "obs_risat_sar_t2",
    query: "What is the extent of surface inundation and specular scattering detected in the SAR imagery?",
    type: "vqa"
  },
  {
    title: "Grounding & Segmentation",
    obsId: "obs_cartosat_t2",
    query: "Locate and highlight all flooded agricultural fields adjacent to the river corridor.",
    type: "grounding"
  },
  {
    title: "Scientific Refusal Test",
    obsId: "obs_rgb_only",
    query: "Calculate NDVI spectral vegetation index for this true-color image.",
    type: "refusal"
  }
];

export const QueryPanel: React.FC<QueryPanelProps> = ({
  onExecuteQuery,
  isLoading,
  selectedObsId,
  onSelectObsId,
  observations,
}) => {
  const [queryInput, setQueryInput] = useState(PRESET_QUERIES[0].query);

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setQueryInput(preset.query);
    onSelectObsId(preset.obsId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() && !isLoading) {
      onExecuteQuery(queryInput, selectedObsId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
      {/* Title */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Query Analysis Engine</span>
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">
          Ask natural-language questions to formulate scientifically validated EO workflows.
        </p>
      </div>

      {/* Query Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300">Preset Benchmark Queries:</label>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`text-left text-xs p-2 rounded-lg border transition-all ${
                queryInput === preset.query
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-semibold mb-0.5">
                <span>{preset.title}</span>
                {preset.type === 'refusal' ? (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    Refusal Test
                  </span>
                ) : (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {preset.type}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{preset.query}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
            <span>Natural Language Question:</span>
            <span className="text-[10px] text-slate-400 font-mono">NLP Engine v2.1</span>
          </label>
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            rows={4}
            placeholder="Type your Earth-Observation query here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Input Dataset Info Badge */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Selected Sensor:</span>
          <span className="font-semibold text-cyan-300">
            {observations.find((o) => o.id === selectedObsId)?.name || 'Cartosat-2S Optical'}
          </span>
        </div>

        {/* Execute Button */}
        <button
          type="submit"
          disabled={isLoading || !queryInput.trim()}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Orchestrating Scientific Plan...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Formulate & Execute Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
