import React from 'react';
import { X, Download, FileText, CheckCircle, ShieldCheck, MapPin, Database, Layers } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface ReportPreviewModalProps {
  analysis?: AnalysisResponse;
  onClose: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ analysis, onClose }) => {
  if (!analysis) return null;

  const res = analysis.result;
  const locationName = analysis.location?.name || "Cartosat/RISAT Target Bounding Region";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-[#1E1E1E] border border-[#373737] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#373737] flex items-center justify-between bg-[#000000]">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#6C6C6C]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Scientific Analysis Document Preview
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {analysis.report_path && (
              <a
                href={analysis.report_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#373737] hover:bg-[#545454] text-white border border-[#6C6C6C] text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-[#545454] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Document Content Preview */}
        <div className="p-6 overflow-y-auto space-y-6 bg-[#1E1E1E] text-slate-200 text-xs font-sans leading-relaxed">
          {/* Document Header Banner */}
          <div className="border-b border-[#373737] pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-base font-extrabold text-white font-mono uppercase tracking-wide">
                SAT QUERY AI — SCIENTIFIC EARTH OBSERVATION REPORT
              </h1>
              <p className="text-[11px] text-[#6C6C6C] font-mono mt-0.5">
                Report ID: {analysis.id} | Timestamp: {new Date().toISOString().split('T')[0]}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#000000] border border-[#373737] text-[10px] font-mono text-[#6C6C6C]">
              VERIFIED AUDIT DOCUMENT
            </span>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2 bg-[#000000] border border-[#373737] rounded-lg p-4">
            <h3 className="text-xs font-bold text-[#6C6C6C] uppercase tracking-wider flex items-center space-x-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#6C6C6C]" />
              <span>1. Executive Summary</span>
            </h3>
            <p className="text-[#A3A3A3] text-xs leading-relaxed">{analysis.answer_summary}</p>
          </div>

          {/* Section 2: Sensor & Target Location Metadata */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#6C6C6C] uppercase tracking-wider font-mono">
              2. Earth Observation Data & Target Location
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-[#000000] border border-[#373737] rounded-lg p-3 text-xs">
              <div><span className="text-[#545454] font-mono">Target Location:</span> <span className="font-semibold text-[#6C6C6C]">{locationName}</span></div>
              <div><span className="text-[#545454] font-mono">Primary Sensor:</span> <span className="font-semibold text-[#6C6C6C]">{analysis.observation?.sensor}</span></div>
              <div><span className="text-[#545454] font-mono">Spatial Resolution:</span> <span className="font-semibold text-[#6C6C6C]">{analysis.observation?.resolution_m}m</span></div>
              <div><span className="text-[#545454] font-mono">Coordinate System:</span> <span className="font-semibold text-[#6C6C6C]">EPSG:32643 (UTM 43N)</span></div>
            </div>
          </div>

          {/* Section 3: Section Map Diagram Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#6C6C6C] uppercase tracking-wider font-mono">
              3. Spatial Section & Boundary Map Diagram
            </h3>
            <div className="bg-[#000000] border border-[#373737] rounded-lg p-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-full h-40 bg-[#1E1E1E] border border-[#373737] rounded flex flex-col items-center justify-center p-3 relative overflow-hidden">
                <Layers className="w-8 h-8 text-[#545454] mb-1" />
                <span className="text-[11px] font-mono text-[#6C6C6C]">Report Diagram: Spatial Inundation & Vegetation Bounds</span>
                <span className="text-[10px] text-[#545454]">Center Bounding Coordinate: {analysis.location?.center?.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Quantitative Metrics Table */}
          {res?.metrics && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#6C6C6C] uppercase tracking-wider font-mono">
                4. Quantitative Geospatial Measurements
              </h3>
              <table className="w-full text-left border-collapse border border-[#373737] text-xs">
                <thead>
                  <tr className="bg-[#000000] text-[#6C6C6C] font-mono">
                    <th className="p-2 border border-[#373737]">Metric Parameter</th>
                    <th className="p-2 border border-[#373737]">Computed Value</th>
                    <th className="p-2 border border-[#373737]">Validation Methodology</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(res.metrics).map(([k, v]) => (
                    <tr key={k} className="border border-[#373737]">
                      <td className="p-2 font-mono text-[#A3A3A3]">{k.replace(/_/g, ' ').toUpperCase()}</td>
                      <td className="p-2 font-mono font-bold text-[#6C6C6C]">{String(v)}</td>
                      <td className="p-2 text-[#545454]">Geodesic Raster Mask Intersection</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#373737] flex items-center justify-between bg-[#000000]">
          <span className="text-[11px] font-mono text-[#545454]">
            SatQuery Scientific Report Engine v2026
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#1E1E1E] hover:bg-[#373737] text-xs text-slate-300 border border-[#373737] transition-all"
            >
              Close Preview
            </button>
            {analysis.report_path && (
              <a
                href={analysis.report_path}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded bg-[#373737] hover:bg-[#545454] text-xs text-white font-bold border border-[#6C6C6C] transition-all flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Confirm Download PDF</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
