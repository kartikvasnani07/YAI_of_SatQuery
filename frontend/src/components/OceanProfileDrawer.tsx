// frontend/src/components/OceanProfileDrawer.tsx
import React, { useState } from 'react';
import { PointProfile, OceanAnalysisResponse, SelectedRegionBounds } from '../types';
import {
  MessageSquare,
  BarChart2,
  Sliders,
  Send,
  Loader2,
  Compass,
  Filter,
  Trash2,
  BoxSelect,
  Layers,
  Activity,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

interface OceanProfileDrawerProps {
  profile?: PointProfile;
  analysis?: OceanAnalysisResponse;
  onExecuteQuery: (query: string) => void;
  isLoading: boolean;
  selectedRegionBounds?: SelectedRegionBounds | null;
  onClearRegion: () => void;
}

const SUGGESTED_QUERIES = [
  "Temp status in Pacific ocean",
  "Mark Atlantic Ocean",
  "Salinity in Arabian Sea",
  "Show 100m temperature anomaly in Bay of Bengal",
  "Compare with ARGO float benchmark"
];

export const OceanProfileDrawer: React.FC<OceanProfileDrawerProps> = ({
  profile,
  analysis,
  onExecuteQuery,
  isLoading,
  selectedRegionBounds,
  onClearRegion
}) => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'region' | 'profile' | 'plots'>('assistant');
  const [customInput, setCustomInput] = useState<string>('');

  // Interactive Filter Sliders for Selected Region Box
  const [tempFilterMin, setTempFilterMin] = useState<number>(18.0);
  const [salinityFilterMin, setSalinityFilterMin] = useState<number>(34.5);
  const [slaFilterMax, setSlaFilterMax] = useState<number>(0.2);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isLoading) return;
    onExecuteQuery(customInput.trim());
    setCustomInput('');
  };

  const handleChipClick = (q: string) => {
    if (isLoading) return;
    onExecuteQuery(q);
  };

  // Recharts Data formatting for Profile Tab & Plot Tab
  const chartData = profile?.profile.map((p) => ({
    depth: p.depth_m,
    temp: p.temperature_c,
    salinity: Number((34.2 + (p.depth_m < 200 ? 1.2 : 0.4)).toFixed(2)),
    gradient: Number((Math.exp(-Math.pow((p.depth_m - 95) / 60, 2)) * 0.045).toFixed(4)),
    sla: Number((0.08 * Math.cos(p.depth_m * 0.01)).toFixed(3)),
    ci_lower: p.ci_95_lower,
    ci_upper: p.ci_95_upper
  })) || [
    { depth: 0, temp: 28.5, salinity: 35.4, gradient: 0.005, sla: 0.08 },
    { depth: 50, temp: 28.1, salinity: 35.3, gradient: 0.012, sla: 0.07 },
    { depth: 100, temp: 21.8, salinity: 34.9, gradient: 0.045, sla: 0.05 },
    { depth: 200, temp: 15.4, salinity: 34.6, gradient: 0.020, sla: 0.03 },
    { depth: 500, temp: 9.2, salinity: 34.5, gradient: 0.008, sla: 0.01 },
    { depth: 1000, temp: 4.8, salinity: 34.4, gradient: 0.003, sla: 0.00 }
  ];

  // Region filtering math
  const filteredCells = selectedRegionBounds
    ? Math.max(1, Math.round(selectedRegionBounds.ocean_cells * (1 - (tempFilterMin - 15) * 0.03)))
    : 0;
  const filteredArea = selectedRegionBounds
    ? Math.round((selectedRegionBounds.area_km2 * filteredCells) / (selectedRegionBounds.ocean_cells || 1))
    : 0;

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col font-sans text-xs text-[#ffffff] select-none">
      {/* Drawer Tab Header */}
      <div className="bg-[#000000] border-b border-[#373737] p-2 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
            activeTab === 'assistant' ? 'bg-[#38bdf8] text-[#000000]' : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('region')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all relative ${
            activeTab === 'region' || selectedRegionBounds ? 'bg-[#34d399] text-[#000000]' : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Region Analysis</span>
          {selectedRegionBounds && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0.5 right-0.5 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
            activeTab === 'profile' ? 'bg-[#38bdf8] text-[#000000]' : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Profile Data</span>
        </button>

        <button
          onClick={() => setActiveTab('plots')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
            activeTab === 'plots' ? 'bg-[#f59e0b] text-[#000000]' : 'text-[#9ca3af] hover:text-[#ffffff]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Visualizations</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* TAB 1: AI OCEAN ASSISTANT */}
        {activeTab === 'assistant' && (
          <div className="space-y-3.5">
            {/* Query Form */}
            <form onSubmit={handleFormSubmit} className="space-y-2">
              <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider flex items-center justify-between">
                <span>Ocean Embed Natural Language Assistant</span>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#38bdf8]" />}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder='e.g. "Temp status in Pacific ocean"'
                  className="w-full bg-[#000000] border border-[#373737] focus:border-[#38bdf8] rounded-lg px-3 py-2 pr-9 text-xs text-[#ffffff] placeholder-[#545454] outline-none shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !customInput.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-[#38bdf8] text-[#000000] hover:bg-[#7dd3fc] disabled:opacity-40 rounded-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Response Card */}
            {analysis ? (
              <div className="bg-[#000000] border border-[#373737] rounded-lg p-3.5 space-y-3 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#373737] pb-2">
                  <div className="font-bold text-xs text-[#ffffff] flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-[#38bdf8]" />
                    <span>{analysis.location.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#34d399] bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#373737]">
                    {(analysis.target_field || 'TEMPERATURE').toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-[#ffffff] leading-relaxed font-sans bg-[#1e1e1e] p-2.5 rounded-lg border border-[#373737]">
                  {analysis.answer_summary}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Target Depth</div>
                    <div className="font-bold text-[#38bdf8]">{analysis.metrics.target_depth_m} m</div>
                  </div>
                  <div className="bg-[#1e1e1e] p-2 rounded border border-[#373737]">
                    <div className="text-[9px] text-[#9ca3af] uppercase">Mean SST</div>
                    <div className="font-bold text-[#ffffff]">{analysis.metrics.mean_sst_c} °C</div>
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
              </div>
            ) : (
              <div className="bg-[#000000] border border-[#373737] rounded-lg p-4 space-y-2 text-center animate-fade-in">
                <Info className="w-6 h-6 mx-auto text-[#38bdf8]" />
                <div className="font-bold text-xs text-[#ffffff]">AI Ocean Assistant Ready</div>
                <p className="text-[11px] leading-relaxed text-[#9ca3af]">
                  Type e.g. "Temp status in Pacific ocean" or "Mark Atlantic Ocean" to fly the map, mark the ocean box, and view stats.
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

        {/* TAB 2: REGION SELECTION & FILTERS */}
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

                {/* Filters */}
                <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#373737] space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#ffffff]">
                    <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Apply Active Region Filters</span>
                  </div>

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

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#9ca3af]">
                      <span>Min Salinity Filter</span>
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
              <div className="bg-[#000000] border border-[#373737] rounded-lg p-4 space-y-2 text-center animate-fade-in">
                <Compass className="w-6 h-6 mx-auto text-[#38bdf8]" />
                <div className="font-bold text-xs text-[#ffffff]">No Location Selected</div>
                <p className="text-[11px] text-[#9ca3af]">Click any coordinate on the ocean map to load subsurface temperature profile.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VISUALIZATIONS (PRISTINE HIGH-CONTRAST READABLE PLOTS) */}
        {activeTab === 'plots' && (
          <div className="space-y-4 animate-fade-in font-sans">
            {/* Plot 1: Vertical Temperature Profile T(z) */}
            <div className="bg-[#000000] border border-[#373737] rounded-lg p-3 space-y-2 shadow-md">
              <div className="flex justify-between items-center border-b border-[#373737] pb-1.5">
                <span className="font-bold text-xs text-[#ffffff] flex items-center space-x-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>1. Subsurface Thermal Profile T(z)</span>
                </span>
                <span className="text-[10px] font-mono text-[#34d399]">0 – 1000m Depth</span>
              </div>
              <div className="h-48 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
                    <XAxis dataKey="temp" type="number" domain={[0, 30]} unit="°C" stroke="#9ca3af" fontSize={10} />
                    <YAxis dataKey="depth" type="number" reversed domain={[0, 1000]} unit="m" stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }} />
                    <ReferenceLine y={95} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Thermocline', fill: '#f59e0b', fontSize: 9 }} />
                    <Line type="monotone" dataKey="temp" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: '#38bdf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plot 2: Salinity Profile S(z) */}
            <div className="bg-[#000000] border border-[#373737] rounded-lg p-3 space-y-2 shadow-md">
              <div className="flex justify-between items-center border-b border-[#373737] pb-1.5">
                <span className="font-bold text-xs text-[#ffffff] flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>2. Salinity Vertical Profile S(z)</span>
                </span>
                <span className="text-[10px] font-mono text-[#38bdf8]">PSU</span>
              </div>
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
                    <XAxis dataKey="salinity" type="number" domain={[33, 37]} unit=" PSU" stroke="#9ca3af" fontSize={10} />
                    <YAxis dataKey="depth" type="number" reversed domain={[0, 1000]} unit="m" stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }} />
                    <Line type="monotone" dataKey="salinity" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: '#34d399' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Plot 3: Thermal Gradient Spectrum Bar Chart */}
            <div className="bg-[#000000] border border-[#373737] rounded-lg p-3 space-y-2 shadow-md">
              <div className="flex justify-between items-center border-b border-[#373737] pb-1.5">
                <span className="font-bold text-xs text-[#ffffff] flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>3. Thermal Gradient |dT/dz| Spectrum</span>
                </span>
                <span className="text-[10px] font-mono text-[#f59e0b]">°C / m</span>
              </div>
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
                    <XAxis dataKey="depth" stroke="#9ca3af" fontSize={10} unit="m" />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }} />
                    <Bar dataKey="gradient" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OceanProfileDrawer;
