import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PredictRequest, PredictResponse } from '@/lib/types';
import { toast } from 'sonner';

export function usePredict() {
  return useMutation({
    mutationFn: (data: PredictRequest) => api.predict(data),
    onError: (error) => {
      toast.error('Prediction Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    },
    onSuccess: (data) => {
      toast.success('Prediction Complete', {
        description: `Successfully analyzed ${data.predictions.length} candidates.`,
      });
    },
  });
}
