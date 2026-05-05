import { create } from 'zustand';
import { PredictionResult } from '@/lib/types';

interface DiscoveryStore {
  predictions: PredictionResult[];
  setPredictions: (p: PredictionResult[]) => void;
  selectedSmiles: string | null;
  selectSmiles: (s: string | null) => void;
  isTraining: boolean;
  setTraining: (v: boolean) => void;
  jobIds: string[];
  addJobId: (id: string) => void;
}

export const useDiscovery = create<DiscoveryStore>((set) => ({
  predictions: [],
  setPredictions: (predictions) => set({ predictions }),
  selectedSmiles: null,
  selectSmiles: (selectedSmiles) => set({ selectedSmiles }),
  isTraining: false,
  setTraining: (isTraining) => set({ isTraining }),
  jobIds: [],
  addJobId: (id) => set((s) => ({ jobIds: [id, ...s.jobIds] })),
}));
