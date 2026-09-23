export interface Observation {
  id: string;
  name: string;
  modality: 'optical' | 'SAR' | 'dem';
  sensor: string;
  acquisition_time?: string;
  crs?: string;
  resolution_m?: number;
  bands?: string[];
  bounds?: [number, number, number, number];
  filepath: string;
  has_nir: boolean;
}

export interface AnalysisStep {
  id: string;
  title: string;
  tool: string;
  status: 'pending' | 'in_progress' | 'completed' | 'refused';
}

export interface AnalysisPlan {
  intent: string;
  steps: AnalysisStep[];
}

export interface RefusalInfo {
  is_valid: boolean;
  refusal_reason: string;
  recommendation: string;
  missing_bands: string[];
}

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'query' | 'data' | 'plan' | 'execution' | 'answer';
  detail?: string;
  tool?: string;
  status?: string;
  confidence?: number;
}

export interface EvidenceEdge {
  source: string;
  target: string;
  label: string;
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  provenance: {
    system: string;
    reproducible: boolean;
    audit_timestamp: string;
  };
}

export interface GeoJSONLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'point';
  color: string;
  data: any;
  visible?: boolean;
  opacity?: number;
}


export interface AnalysisResponse {
  id: string;
  status: 'completed' | 'refused' | 'error';
  query: string;
  observation: Observation;
  plan: AnalysisPlan;
  answer_summary: string;
  refusal?: RefusalInfo;
  recommendation?: string;
  result?: {
    answer_summary: string;
    confidence: number;
    metrics: Record<string, any>;
    fusion?: string;
    recovery?: any;
  };
  evidence_graph?: EvidenceGraph;
  uncertainty?: {
    overall_uncertainty_score: number;
    confidence_score: number;
    disagreement_level: string;
  };
  location?: any;
  layers?: GeoJSONLayer[];
  attached_files?: any[];
  report_path?: string;
}
