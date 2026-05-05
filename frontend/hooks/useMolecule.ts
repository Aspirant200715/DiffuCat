import { useMutation, useQuery } from '@tanstack/react-query';
import { api, generateApi } from '@/lib/api';
import { PredictRequest, PredictResponse } from '@/lib/types';
import { toast } from 'sonner';

export function usePredict() {
  return useMutation({
    // Try predict; if backend responds that model is untrained, trigger training once and retry
    mutationFn: async (data: PredictRequest) => {
      try {
        return await api.predict(data);
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg && msg.includes('Model must be trained')) {
          // Inform user
          toast('Training model automatically (dev)...');
          try {
            await generateApi.train({ n_candidates: Math.max(6, (data.smiles_list || []).length) });
          } catch (tErr) {
            throw new Error(`Prediction failed and auto-train failed: ${tErr instanceof Error ? tErr.message : String(tErr)}`);
          }
          // Retry predict once
          return await api.predict(data);
        }
        throw err;
      }
    },
    onError: (error) => {
      toast.error('Prediction Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    },
    onSuccess: (data: PredictResponse) => {
      toast.success('Prediction Complete', {
        description: `Successfully analyzed ${data.predictions.length} candidates.`,
      });
    },
  });
}
