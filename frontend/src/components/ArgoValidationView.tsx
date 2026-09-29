// frontend/src/components/ArgoValidationView.tsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { Award, Activity } from 'lucide-react';
import { ArgoValidationData } from '../types';
import { fetchArgoValidation } from '../services/api';

const FLOATS_LIST = [
  { id: 'ARGO_2901542', name: 'ARGO 2901542 — Central Arabian Sea' },
  { id: 'ARGO_2901588', name: 'ARGO 2901588 — Northern Bay of Bengal' },
  { id: 'ARGO_6903211', name: 'ARGO 6903211 — Sri Lanka East Coast' },
  { id: 'ARGO_2902771', name: 'ARGO 2902771 — Equatorial Indian Ocean' }
];

export const ArgoValidationView: React.FC = () => {
  const [selectedFloatId, setSelectedFloatId] = useState<string>('ARGO_2901542');
  const [valData, setValData] = useState<ArgoValidationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
            <Award className="w-5 h-5 text-[#ffffff]" />
            <h2 className="text-base font-bold text-[#ffffff] tracking-tight">
              ARGO Float Network Validation Benchmark
            </h2>
          </div>
          <p className="text-xs text-[#545454] mt-0.5">
            Validation of OceanEmbed depth predictions against in-situ physical ARGO float observations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedFloatId}
            onChange={(e) => setSelectedFloatId(e.target.value)}
            className="bg-[#1e1e1e] border border-[#373737] text-[#ffffff] px-3 py-1 rounded-lg text-xs font-mono outline-none cursor-pointer shadow-md"
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
          <div className="text-[10px] text-[#545454] font-mono uppercase">Float WMO ID</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{float_info.wmo_id}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#545454] font-mono uppercase">Platform Type</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{float_info.platform}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#545454] font-mono uppercase">Data Center</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{float_info.data_center}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#545454] font-mono uppercase">QC Status</div>
          <div className="text-emerald-400 font-bold text-xs mt-0.5">{float_info.qc_status}</div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#545454] uppercase">RMSE</div>
          <div className="text-xl font-bold text-[#ffffff]">{metrics.rmse_c} °C</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#545454] uppercase">MAE</div>
          <div className="text-xl font-bold text-[#ffffff]">{metrics.mae_c} °C</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#545454] uppercase">Bias</div>
          <div className="text-xl font-bold text-[#ffffff]">{metrics.bias_c} °C</div>
        </div>
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-1 shadow-md">
          <div className="text-[10px] text-[#545454] uppercase">Pearson R</div>
          <div className="text-xl font-bold text-[#ffffff]">{metrics.correlation_r}</div>
        </div>
      </div>

      {/* Scientific Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-4 space-y-2 shadow-md">
          <div className="text-xs font-bold text-[#ffffff] uppercase tracking-wider">
            In-Situ ARGO Float Comparison
          </div>
          <img
            src={`/api/ocean/graph/argo?float_id=${selectedFloatId}&date=2026-01-15`}
            alt="ARGO Comparison Plot"
            className="w-full rounded-lg border border-[#373737]"
          />
        </div>

        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-4 space-y-2 shadow-md">
          <div className="text-xs font-bold text-[#ffffff] uppercase tracking-wider">
            Depth-Wise Error Distribution (MAE °C)
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depthWiseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#373737" />
                <XAxis dataKey="band" stroke="#545454" fontSize={10} />
                <YAxis domain={[0, 1.0]} unit="°C" stroke="#545454" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }} />
                <Bar dataKey="mae" name="MAE (°C)" fill="#545454" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgoValidationView;
