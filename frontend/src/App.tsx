// frontend/src/App.tsx
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { DepthControlBar } from './components/DepthControlBar';
import { OceanExplorerMap } from './components/OceanExplorerMap';
import { Ocean3DViewer } from './components/Ocean3DViewer';
import { OceanProfileDrawer } from './components/OceanProfileDrawer';
import { ArgoValidationView } from './components/ArgoValidationView';
import { EmbeddingExplorerView } from './components/EmbeddingExplorerView';
import { OverviewDashboard } from './components/OverviewDashboard';

import { PointProfile, GeoJSONCollection, OceanAnalysisResponse, DensityField, SelectedRegionBounds } from './types';
import {
  fetchReconstructionSlice,
  fetchPointProfile,
  fetchArgoLocations,
  fetchBathymetry,
  submitOceanQuery
} from './services/api';

import { OceanCurrentsTidesView } from './components/OceanCurrentsTidesView';

export function App() {
  const [activeView, setActiveView] = useState<'overview' | 'map' | 'currents' | '3d' | 'argo' | 'embedding'>('map');
  const [currentDepth, setCurrentDepth] = useState<number>(100);
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [activeField, setActiveField] = useState<DensityField>('temperature');

  // Datasets state
  const [gridData, setGridData] = useState<GeoJSONCollection | undefined>(undefined);
  const [argoData, setArgoData] = useState<GeoJSONCollection | undefined>(undefined);
  const [bathymetryData, setBathymetryData] = useState<GeoJSONCollection | undefined>(undefined);

  // Selected Location, Camera Center & Selected Region Box state
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lon: number }>({ lat: 15.25, lon: 72.50 });
  const [selectedCenter, setSelectedCenter] = useState<{ lat: number; lon: number; zoom?: number }>({ lat: 15.0, lon: 75.0, zoom: 5.2 });
  const [selectedRegionBounds, setSelectedRegionBounds] = useState<SelectedRegionBounds | null>(null);

  const [pointProfile, setPointProfile] = useState<PointProfile | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<OceanAnalysisResponse | undefined>(undefined);

  // Initial Data Fetching
  useEffect(() => {
    fetchArgoLocations().then(setArgoData).catch(console.error);
    fetchBathymetry().then(setBathymetryData).catch(console.error);

    fetchPointProfile(15.25, 72.50, selectedDate)
      .then(setPointProfile)
      .catch(console.error);
  }, []);

  // Fetch 2D grid slice on depth, date, field, or camera center change
  useEffect(() => {
    fetchReconstructionSlice(currentDepth, selectedDate, activeField, selectedCenter.lat, selectedCenter.lon, analysis?.location?.name || 'North Indian Ocean')
      .then(setGridData)
      .catch(console.error);
  }, [currentDepth, selectedDate, activeField, selectedCenter, analysis]);

  // Handle Point-Click on Ocean Map
  const handleMapClickPoint = async (lat: number, lon: number) => {
    setSelectedPoint({ lat, lon });
    try {
      const prof = await fetchPointProfile(lat, lon, selectedDate);
      setPointProfile(prof);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle AI Assistant / Multi-Ocean Query Execution
  const handleExecuteQuery = async (queryStr: string) => {
    setIsLoading(true);
    try {
      const res = await submitOceanQuery(queryStr, currentDepth, selectedPoint.lat, selectedPoint.lon, selectedDate);
      setAnalysis(res);

      if (res.grid) {
        setGridData(res.grid);
      }
      if (res.target_field) {
        setActiveField(res.target_field as DensityField);
      }
      if (res.depth_m) {
        setCurrentDepth(res.depth_m);
      }
      if (res.profile) {
        setPointProfile(res.profile);
      }
      if (res.location && res.location.center) {
        const [lon, lat] = res.location.center;
        setSelectedPoint({ lat, lon });
        setSelectedCenter({ lat, lon, zoom: res.location.zoom || 5.2 });
      }
    } catch (e) {
      console.error('Query error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    window.open('/api/reports/report_latest/view', '_blank');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#000000] text-[#ffffff] overflow-hidden font-sans relative select-none">
      {/* Top Header Navbar */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onExportPdfReport={handleExportReport}
      />

      {/* Main Workstation Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Center View Stage */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#000000]">
          {activeView === 'overview' && (
            <OverviewDashboard
              onNavigateView={setActiveView}
              onSelectDepth={setCurrentDepth}
              onSelectField={setActiveField}
            />
          )}

          {activeView === 'map' && (
            <div className="flex-1 relative overflow-hidden">
              <OceanExplorerMap
                gridData={gridData}
                argoData={argoData}
                bathymetryData={bathymetryData}
                onMapClickPoint={handleMapClickPoint}
                selectedPoint={selectedPoint}
                selectedCenter={selectedCenter}
                activeField={activeField}
                onFieldChange={setActiveField}
                selectedRegionBounds={selectedRegionBounds}
                onSelectRegionBounds={setSelectedRegionBounds}
              />
            </div>
          )}

          {activeView === 'currents' && (
            <div className="flex-1 relative overflow-hidden">
              <OceanCurrentsTidesView selectedDate={selectedDate} />
            </div>
          )}

          {activeView === '3d' && (
            <div className="flex-1 relative overflow-hidden">
              <Ocean3DViewer
                currentDepth={currentDepth}
                onDepthChange={setCurrentDepth}
                selectedRegionBounds={selectedRegionBounds}
              />

              {/* Reconstruction Depth Level Control Bar: ONLY rendered in 3D Ocean mode as requested! */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-3">
                <DepthControlBar
                  currentDepth={currentDepth}
                  onDepthChange={setCurrentDepth}
                />
              </div>
            </div>
          )}

          {activeView === 'argo' && <ArgoValidationView />}

          {activeView === 'embedding' && <EmbeddingExplorerView />}
        </div>

        {/* Right Drawer: Integrated AI Research Assistant, Region Filter Analyzer & Profile Drawer */}
        {(activeView === 'map' || activeView === '3d') && (
          <div className="w-80 shrink-0 h-full z-20 shadow-2xl bg-[#1e1e1e] border-l border-[#373737]">
            <OceanProfileDrawer
              profile={pointProfile}
              analysis={analysis}
              onExecuteQuery={handleExecuteQuery}
              isLoading={isLoading}
              selectedRegionBounds={selectedRegionBounds}
              onClearRegion={() => setSelectedRegionBounds(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
