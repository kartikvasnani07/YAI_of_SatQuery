import React from 'react';
import { Award, ShieldCheck, ExternalLink } from 'lucide-react';
import { AnalysisResponse } from '../types';

interface ResultSummaryProps {
  analysis?: AnalysisResponse;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ analysis }) => {
  if (!analysis) return null;

  if (analysis.status === 'refused' && analysis.refusal) {
    return (
      <div className="bg-[#1E1E1E] border border-[#373737] rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Scientific Refusal</h4>
        <p className="text-xs text-[#A3A3A3] leading-relaxed font-mono">{analysis.refusal.refusal_reason}</p>
      </div>
    );
  }

  const result = analysis.result;

  const handleOpenReportTab = () => {
    if (analysis.id) {
      window.open(`/api/reports/${analysis.id}/view`, '_blank');
    }
  };

  return (
    <div className="bg-[#000000] border border-[#373737] rounded-lg p-3.5 space-y-3 shadow-xl">
      {/* Title & Confidence */}
      <div className="flex items-center justify-between border-b border-[#373737] pb-2">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-[#6C6C6C]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Verified Answer & Metrics
          </h3>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#1E1E1E] border border-[#373737] text-[10px] font-mono text-[#6C6C6C]">
          <ShieldCheck className="w-3 h-3 text-[#6C6C6C]" />
          <span>Conf: {((result?.confidence || 0.95) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Answer Summary Card */}
      <div className="bg-[#1E1E1E] border border-[#373737] rounded p-3 text-xs text-slate-200 leading-relaxed font-sans">
        <p className="font-medium text-white">{analysis.answer_summary}</p>
      </div>

      {/* Metrics Grid */}
      {result?.metrics && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#545454] uppercase tracking-wider font-mono">Geospatial Metrics:</span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(result.metrics).map(([k, v]) => (
              <div key={k} className="bg-[#1E1E1E] border border-[#373737] rounded p-2 text-xs">
                <div className="text-[9px] text-[#545454] uppercase font-mono truncate">{k.replace(/_/g, ' ')}</div>
                <div className="font-bold text-white font-mono text-xs mt-0.5 truncate">{String(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Report in New Tab Button */}
      <button
        type="button"
        onClick={handleOpenReportTab}
        className="w-full py-2 px-3 rounded bg-[#1E1E1E] hover:bg-[#373737] border border-[#373737] text-white hover:text-white text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
      >
        <ExternalLink className="w-3.5 h-3.5 text-[#6C6C6C]" />
        <span>Export PDF Report (New Tab)</span>
      </button>
    </div>
  );
};

