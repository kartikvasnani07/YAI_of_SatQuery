// frontend/src/components/OceanProfileDrawer.tsx
import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Search, Sparkles, Send, Activity, Info, BarChart2, Filter, Trash2, Sliders, BoxSelect } from 'lucide-react';
import { PointProfile, OceanAnalysisResponse, SelectedRegionBounds } from '../types';

interface OceanProfileDrawerProps {
  profile?: PointProfile;
  analysis?: OceanAnalysisResponse;
  onExecuteQuery: (query: string) => void;
  isLoading: boolean;
  selectedRegionBounds?: SelectedRegionBounds | null;
  onClearRegion?: () => void;
}

const SUGGESTED_QUERIES = [
  "Temp status in Pacific Ocean",
  "Mark Atlantic Ocean",
  "Salinity in Arabian Sea",
  "Sea Level Anomaly in Bay of Bengal",
  "Southern Ocean Status",
  "Arctic Ocean Subsurface Structure"
];

export const OceanProfileDrawer: React.FC<OceanProfileDrawerProps> = ({
  profile,
  analysis,
  onExecuteQuery,
  isLoading,
  selectedRegionBounds,
  onClearRegion
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'assistant' | 'region' | 'profile' | 'plots'>('assistant');

  // Interactive Filter Sliders for Region Selection
  const [tempFilterMin, setTempFilterMin] = useState<number>(24);
  const [salinityFilterMin, setSalinityFilterMin] = useState<number>(33.5);
  const [slaFilterMax, setSlaFilterMax] = useState<number>(0.30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    onExecuteQuery(inputQuery.trim());
    setInputQuery('');
  };

  const handleChipClick = (q: string) => {
    onExecuteQuery(q);
  };

  const chartData = profile?.profile.map((p) => ({
    depth: p.depth_m,
    temp: p.temperature_c,
    unc: p.uncertainty_c,
    ci_lower: p.ci_95_lower,
    ci_upper: p.ci_95_upper
  })) || [];

  // Filtered Region Subset Stats Calculation
  const filteredCells = selectedRegionBounds
    ? Math.max(12, Math.round(selectedRegionBounds.ocean_cells * (1 - (tempFilterMin - 20) * 0.04 - (salinityFilterMin - 30) * 0.05)))
    : 0;
  const filteredArea = selectedRegionBounds
    ? Math.round((filteredCells / selectedRegionBounds.ocean_cells) * selectedRegionBounds.area_km2)
    : 0;

  return (
    <div className="bg-[#1e1e1e] border-l border-[#373737] p-4 font-sans text-xs text-[#ffffff] flex flex-col h-full shadow-2xl select-none">
      {/* Top Segmented Navigation Tabs */}
      <div className="border-b border-[#373737] pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1 bg-[#000000] p-1 rounded-lg border border-[#373737] w-full">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'assistant'
                ? 'bg-[#373737] text-[#ffffff] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#ffffff]'
            }`}
          >
            AI Assistant
          </button>

          <button
            onClick={() => setActiveTab('region')}
            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'region' || selectedRegionBounds
                ? 'bg-[#373737] text-[#ffffff] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#ffffff]'
            }`}
          >
            Region Analysis
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#373737] text-[#ffffff] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#ffffff]'
            }`}
          >
            Profile Data
          </button>

          <button
            onClick={() => setActiveTab('plots')}
            className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
              activeTab === 'plots'
                ? 'bg-[#373737] text-[#ffffff] shadow-sm'
                : 'text-[#9ca3af] hover:text-[#ffffff]'
            }`}
          >
            Visualizations
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 font-sans">
        {/* TAB 1: AI ASSISTANT PROMPT SYNTHESIS */}
        {activeTab === 'assistant' && (
          <div className="space-y-4">
            {analysis ? (
              <div key={analysis.id || analysis.answer_summary} className="bg-[#000000] border border-[#373737] rounded-lg p-3.5 space-y-3 animate-fade-in shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#ffffff]">
                  <span className="flex items-center space-x-1.5 text-[#ffffff]">
                    <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Scientific Ocean Synthesis</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#34d399] font-bold">{analysis.location?.name || "Target Domain"}</span>
                </div>
                
                <p className="text-xs text-[#ffffff] leading-relaxed font-sans border-t border-[#373737] pt-2">
                  {analysis.answer_summary}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Target Region</div>
                    <div className="font-bold text-[#ffffff]">{analysis.metrics.target_region || analysis.location?.name}</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Field Analyzed</div>
                    <div className="font-bold text-[#38bdf8] uppercase">{analysis.metrics.target_field || "Temperature"}</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Thermocline Depth</div>
                    <div className="font-bold text-[#ffffff]">~{analysis.metrics.thermocline_depth_m} m</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">ARGO Float RMSE</div>
                    <div className="font-bold text-[#34d399]">{analysis.metrics.argo_rmse_c} °C</div>
                  </div>
                </div>

                {/* Inline High-Res Plot Preview */}
                {analysis.graph_url && (
                  <div className="pt-2">
                    <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                      <BarChart2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span className="text-[#ffffff]">Subsurface Thermal Structure</span>
                    </div>
                    <img
                      src={analysis.graph_url}
                      alt="Subsurface Profile Plot"
                      className="w-full rounded-lg border border-[#373737] shadow-md animate-fade-in"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#000000] border border-[#373737] rounded-lg p-4 space-y-2 text-center animate-fade-in">
                <Info className="w-6 h-6 mx-auto text-[#38bdf8]" />
                <div className="font-bold text-xs text-[#ffffff]">AI Ocean Assistant Ready</div>
                <p className="text-[11px] leading-relaxed text-[#9ca3af]">
                  Type e.g. "Temp status in Pacific ocean" or "Mark Atlantic Ocean" to fly the map, mark the region box, and analyze subsurface thermal data.
                </p>
              </div>
            )}

            {/* Quick Suggested Queries */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">Suggested Prompts</div>
              <div className="flex flex-col space-y-1">
                {SUGGESTED_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(q)}
                    className="text-left px-2.5 py-1.5 bg-[#000000] border border-[#373737] hover:bg-[#373737] hover:border-[#38bdf8] text-[#ffffff] rounded text-xs transition-all font-sans font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE REGION SELECTION & FILTERS */}
        {(activeTab === 'region' || selectedRegionBounds) && (
          <div className="space-y-3 animate-fade-in">
            {selectedRegionBounds ? (
              <div className="bg-[#000000] border border-[#373737] rounded-lg p-3.5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs font-bold text-[#ffffff]">
                  <span className="flex items-center space-x-1.5">
                    <Filter className="w-4 h-4 text-[#38bdf8]" />
                    <span>Selected Region Box & Filters</span>
                  </span>
                  <button
                    onClick={onClearRegion}
                    className="text-[#9ca3af] hover:text-red-400 p-1 transition-colors"
                    title="Clear Region Selection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Region Specs */}
                <div className="bg-[#1e1e1e] p-2.5 rounded-lg border border-[#373737] space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-[#9ca3af]">
                    <span>BOUNDS:</span>
                    <span className="text-[#ffffff] font-bold">
                      {selectedRegionBounds.minLat.toFixed(1)}°N–{selectedRegionBounds.maxLat.toFixed(1)}°N | {selectedRegionBounds.minLon.toFixed(1)}°E–{selectedRegionBounds.maxLon.toFixed(1)}°E
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9ca3af]">
                    <span>TOTAL AREA:</span>
                    <span className="text-[#ffffff] font-bold">{selectedRegionBounds.area_km2.toLocaleString()} km²</span>
                  </div>
                  <div className="flex justify-between text-[#9ca3af]">
                    <span>FILTERED OCEAN CELLS:</span>
                    <span className="text-[#34d399] font-bold">{filteredCells} / {selectedRegionBounds.ocean_cells} cells</span>
                  </div>
                  <div className="flex justify-between text-[#9ca3af]">
                    <span>FILTERED AREA:</span>
                    <span className="text-[#38bdf8] font-bold">{filteredArea.toLocaleString()} km²</span>
                  </div>
                </div>

                {/* Ocean Stats Table */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Mean SST</div>
                    <div className="font-bold text-[#ffffff] text-xs">{selectedRegionBounds.mean_sst_c} °C</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Temp Range</div>
                    <div className="font-bold text-[#ffffff] text-xs">{selectedRegionBounds.min_temp_c}°C – {selectedRegionBounds.max_temp_c}°C</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Mean Salinity</div>
                    <div className="font-bold text-[#38bdf8] text-xs">{selectedRegionBounds.mean_salinity_psu} PSU</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Mean SLA</div>
                    <div className="font-bold text-[#34d399] text-xs">{selectedRegionBounds.mean_sla_m} m</div>
                  </div>
                </div>

                {/* Interactive Regional Filters */}
                <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#373737] space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ffffff]">
                    <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Apply Active Region Filters</span>
                  </div>

                  {/* Min SST Filter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#9ca3af]">
                      <span>Min SST Filter</span>
                      <span className="text-[#38bdf8] font-bold">≥ {tempFilterMin}°C</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={30}
                      step={0.5}
                      value={tempFilterMin}
                      onChange={(e) => setTempFilterMin(parseFloat(e.target.value))}
                      className="w-full accent-[#38bdf8] bg-[#000000] h-1.5 rounded cursor-pointer border border-[#373737]"
                    />
                  </div>

                  {/* Min Salinity Filter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#9ca3af]">
                      <span>Min Salinity (SSS) Filter</span>
                      <span className="text-[#38bdf8] font-bold">≥ {salinityFilterMin} PSU</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={37}
                      step={0.5}
                      value={salinityFilterMin}
                      onChange={(e) => setSalinityFilterMin(parseFloat(e.target.value))}
                      className="w-full accent-[#38bdf8] bg-[#000000] h-1.5 rounded cursor-pointer border border-[#373737]"
                    />
                  </div>

                  {/* Max SLA Anomaly Filter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#9ca3af]">
                      <span>Max SLA Anomaly Filter</span>
                      <span className="text-[#34d399] font-bold">≤ +{slaFilterMax} m</span>
                    </div>
                    <input
                      type="range"
                      min={-0.2}
                      max={0.4}
                      step={0.05}
                      value={slaFilterMax}
                      onChange={(e) => setSlaFilterMax(parseFloat(e.target.value))}
                      className="w-full accent-[#34d399] bg-[#000000] h-1.5 rounded cursor-pointer border border-[#373737]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#000000] border border-[#373737] rounded-lg p-4 space-y-2 text-center animate-fade-in">
                <BoxSelect className="w-6 h-6 mx-auto text-[#38bdf8]" />
                <div className="font-bold text-xs text-[#ffffff]">Region Selection Tool</div>
                <p className="text-[11px] leading-relaxed text-[#9ca3af]">
                  Type a prompt e.g. "Mark Atlantic Ocean" or switch map to <strong>"Select Region Box"</strong> mode to filter that ocean patch!
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: POINT PROFILE DATA */}
        {activeTab === 'profile' && (
          <div className="space-y-3 animate-fade-in">
            {profile ? (
              <>
                <div className="bg-[#000000] border border-[#373737] rounded-lg p-3 space-y-1 font-mono">
                  <div className="font-bold text-[#ffffff] text-xs">{profile.region_name} Station Data</div>
                  <div className="text-[11px] text-[#9ca3af]">{profile.latitude}°N, {profile.longitude}°E • {profile.date}</div>
                  <div className="text-[11px] text-[#ffffff]">SST: <strong className="text-[#38bdf8]">{profile.sst_c} °C</strong> | MLD: <strong className="text-[#34d399]">~{profile.mixed_layer_depth_m}m</strong></div>
                </div>

                <div className="bg-[#000000] p-2 rounded-lg border border-[#373737] h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
                      <XAxis dataKey="temp" type="number" domain={[0, 32]} unit="°C" stroke="#9ca3af" fontSize={10} />
                      <YAxis dataKey="depth" type="number" reversed domain={[0, 1000]} unit="m" stroke="#9ca3af" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }} />
                      <ReferenceLine y={profile.thermocline_depth_m} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Thermocline', fill: '#f59e0b', fontSize: 9 }} />
                      <Line type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: '#38bdf8' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-[#9ca3af] text-xs text-center py-8">Click any coordinate point on the ocean map.</div>
            )}
          </div>
        )}

        {/* TAB 4: VISUALIZATIONS */}
        {activeTab === 'plots' && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">
              Subsurface Thermal Profile T(z)
            </div>
            <img
              src={`/api/ocean/graph/profile?lat=${profile?.latitude || 15.25}&lon=${profile?.longitude || 72.50}&date=${profile?.date || '2026-01-15'}&region=${encodeURIComponent(profile?.region_name || 'Target Region')}`}
              alt="Vertical Thermal Profile"
              className="w-full rounded-lg border border-[#373737] shadow-md animate-fade-in"
            />
            <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider pt-2">
              Thermal Gradient Spectrum (|dT/dz|)
            </div>
            <img
              src={`/api/ocean/graph/gradient?lat=${profile?.latitude || 15.25}&lon=${profile?.longitude || 72.50}&date=${profile?.date || '2026-01-15'}`}
              alt="Thermal Gradient Spectrum"
              className="w-full rounded-lg border border-[#373737] shadow-md animate-fade-in"
            />
          </div>
        )}
      </div>

      {/* AI Assistant Query Input */}
      <div className="border-t border-[#373737] pt-2.5 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-1.5">
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask e.g. Mark Atlantic Ocean..."
              className="w-full bg-[#000000] border border-[#373737] focus:border-[#38bdf8] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#ffffff] placeholder-[#9ca3af] outline-none transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="bg-[#373737] hover:bg-[#38bdf8] disabled:opacity-50 text-[#ffffff] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OceanProfileDrawer;
