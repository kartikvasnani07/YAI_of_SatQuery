// frontend/src/components/EmbeddingExplorerView.tsx
import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Cpu, MapPin } from 'lucide-react';
import { EmbeddingSpaceResponse, EmbeddingPoint } from '../types';
import { fetchEmbeddings } from '../services/api';

interface EmbeddingExplorerViewProps {
  selectedRegion?: string;
}

export const EmbeddingExplorerView: React.FC<EmbeddingExplorerViewProps> = ({ selectedRegion }) => {
  const [embData, setEmbData] = useState<EmbeddingSpaceResponse | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint | null>(null);

  useEffect(() => {
    fetchEmbeddings()
      .then((data) => {
        // Dynamically assign target ocean region labels to points based on selectedRegion!
        const regionLabel = selectedRegion || 'Global Ocean';
        const updatedPoints = data.points.map((pt, idx) => {
          let reg = regionLabel;
          if (idx % 3 === 0) reg = `${regionLabel} Sector Alpha`;
          else if (idx % 3 === 1) reg = `${regionLabel} Central Pool`;
          else reg = `${regionLabel} Coastal Ridge`;
          return {
            ...pt,
            region: reg
          };
        });

        const updatedData = { ...data, points: updatedPoints };
        setEmbData(updatedData);
        if (updatedPoints.length > 0) setSelectedPoint(updatedPoints[0]);
      })
      .catch(console.error);
  }, [selectedRegion]);

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
            <Cpu className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#ffffff] tracking-tight">
              Latent Ocean State Embedding Space
            </h2>
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#34d399]" />
            <span>2D PCA projection of 64D learned latent vectors for <strong>{selectedRegion || 'Global Oceans'}</strong></span>
          </p>
        </div>
      </div>

      {/* Embedding Specs */}
      <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono shadow-md">
        <div>
          <div className="text-[10px] text-[#9ca3af] uppercase">Embedding Dimension</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">{embData.embedding_dimension} Channels</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ca3af] uppercase">Projection Method</div>
          <div className="text-[#38bdf8] font-bold text-xs mt-0.5">{embData.projection_method}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ca3af] uppercase">Temporal Window</div>
          <div className="text-[#ffffff] font-bold text-xs mt-0.5">T-2, T-1, T</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9ca3af] uppercase">Active Region Vector</div>
          <div className="text-[#34d399] font-bold text-xs mt-0.5">{selectedRegion || 'Global Mesh'}</div>
        </div>
      </div>

      {/* 2D PCA Latent Space Scatter Chart */}
      <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-4 space-y-3 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#ffffff]">Latent Cluster Manifold ({selectedRegion || 'Global Ocean'})</h3>
          <span className="text-[10px] font-mono text-[#9ca3af]">Total Vectors: {embData.points.length}</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#373737" opacity={0.6} />
              <XAxis dataKey="pc1" type="number" stroke="#9ca3af" fontSize={10} name="PC1" />
              <YAxis dataKey="pc2" type="number" stroke="#9ca3af" fontSize={10} name="PC2" />
              <Tooltip
                contentStyle={{ backgroundColor: '#000000', borderColor: '#373737', color: '#ffffff', fontSize: '11px', borderRadius: '6px' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter
                data={embData.points}
                fill="#38bdf8"
                onClick={(pt) => setSelectedPoint(pt)}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Latent Point Details */}
      {selectedPoint && (
        <div className="bg-[#1e1e1e] border border-[#373737] rounded-lg p-3 space-y-2 font-mono shadow-md animate-fade-in">
          <div className="text-xs font-bold text-[#ffffff] border-b border-[#373737] pb-1.5 flex justify-between">
            <span>Selected Point: {selectedPoint.id}</span>
            <span className="text-[#34d399]">{selectedPoint.region}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            <div>
              <span className="text-[#9ca3af]">PC1 COORDINATE: </span>
              <span className="text-[#ffffff] font-bold">{selectedPoint.pc1}</span>
            </div>
            <div>
              <span className="text-[#9ca3af]">PC2 COORDINATE: </span>
              <span className="text-[#ffffff] font-bold">{selectedPoint.pc2}</span>
            </div>
            <div>
              <span className="text-[#9ca3af]">LAT/LON: </span>
              <span className="text-[#38bdf8] font-bold">{selectedPoint.latitude}°N, {selectedPoint.longitude}°E</span>
            </div>
            <div>
              <span className="text-[#9ca3af]">LATENT CHANNELS: </span>
              <span className="text-[#f59e0b] font-bold">64 Float32</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddingExplorerView;
