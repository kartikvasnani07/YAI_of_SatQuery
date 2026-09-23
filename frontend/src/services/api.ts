import { Observation, AnalysisResponse } from '../types';

const API_BASE = '/api';

export async function fetchObservations(): Promise<Observation[]> {
  const res = await fetch(`${API_BASE}/observations`);
  if (!res.ok) throw new Error('Failed to fetch observations');
  const catalog = await res.json();
  return catalog.observations || [];
}

export async function submitQuery(
  query: string,
  observationId: string,
  attachedFiles: any[] = [],
  projectId: string = 'proj_default'
): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analyses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      observation_id: observationId,
      project_id: projectId,
      attached_files: attachedFiles
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Analysis request failed');
  }
  return await res.json();
}

export async function uploadMultimodalFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('File upload failed');
  return await res.json();
}

export async function fetchTerrainProfile(x0 = 0, y0 = 0, x1 = 511, y1 = 511, elevationBase?: number) {
  const url = `${API_BASE}/terrain/profile?x0=${x0}&y0=${y0}&x1=${x1}&y1=${y1}${elevationBase ? `&elevation_base=${elevationBase}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch terrain profile');
  return await res.json();
}

