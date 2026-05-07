import { PredictRequest, PredictResponse, LabJobSubmissionRequest, LabJobSubmissionResponse, LabJobStatusResponse, LabResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithHandler(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`;
      throw new ApiError(response.status, message);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

export const api = {
  // Sync prediction (Legacy/Simple)
  predictSync: async (smilesList: string[]): Promise<PredictResponse> => {
    const data: PredictRequest = { smiles_list: smilesList };
    return fetchWithHandler('/v1/predict/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  },

  // Async prediction
  predictSubmit: (smilesList: string[]): Promise<{ job_id: string; status: string }> => {
    const data: PredictRequest = { smiles_list: smilesList };
    return fetchWithHandler('/v1/predict/submit', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  },

  predictStatus: (jobId: string): Promise<{ job_id: string; status: string; result?: PredictResponse; error?: string }> =>
    fetchWithHandler(`/v1/predict/status/${jobId}`),

  // Rank
  rank: (smilesList: string[]): Promise<PredictResponse> => {
    const data: PredictRequest = { smiles_list: smilesList };
    return fetchWithHandler('/v1/rank/', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  },

  // Generation
  generate: (targetReaction: string, nCandidates: number = 10): Promise<{ status: string; candidates: string[]; message: string }> =>
    fetchWithHandler('/v1/generate/', { 
      method: 'POST', 
      body: JSON.stringify({ target_reaction: targetReaction, n_candidates: nCandidates }) 
    }),

  // Training
  train: (nCandidates: number = 10): Promise<{ status: string; candidates_processed: number; message: string }> =>
    fetchWithHandler('/v1/generate/train', { 
      method: 'POST', 
      body: JSON.stringify({ n_candidates: nCandidates }) 
    }),

  // Lab Operations
  labSubmit: (data: LabJobSubmissionRequest): Promise<LabJobSubmissionResponse> =>
    fetchWithHandler('/v1/lab/submit', { method: 'POST', body: JSON.stringify(data) }),

  labStatus: (id: string): Promise<LabJobStatusResponse> =>
    fetchWithHandler(`/v1/lab/status/${id}`),

  labResults: (id: string): Promise<LabResult[]> =>
    fetchWithHandler(`/v1/lab/results/${id}`),

  labRetrain: (jobIds: string[]): Promise<{ status: string; message: string }> =>
    fetchWithHandler('/v1/lab/retrain', { method: 'POST', body: JSON.stringify(jobIds) }),
};
