// frontend/src/components/EmbeddingExplorerView.tsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Cpu } from 'lucide-react';
import { EmbeddingSpaceResponse, EmbeddingPoint } from '../types';
import { fetchEmbeddings } from '../services/api';

export const EmbeddingExplorerView: React.FC = () => {
  const [embData, setEmbData] = useState<EmbeddingSpaceResponse | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint | null>(null);

  useEffect(() => {
    fetchEmbeddings()
      .then((data) => {
        setEmbData(data);
        if (data.points.length > 0) setSelectedPoint(data.points[0]);
      })
      .catch(console.error);
  }, []);

  if (!embData) {
    return (
      <div className="flex items-center justify-center h-full bg-[#000000] font-sans text-[#545454] text-xs">
        <span className="text-[#ffffff]">Loading Latent Ocean State Embeddings...</span>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#000000] p-6 text-[#ffffff] font-sans text-xs overflow-y-auto space-y-5 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#373737] pb-3 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#ffffff]" />
            <h2 className="text-base font-bold text-[#ffffff] tracking-tight">
              Latent Ocean State Embedding Space
            </h2>
          </div>
          <p className="text-xs text-[#545454] mt-0.5">
            2D PCA projection of 64-dimensional learned ocean state vectors.
          </p>
        </div>
      </div>

      {/* Embedding Specs */}
      <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono shadow-md">
        <div>
          <div className="text-[10px] text-[#545454] uppercase">Embedding Dimension</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{embData.embedding_dimension} Channels</div>
        </div>
        <div>
          <div className="text-[10px] text-[#545454] uppercase">Projection Method</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{embData.projection_method}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#545454] uppercase">Temporal Window</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">T-2, T-1, T</div>
        </div>
        <div>
          <div className="text-[10px] text-[#545454] uppercase">Total Vectors</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{embData.total_embeddings} Vectors</div>
        </div>
      </div>

      {/* Main Scatter & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#1e1e1e] border border-[#373737] rounded-lg p-4 space-y-2 shadow-md">
          <div className="text-xs font-semibold text-[#ffffff]">
            PC1 vs PC2 Latent Cluster Projection
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
                <XAxis dataKey="pc1" type="number" name="PC1" stroke="#545454" fontSize={10} />
                <YAxis dataKey="pc2" type="number" name="PC2" stroke="#545454" fontSize={10} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#373737', color: '#ffffff', borderRadius: '6px' }} />
                <Scatter
                  name="Ocean Embeddings"
                  data={embData.points}
                  fill="#ffffff"
                  onClick={(pt) => setSelectedPoint(pt.payload)}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vector Inspector */}
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-4 space-y-3 font-mono shadow-md">
          <div className="border-b border-[#373737] pb-2 font-bold text-[#ffffff] text-xs">
            Vector Details
          </div>

          {selectedPoint ? (
            <div className="space-y-2 text-xs">
              <div className="bg-[#000000] p-2.5 rounded-lg border border-[#373737] space-y-0.5">
                <div className="text-[10px] text-[#545454]">VECTOR ID</div>
                <div className="text-[#ffffff] font-bold">{selectedPoint.id}</div>
              </div>
              <div className="bg-[#000000] p-2.5 rounded-lg border border-[#373737] space-y-0.5">
                <div className="text-[10px] text-[#545454]">REGION CLUSTER</div>
                <div className="text-[#ffffff] font-bold">{selectedPoint.region}</div>
              </div>
              <div className="bg-[#000000] p-2.5 rounded-lg border border-[#373737] space-y-0.5">
                <div className="text-[10px] text-[#545454]">COORDINATES</div>
                <div className="text-[#ffffff]">{selectedPoint.latitude}°N, {selectedPoint.longitude}°E</div>
              </div>
              <div className="bg-[#000000] p-2.5 rounded-lg border border-[#373737] space-y-0.5">
                <div className="text-[10px] text-[#545454]">DATA COMPLETENESS</div>
                <div className="text-emerald-400 font-bold">{selectedPoint.completeness_pct}% Available</div>
              </div>
            </div>
          ) : (
            <div className="text-[#545454] text-xs">Click a scatter point to inspect vector.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbeddingExplorerView;
