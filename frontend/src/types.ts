// frontend/src/types.ts

export type ModelExecutionMode = 'REAL_MODEL' | 'DEMO_MODEL' | 'NO_MODEL';
export type DensityField = 'temperature' | 'sla' | 'currents' | 'salinity' | 'anomaly';

export interface SelectedRegionBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  area_km2: number;
  ocean_cells: number;
  mean_sst_c: number;
  min_temp_c: number;
  max_temp_c: number;
  mean_salinity_psu: number;
  mean_sla_m: number;
  avg_thermocline_m: number;
}

export interface SurfaceInputVariable {
  name: string;
  code: string;
  units: string;
  status: 'AVAILABLE' | 'MISSING' | 'MASKED' | 'INVALID' | 'LOW_QUALITY';
  coverage_pct: number;
  description: string;
  provider: string;
}

export interface ProfileLevel {
  depth_m: number;
  temperature_c: number;
  uncertainty_c: number;
  ci_95_lower: number;
  ci_95_upper: number;
  is_observed_surface: boolean;
  is_interpolated: boolean;
}

export interface TemperatureGradient {
  depth_m: number;
  gradient_c_per_m: number;
}

export interface PointProfile {
  latitude: number;
  longitude: number;
  date: string;
  region_name: string;
  sst_c: number;
  mixed_layer_depth_m: number;
  thermocline_depth_m: number;
  max_temperature_gradient_c_m: number;
  seafloor_depth_m?: number;
  profile: ProfileLevel[];
  gradients: TemperatureGradient[];
  is_demo_profile: boolean;
}

export interface ArgoFloat {
  float_id: string;
  wmo_id: number;
  platform: string;
  region: string;
  latitude: number;
  longitude: number;
  cycle_number: number;
  last_surfaced: string;
  data_center: string;
  qc_status: string;
}

export interface ArgoValidationMetrics {
  rmse_c: number;
  mae_c: number;
  bias_c: number;
  correlation_r: number;
  r_squared: number;
  sample_count: number;
}

export interface DepthWiseMAE {
  '0_50m_mae': number;
  '50_100m_mae': number;
  '100_200m_mae': number;
  '200_500m_mae': number;
  '500_1000m_mae': number;
}

export interface ArgoComparisonProfileItem {
  depth_m: number;
  observed_argo_c: number;
  reconstructed_oceanembed_c: number;
  error_c: number;
  abs_error_c: number;
  uncertainty_c: number;
}

export interface ArgoValidationData {
  float_info: ArgoFloat;
  date: string;
  metrics: ArgoValidationMetrics;
  depth_wise_mae: DepthWiseMAE;
  comparison_profile: ArgoComparisonProfileItem[];
  validation_label: string;
}

export interface EmbeddingPoint {
  id: string;
  pc1: number;
  pc2: number;
  region: string;
  color: string;
  latitude: number;
  longitude: number;
  date: string;
  latent_dim: number;
  completeness_pct: number;
}

export interface EmbeddingSpaceResponse {
  status: string;
  label: string;
  embedding_dimension: number;
  projection_method: string;
  temporal_context_window: string[];
  total_embeddings: number;
  points: EmbeddingPoint[];
}

export interface GeoJSONFeature {
  type: string;
  geometry: any;
  properties: Record<string, any>;
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  metadata?: Record<string, any>;
  features: GeoJSONFeature[];
}

export interface OceanAnalysisResponse {
  id: string;
  status: string;
  query: string;
  intent: string;
  depth_m: number;
  target_field?: string;
  location: {
    name: string;
    center: [number, number];
    bbox: [number, number, number, number];
    depth_m: number;
    zoom?: number;
  };
  plan?: {
    intent: string;
    steps: Array<{ id: string; title: string; tool: string; status: string }>;
  };
  answer_summary: string;
  profile: PointProfile;
  argo_validation: ArgoValidationData;
  grid?: GeoJSONCollection;
  graph_url?: string;
  gradient_graph_url?: string;
  model_status: string;
  metrics: Record<string, any>;
  report_path?: string;
}

// Legacy compatibility types
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

export interface AnalysisResponse extends OceanAnalysisResponse {
  query: string;
  observation?: Observation;
  refusal?: RefusalInfo;
  recommendation?: string;
  result?: {
    answer_summary: string;
    confidence: number;
    metrics: Record<string, any>;
  };
  evidence_graph?: EvidenceGraph;
  uncertainty?: any;
  attached_files?: any[];
}
