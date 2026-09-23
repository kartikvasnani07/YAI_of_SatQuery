import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ProjectSidebar } from './components/ProjectSidebar';
import { TopoIntroSplash } from './components/TopoIntroSplash';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { AnalysisPlanView } from './components/AnalysisPlanView';
import { MapCanvas } from './components/MapCanvas';
import { EvidenceGraphView } from './components/EvidenceGraphView';
import { MultimodalInspector } from './components/MultimodalInspector';
import { TerrainProfileView } from './components/TerrainProfileView';
import { LayerManager } from './components/LayerManager';
import { ResultSummary } from './components/ResultSummary';

import { Observation, AnalysisResponse, GeoJSONLayer } from './types';
import { fetchObservations, submitQuery } from './services/api';

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);

  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedObsId, setSelectedObsId] = useState<string>('obs_cartosat_t1');
  const [activeView, setActiveView] = useState<'map' | 'evidence' | 'inspector' | 'terrain'>('map');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | undefined>(undefined);
  const [layers, setLayers] = useState<GeoJSONLayer[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  // Project & Chat History state
  const [projectsData, setProjectsData] = useState<any>({ projects: [], active_project_id: 'proj_default' });
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_default');
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjectsData(data);
        if (data.active_project_id) {
          setActiveProjectId(data.active_project_id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchObservations()
      .then((data) => {
        setObservations(data);
        if (data.length > 0) {
          setSelectedObsId(data[0].id);
        }
      })
      .catch(console.error);

    fetchProjects();
  }, []);

  const handleExecuteQuery = async (queryStr: string, obsId: string, files: any[] = []) => {
    setIsLoading(true);
    setAttachedFiles(files);
    try {
      const res = await submitQuery(queryStr, obsId, files, activeProjectId);
      setAnalysis(res);
      setActiveChatId(res.id);
      if (res.layers) {
        setLayers(res.layers.map((l) => ({ ...l, visible: true })));
      } else {
        setLayers([]);
      }
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }

  };

  const handleCreateProject = async (name: string) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newProj = await res.json();
        setActiveProjectId(newProj.id);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/chats/${chatId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProjectsData((prev: any) => ({
          ...prev,
          projects: prev.projects.map((p: any) =>
            p.id === activeProjectId
              ? { ...p, chats: p.chats.filter((c: any) => strId(c.id) !== strId(chatId)) }
              : p
          )
        }));

        if (activeChatId === chatId) {
          setAnalysis(undefined);
          setLayers([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const strId = (val: any) => String(val || '');

  const handleClearChats = async () => {
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/chats`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAnalysis(undefined);
        setLayers([]);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectChat = (chat: any) => {
    setActiveChatId(chat.id);
    setAnalysis(chat);
    if (chat.layers) {
      setLayers(chat.layers.map((l: any) => ({ ...l, visible: true })));
    }
  };

  const activeProject = projectsData.projects.find((p: any) => p.id === activeProjectId) || projectsData.projects[0];
  const activeChats = activeProject?.chats || [];
  const currentObs = observations.find((o) => o.id === selectedObsId);
  const visibleLayers = layers.filter((l) => l.visible !== false);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#000000] text-slate-100 overflow-hidden font-sans relative">
      {/* Animated Topographical Contouring Line Splash */}
      {showSplash && <TopoIntroSplash onComplete={() => setShowSplash(false)} />}

      {/* In-App Report Preview Modal */}
      {showReportPreview && (
        <ReportPreviewModal analysis={analysis} onClose={() => setShowReportPreview(false)} />
      )}

      {/* Top Executive Header */}
      <Header
        observations={observations}
        selectedObsId={selectedObsId}
        onSelectObs={setSelectedObsId}
        onExecuteQuery={handleExecuteQuery}
        isLoading={isLoading}
        hasReport={!!analysis?.report_path}
        onOpenReportPreview={() => setShowReportPreview(true)}
        activeView={activeView as any}
        onViewChange={setActiveView as any}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
      />

      {/* Main Workstation Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Projects & Chat History */}
        {isSidebarOpen && (
          <ProjectSidebar
            projects={projectsData.projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onCreateProject={handleCreateProject}
            chats={activeChats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            onClearChats={handleClearChats}
          />
        )}

        {/* Center Main Stage Workspace */}
        <div className="flex-1 h-full relative overflow-hidden bg-[#000000]">
          {activeView === 'map' && (
            <MapCanvas
              layers={visibleLayers}
              observation={currentObs}
              selectedObsId={selectedObsId}
              location={analysis?.location}
            />
          )}

          {activeView === 'evidence' && (
            <EvidenceGraphView graph={analysis?.evidence_graph} />
          )}

          {activeView === 'inspector' && (
            <MultimodalInspector attachedFiles={attachedFiles} />
          )}

          {activeView === 'terrain' && <TerrainProfileView location={analysis?.location} />}
        </div>

        {/* Right Collapsible Inspection Panel Drawer */}
        {isDrawerOpen && (
          <div className="w-80 shrink-0 h-full bg-[#1E1E1E] border-l border-[#373737] p-4 space-y-4 overflow-y-auto z-20 animate-fade-in shadow-2xl">
            {/* Scientific Analysis Plan Execution */}
            <AnalysisPlanView
              plan={analysis?.plan}
              refusal={analysis?.refusal}
              isLoading={isLoading}
            />

            {/* Verified Answer & Quantitative Metrics */}
            <ResultSummary analysis={analysis} />

            {/* Multi-Layer Manager */}
            <LayerManager
              layers={layers}
              onToggleVisibility={(id) =>
                setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)))
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
export default App;

