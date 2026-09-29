// frontend/src/components/OceanQueryBar.tsx
import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface OceanQueryBarProps {
  onExecuteQuery: (query: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUERIES = [
  "Show temperature at 100 m in Arabian Sea",
  "Plot vertical profile at 15°N, 72°E",
  "Show Sea Level Anomaly in Bay of Bengal",
  "Compare OceanEmbed with ARGO observations"
];

export const OceanQueryBar: React.FC<OceanQueryBarProps> = ({
  onExecuteQuery,
  isLoading
}) => {
  const [query, setQuery] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onExecuteQuery(query.trim());
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    onExecuteQuery(sample);
  };

  return (
    <div className="bg-[#1b263b]/95 border border-[#415a77] backdrop-blur-md rounded-lg p-2.5 shadow-lg space-y-1.5 select-none font-sans">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#778da9] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Ocean Query... e.g. 'Show Sea Level Anomaly in Bay of Bengal'"
            className="w-full bg-[#0d1b2a] border border-[#415a77] focus:border-[#778da9] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#e0e1dd] placeholder-[#778da9] outline-none transition-all font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-[#415a77] hover:bg-[#778da9] disabled:opacity-50 text-[#e0e1dd] px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isLoading ? 'Executing...' : 'Query'}</span>
        </button>
      </form>

      {/* Clean Suggestion Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-[10px] scrollbar-none font-mono">
        <span className="text-[#778da9] shrink-0">Try:</span>
        {SAMPLE_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectSample(q)}
            className="px-2 py-0.5 bg-[#0d1b2a] border border-[#415a77]/60 hover:border-[#778da9] text-[#778da9] hover:text-[#e0e1dd] rounded transition-all shrink-0"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
