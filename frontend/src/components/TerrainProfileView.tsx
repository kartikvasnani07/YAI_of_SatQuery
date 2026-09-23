import React, { useEffect, useState } from 'react';
import { Mountain, Activity, MapPin } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchTerrainProfile } from '../services/api';

interface TerrainProfileViewProps {
  location?: any;
}

export const TerrainProfileView: React.FC<TerrainProfileViewProps> = ({ location }) => {
  const [profileData, setProfileData] = useState<any>(null);

  const locationName = location?.name || "Target Regional Transect";
  const elevationBase = location?.elevation_base || 300.0;

  useEffect(() => {
    fetchTerrainProfile(0, 0, 511, 511, elevationBase)
      .then(setProfileData)
      .catch(console.error);
  }, [elevationBase]);

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-full bg-[#000000] text-xs font-mono text-[#545454]">
        Loading Target Regional DEM Elevation Profile...
      </div>
    );
  }

  return (
    <div className="h-full bg-[#000000] p-6 space-y-6 overflow-y-auto select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#373737] pb-4">
        <div className="flex items-center space-x-2">
          <Mountain className="w-5 h-5 text-[#6C6C6C]" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              DEM Topographic Elevation Profile
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-[#545454]">
              <MapPin className="w-3 h-3 text-[#545454]" />
              <span>{locationName}</span>
            </div>
          </div>
        </div>

        {/* Quantitative Elevation Metrics */}
        <div className="flex items-center space-x-6 text-xs font-mono">
          <div>
            <span className="text-[#545454]">MAX ELEV:</span>{' '}
            <span className="text-[#FFFFFF] font-bold">{profileData.max_elevation}m</span>
          </div>
          <div>
            <span className="text-[#545454]">MEAN ELEV:</span>{' '}
            <span className="text-[#6C6C6C] font-bold">{profileData.mean_elevation || profileData.elevation_base}m</span>
          </div>
          <div>
            <span className="text-[#545454]">MIN ELEV:</span>{' '}
            <span className="text-[#A3A3A3] font-bold">{profileData.min_elevation}m</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="h-80 bg-[#1E1E1E] border border-[#373737] rounded-xl p-5 shadow-2xl space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#545454] uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-[#6C6C6C]" />
            <span>Digital Elevation Model Cross-Section (5.12 km Transect)</span>
          </span>
          <span>Sampling Interval: 51.2m</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profileData.profile}>
              <defs>
                <linearGradient id="elevationDarkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C6C6C" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#1E1E1E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#373737" />
              <XAxis
                dataKey="distance_m"
                stroke="#545454"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}km`}
              />
              <YAxis
                stroke="#545454"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                unit="m"
                domain={['dataMin - 15', 'dataMax + 15']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  borderColor: '#373737',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
              <Area
                type="monotone"
                dataKey="elevation_m"
                stroke="#FFFFFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#elevationDarkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

