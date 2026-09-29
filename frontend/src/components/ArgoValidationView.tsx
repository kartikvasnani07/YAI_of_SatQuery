// frontend/src/components/ArgoValidationView.tsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { Award, Activity, MapPin } from 'lucide-react';
import { ArgoValidationData } from '../types';
import { fetchArgoValidation } from '../services/api';

interface ArgoValidationViewProps {
  selectedRegion?: string;
}

const FLOATS_LIST = [
  { id: 'ARGO_2901542', name: 'ARGO 2901542 — Central Arabian Sea', region: 'Arabian Sea' },
  { id: 'ARGO_2901588', name: 'ARGO 2901588 — Northern Bay of Bengal', region: 'Bay of Bengal' },
  { id: 'ARGO_4903211', name: 'ARGO 4903211 — Pacific Ocean (Kuroshio Jet)', region: 'Pacific Ocean' },
  { id: 'ARGO_5904512', name: 'ARGO 5904512 — North Atlantic (Gulf Stream)', region: 'Atlantic Ocean' },
  { id: 'ARGO_6902890', name: 'ARGO 6902890 — South Atlantic (Brazil Basin)', region: 'Atlantic Ocean' },
  { id: 'ARGO_3901923', name: 'ARGO 3901923 — Southern Ocean (ACC Sector)', region: 'Southern Ocean' },
  { id: 'ARGO_7901104', name: 'ARGO 7901104 — Arctic Fram Strait Sector', region: 'Arctic Ocean' }
];

export const ArgoValidationView: React.FC<ArgoValidationViewProps> = ({ selectedRegion }) => {
  const [selectedFloatId, setSelectedFloatId] = useState<string>('ARGO_2901542');
  const [valData, setValData] = useState<ArgoValidationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Auto-switch selected ARGO float when user searches/selects a new ocean region!
  useEffect(() => {
    if (!selectedRegion) return;
    const match = FLOATS_LIST.find((f) =>
      selectedRegion.toLowerCase().includes(f.region.toLowerCase()) ||
      f.region.toLowerCase().includes(selectedRegion.toLowerCase())
    );
    if (match) {
      setSelectedFloatId(match.id);
    }
  }, [selectedRegion]);

  useEffect(() => {
    setIsLoading(true);
    fetchArgoValidation(selectedFloatId)
      .then((data) => setValData(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedFloatId]);

  if (isLoading || !valData) {
    return (
      <div className="flex items-center justify-center h-full bg-[#000000] font-sans text-[#545454] text-xs">
        <Activity className="w-4 h-4 animate-spin mr-2 text-[#ffffff]" />
        <span className="text-[#ffffff]">Loading In-Situ ARGO Float Validation Benchmark...</span>
      </div>
    );
  }

  const { float_info, metrics, depth_wise_mae } = valData;

  const depthWiseChartData = [
    { band: '0–50m', mae: depth_wise_mae['0_50m_mae'] },
    { band: '50–100m', mae: depth_wise_mae['50_100m_mae'] },
    { band: '100–200m', mae: depth_wise_mae['100_200m_mae'] },
    { band: '200–500m', mae: depth_wise_mae['200_500m_mae'] },
    { band: '500–1000m', mae: depth_wise_mae['500_1000m_mae'] }
  ];

  return (
    <div className="h-full bg-[#000000] p-6 text-[#ffffff] font-sans text-xs overflow-y-auto space-y-5 select-none">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#373737] pb-3 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#ffffff] tracking-tight">
              ARGO Float Network Validation Benchmark
            </h2>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Active Region Benchmark Target: <strong>{selectedRegion || float_info.region}</strong></span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedFloatId}
            onChange={(e) => setSelectedFloatId(e.target.value)}
            className="bg-[#1e1e1e] border border-[#373737] text-[#ffffff] px-3 py-1.5 rounded-lg text-xs font-mono outline-none cursor-pointer shadow-md"
          >
            {FLOATS_LIST.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Float Specs */}
      <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 shadow-md">
        <div>
          <div className="text-[10px] text-[#9ca3af] font-mono uppercase">Float WMO ID</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{float_info.wmo_id}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ca3af] font-mono uppercase">Platform Type</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{float_info.platform}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ca3af] font-mono uppercase">Target Ocean Basin</div>
          <div className="text-[#38bdf8] font-bold text-xs mt-0.5">{float_info.region}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ca3af] font-mono uppercase">QC Status</div>
          <div className="text-[#34d399] font-bold text-xs mt-0.5">{float_info.qc_status}</div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#9ca3af] uppercase">Root Mean Square Error</div>
          <div className="text-base font-bold text-[#38bdf8]">{metrics.rmse_c} °C</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#9ca3af] uppercase">Mean Absolute Error</div>
          <div className="text-base font-bold text-[#ffffff]">{metrics.mae_c} °C</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#9ca3af] uppercase">Correlation (R)</div>
          <div className="text-base font-bold text-[#34d399]">{metrics.correlation_r}</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#9ca3af] uppercase">R² Coefficient</div>
          <div className="text-base font-bold text-[#f59e0b]">{metrics.r_squared}</div>
        </div>
      </div>

      {/* Depth-wise Error Bar Chart */}
      <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-4 space-y-3 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#ffffff]">Depth-wise Mean Absolute Error (MAE) Breakdown</h3>
          <span className="text-[10px] font-mono text-[#9ca3af]">Target Region: {float_info.region}</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depthWiseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
              <XAxis dataKey="band" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: '#000000', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }} />
              <Bar dataKey="mae" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ArgoValidationView;
