import React, { useState } from 'react';

interface TimelineSliderProps {
  onSelectTimestamp?: (timestampId: string) => void;
}

const TIMESTAMPS = [
  { id: 'obs_cartosat_t1', label: 'T1 Baseline', date: '2026-01-15' },
  { id: 'obs_cartosat_t2', label: 'T2 Peak Event', date: '2026-03-20' },
  { id: 'obs_cartosat_t3', label: 'T3 Recovery (3M)', date: '2026-06-15' }
];

export const TimelineSlider: React.FC<TimelineSliderProps> = ({ onSelectTimestamp }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    if (onSelectTimestamp) {
      onSelectTimestamp(TIMESTAMPS[idx].id);
    }
  };

  return (
    <div className="bg-[#000000] border-t border-[#373737] px-4 py-1.5 flex items-center justify-center shrink-0 select-none">
      <div className="flex items-center space-x-3 max-w-xl w-full">
        {TIMESTAMPS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => handleSelect(idx)}
            className={`flex-1 text-center py-1 px-2 rounded border transition-all text-xs font-mono ${
              activeIdx === idx
                ? 'bg-[#373737] border-[#6C6C6C] text-white font-bold'
                : 'bg-[#1E1E1E] border-[#373737] text-[#545454] hover:text-slate-200'
            }`}
          >
            <span>{t.date}</span>
            <span className="text-[10px] text-[#6C6C6C] block truncate">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
