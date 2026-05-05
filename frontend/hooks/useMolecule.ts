import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useDiscovery } from '@/store/discovery';

export function usePredict() {
  const { setTraining, setPredictions } = useDiscovery();

  return useMutation({
    mutationFn: async (smiles_list: string[]) => {
      try {
        const data = await api.predictSync(smiles_list);
        if (data.detail?.includes('Model must be trained') || data.message?.includes('Model must be trained')) {
          throw new Error('needs_training');
        }
        return data;
      } catch (e: any) {
        if (e.message === 'needs_training' || String(e).includes('trained')) {
          setTraining(true);
          toast.loading('Training model on synthetic data…', { id: 'train-toast' });
          await api.train(10);
          setTraining(false);
          toast.success('Model ready!', { id: 'train-toast' });
          return api.predictSync(smiles_list);
        }
        throw e;
      }
    },
    onSuccess: (data) => {
      if (!data.predictions) return;
      const mapped = data.predictions.map((p: any) => ({
        ...p,
        metrics: p.predictions ?? p.metrics,
      }));
      setPredictions(mapped);
      toast.success(`${mapped.length} candidates predicted`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateCandidates() {
  return useMutation<any, Error, string>({
    mutationFn: (reaction: string = 'default') => api.generate(reaction, 5),
    onError: (e: Error) => toast.error(e.message),
  });
}
