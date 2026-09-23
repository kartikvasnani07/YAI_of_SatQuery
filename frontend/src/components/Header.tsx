import React, { useState } from 'react';
import { Satellite, FileText, Layers, Sparkles, Image as ImageIcon, Paperclip, X, Play, ChevronDown, PanelLeft, PanelRightClose, PanelRightOpen, Eye } from 'lucide-react';
import { Observation } from '../types';
import { uploadMultimodalFile } from '../services/api';

interface HeaderProps {
  observations: Observation[];
  selectedObsId: string;
  onSelectObs: (id: string) => void;
  onExecuteQuery: (query: string, obsId: string, files: any[]) => void;
  isLoading: boolean;
  hasReport?: boolean;
  onOpenReportPreview: () => void;
  activeView: 'map' | 'comparison' | 'evidence' | 'inspector' | 'terrain';
  onViewChange: (view: 'map' | 'comparison' | 'evidence' | 'inspector' | 'terrain') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

const PRESET_QUERIES = [
  {
    title: "Jaipur, Rajasthan Basin Query",
    obsId: "obs_cartosat_t1",
    query: "Analyze satellite imagery of Jaipur, Rajasthan, specifically the Ramgarh Lake basin. Identify agricultural change and water extent.",
    type: "location"
  },
  {
    title: "Assam Brahmaputra Flood Query",
    obsId: "obs_cartosat_t1",
    query: "Show Brahmaputra river basin flooding in Assam and calculate inundated agriculture.",
    type: "location"
  },
  {
    title: "Optical + SAR VQA Analysis",
    obsId: "obs_risat_sar_t2",
    query: "What is the extent of surface inundation detected in the SAR imagery?",
    type: "vqa"
  },
  {
    title: "Grounding & Segmentation",
    obsId: "obs_cartosat_t2",
    query: "Locate and highlight all flooded agricultural fields adjacent to the river corridor.",
    type: "grounding"
  },
  {
    title: "Scientific Refusal Test (RGB-Only)",
    obsId: "obs_rgb_only",
    query: "Calculate NDVI spectral vegetation index for this true-color image.",
    type: "refusal"
  }
];

export const Header: React.FC<HeaderProps> = ({
  observations,
  selectedObsId,
  onSelectObs,
  onExecuteQuery,
  isLoading,
  hasReport,
  onOpenReportPreview,
  activeView,
  onViewChange,
  isSidebarOpen,
  onToggleSidebar,
  isDrawerOpen,
  onToggleDrawer,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const res = await uploadMultimodalFile(file);
      setAttachedFiles((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setQueryInput(preset.query);
    onSelectObs(preset.obsId);
    setShowPresets(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() && !isLoading) {
      onExecuteQuery(queryInput, selectedObsId, attachedFiles);
      setQueryInput('');
      setAttachedFiles([]);
    }
  };

  return (
    <header className="bg-[#000000] border-b border-[#373737] flex flex-col z-30 shrink-0 select-none">
      {/* Top Navbar Row */}
      <div className="h-12 px-4 flex items-center justify-between">
        {/* Left Title & Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            title="Toggle Projects & Chat History Sidebar"
            className="p-1 rounded bg-[#1E1E1E] border border-[#373737] text-[#545454] hover:text-white transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#1E1E1E] border border-[#373737] flex items-center justify-center text-[#6C6C6C]">
              <Satellite className="w-3.5 h-3.5" />
            </div>
            <h1 className="font-extrabold text-xs tracking-wider text-white font-mono">SAT QUERY AI</h1>
          </div>
        </div>

        {/* Dataset Picker & Workspace View Tabs */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#1E1E1E] border border-[#373737] rounded px-2 py-0.5 text-xs">
            <Layers className="w-3 h-3 text-[#545454]" />
            <span className="text-[#545454]">Sensor:</span>
            <select
              value={selectedObsId}
              onChange={(e) => onSelectObs(e.target.value)}
              className="bg-transparent text-[#6C6C6C] font-semibold focus:outline-none cursor-pointer"
            >
              {observations.map((obs) => (
                <option key={obs.id} value={obs.id} className="bg-[#1E1E1E] text-slate-200">
                  {obs.name} ({obs.modality.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-[#1E1E1E] border border-[#373737] rounded p-0.5 font-mono">
            <button
              onClick={() => onViewChange('map')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeView === 'map'
                  ? 'bg-[#373737] text-white shadow-sm'
                  : 'text-[#545454] hover:text-white'
              }`}
            >
              2D Map
            </button>
            <button
              onClick={() => onViewChange('evidence')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeView === 'evidence'
                  ? 'bg-[#373737] text-white shadow-sm'
                  : 'text-[#545454] hover:text-white'
              }`}
            >
              Evidence Graph
            </button>
            <button
              onClick={() => onViewChange('inspector')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeView === 'inspector'
                  ? 'bg-[#373737] text-white shadow-sm'
                  : 'text-[#545454] hover:text-white'
              }`}
            >
              Inspector
            </button>
            <button
              onClick={() => onViewChange('terrain')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeView === 'terrain'
                  ? 'bg-[#373737] text-white shadow-sm'
                  : 'text-[#545454] hover:text-white'
              }`}
            >
              DEM Profile
            </button>
          </div>
        </div>


        {/* Right Actions (Report Preview Modal Trigger) */}
        <div className="flex items-center space-x-2">
          {hasReport && (
            <button
              onClick={onOpenReportPreview}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#1E1E1E] hover:bg-[#373737] text-[#6C6C6C] hover:text-white border border-[#373737] text-xs font-semibold transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Report</span>
            </button>
          )}
          <button
            onClick={onToggleDrawer}
            title="Toggle Right Panel"
            className="p-1 rounded bg-[#1E1E1E] border border-[#373737] text-[#545454] hover:text-white transition-colors"
          >
            {isDrawerOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Central Query Input Bar (CLEAN & EMPTY BY DEFAULT) */}
      <div className="bg-[#1E1E1E] border-t border-[#373737] px-6 py-2 flex flex-col space-y-2">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Preset Queries Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-2.5 py-1.5 bg-[#000000] border border-[#373737] hover:bg-[#373737] rounded text-xs font-semibold text-[#6C6C6C] flex items-center space-x-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6C6C6C]" />
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-[#545454]" />
            </button>

            {showPresets && (
              <div className="absolute top-10 left-0 w-80 bg-[#1E1E1E] border border-[#373737] rounded shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                <div className="text-[10px] font-bold text-[#545454] px-2 pt-1 uppercase tracking-wider font-mono">
                  Benchmark Queries
                </div>
                {PRESET_QUERIES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-2 rounded hover:bg-[#373737] text-xs transition-all space-y-0.5 border border-transparent"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{preset.title}</span>
                      <span className="text-[9px] px-1 rounded bg-[#000000] text-[#6C6C6C] border border-[#373737]">
                        {preset.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#545454] line-clamp-1 font-sans">{preset.query}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Central Prompt Input Bar (EMPTY BY DEFAULT!) */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask a question, mention a city/region (e.g., Jaipur, Rajasthan, Assam, Delhi, Mumbai, Kerala), or formulate an EO query..."
              className="w-full bg-[#000000] border border-[#373737] rounded pl-3 pr-10 py-1.5 text-xs text-white placeholder-[#545454] focus:outline-none focus:border-[#6C6C6C] transition-all font-sans"
            />
            {/* File Attachment Button */}
            <label
              title="Attach File (JSON, CSV, PDF, Excel, TXT, Map Images, Graphs)"
              className="absolute right-2 text-[#545454] hover:text-white cursor-pointer p-1 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".json,.csv,.pdf,.xlsx,.xls,.txt,.png,.jpg,.jpeg,.tif,.tiff"
                className="hidden"
              />
            </label>
          </div>

          {/* Execute Button */}
          <button
            type="submit"
            disabled={isLoading || !queryInput.trim()}
            className="px-4 py-1.5 rounded bg-[#373737] hover:bg-[#545454] disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 border border-[#6C6C6C]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </form>

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="flex items-center space-x-2 pt-0.5 overflow-x-auto">
            <span className="text-[10px] font-semibold text-[#545454] uppercase font-mono">Attached:</span>
            {attachedFiles.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-1.5 bg-[#000000] border border-[#373737] px-2 py-0.5 rounded text-xs text-slate-200 shrink-0"
              >
                {f.file_type === 'map_image_or_graph' ? (
                  <ImageIcon className="w-3 h-3 text-[#6C6C6C]" />
                ) : (
                  <FileText className="w-3 h-3 text-amber-400" />
                )}
                <span className="font-mono text-[11px]">{f.filename}</span>
                <span className="text-[9px] font-mono text-[#545454] uppercase bg-[#1E1E1E] px-1 rounded border border-[#373737]">
                  {f.extension}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="text-[#545454] hover:text-red-400 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
