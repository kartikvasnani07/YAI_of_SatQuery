import React from 'react';
import { CheckCircle2, Clock, ShieldX, Cpu } from 'lucide-react';
import { AnalysisPlan, RefusalInfo } from '../types';

interface AnalysisPlanViewProps {
  plan?: AnalysisPlan;
  refusal?: RefusalInfo;
  isLoading: boolean;
}

export const AnalysisPlanView: React.FC<AnalysisPlanViewProps> = ({
  plan,
  refusal,
  isLoading,
}) => {
  if (refusal) {
    return (
      <div className="bg-[#273338] border border-[#618764] rounded p-3 space-y-2">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
          <ShieldX className="w-4 h-4 text-amber-400" />
          <span>GRACEFUL SCIENTIFIC REFUSAL</span>
        </div>
        <p className="text-xs text-amber-200 leading-relaxed font-mono">{refusal.refusal_reason}</p>
        <div className="pt-1 text-[11px] text-amber-300">
          <span className="font-semibold">Recommendation:</span> {refusal.recommendation}
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="bg-[#273338] border border-[#618764] rounded p-3 space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#618764]/40 pb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-[#9CB080]" />
          <h3 className="text-xs font-bold text-[#9CB080] uppercase tracking-wide">
            Analysis Plan ({plan.intent})
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E282C] text-[#9CB080] border border-[#618764]">
          {plan.steps.length} Steps
        </span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {plan.steps.map((step, idx) => (
          <div
            key={step.id || idx}
            className={`flex items-start space-x-2.5 text-xs p-2 rounded transition-all ${
              step.status === 'completed'
                ? 'bg-[#2B5748] border border-[#618764] text-white'
                : 'bg-[#1E282C] text-slate-300'
            }`}
          >
            <div className="pt-0.5 shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-[#9CB080]" />
              ) : step.status === 'in_progress' ? (
                <div className="w-4 h-4 border-2 border-[#9CB080]/30 border-t-[#9CB080] rounded-full animate-spin" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{step.title}</span>
                <span className="text-[10px] font-mono text-[#9CB080] bg-[#273338] px-1.5 py-0.5 rounded ml-2 border border-[#618764]">
                  {step.tool}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
