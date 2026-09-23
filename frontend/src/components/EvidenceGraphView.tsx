import React from 'react';
import { GitCommit, Database, Cpu, CheckCircle, FileText, ShieldCheck } from 'lucide-react';
import { EvidenceGraph } from '../types';

interface EvidenceGraphViewProps {
  graph?: EvidenceGraph;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({ graph }) => {
  if (!graph) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#000000] text-[#545454] text-xs p-6 space-y-2 select-none font-mono">
        <GitCommit className="w-8 h-8 text-[#373737] animate-pulse" />
        <p>No analysis evidence graph available. Execute a query to view provenance chains.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#000000] p-6 overflow-y-auto space-y-6 select-none font-sans">
      <div className="flex items-center justify-between border-b border-[#373737] pb-4">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-[#6C6C6C]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Reproducible Scientific Evidence Graph
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-white bg-[#1E1E1E] border border-[#373737] px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#6C6C6C]" />
          <span>100% Verifiable Provenance Chain</span>
        </div>
      </div>

      {/* Nodes Trace Timeline */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {graph.nodes.map((node, idx) => (
          <div key={node.id} className="relative flex items-start space-x-4">
            {/* Timeline connector vertical line */}
            {idx < graph.nodes.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#373737]" />
            )}

            <div className="w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#373737] flex items-center justify-center shrink-0 z-10 shadow-lg text-[#6C6C6C]">
              {node.type === 'query' ? (
                <FileText className="w-4 h-4 text-white" />
              ) : node.type === 'data' ? (
                <Database className="w-4 h-4 text-[#6C6C6C]" />
              ) : node.type === 'plan' ? (
                <Cpu className="w-4 h-4 text-[#A3A3A3]" />
              ) : (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>

            <div className="flex-1 bg-[#1E1E1E] border border-[#373737] rounded-lg p-4 space-y-1.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{node.label}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#000000] text-[#6C6C6C] border border-[#373737] uppercase">
                  {node.type}
                </span>
              </div>
              {node.detail && (
                <p className="text-xs text-[#A3A3A3] leading-relaxed font-mono pt-1">{node.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Provenance Box */}
      <div className="max-w-4xl mx-auto bg-[#1E1E1E] border border-[#373737] rounded-lg p-3 flex items-center justify-between text-xs font-mono text-[#545454]">
        <div>
          <span className="font-semibold text-[#6C6C6C]">System Trace:</span> {graph.provenance.system}
        </div>
        <div>
          <span className="font-semibold text-[#6C6C6C]">Audit Timestamp:</span> {graph.provenance.audit_timestamp}
        </div>
      </div>
    </div>
  );
};

