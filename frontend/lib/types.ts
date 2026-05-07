// Core Types

export interface MoleculeMetrics {
  activity: number;
  selectivity: number;
  stability: number;
}

export interface UncertaintyMetrics {
  mean: number;
  std: number;
}

export interface PredictionResult {
  smiles: string;
  predictions: MoleculeMetrics;
  uncertainty: Record<keyof MoleculeMetrics, UncertaintyMetrics>;
  ucb_score: number;
  pareto_optimal: boolean;
  mol_block?: string;
  atom_uncertainty?: number[];
}

export interface PredictResponse {
  predictions: PredictionResult[];
}

export interface PredictRequest {
  smiles_list: string[];
}

export interface LabJobSubmissionRequest {
  smiles_list: string[];
  predicted_activity: number[];
  predicted_selectivity: number[];
  predicted_stability: number[];
  priority: 'normal' | 'high' | 'urgent';
}

export interface LabJobSubmissionResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface LabResult {
  candidate_id: string;
  smiles: string;
  activity: number;
  selectivity: number;
  stability: number;
  synthesis_success: boolean;
  notes: string;
  timestamp: string;
}

export interface LabJobStatusResponse {
  job_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'submitted';
  submitted_at: string;
  completed_at?: string;
}
