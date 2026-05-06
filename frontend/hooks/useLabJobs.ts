import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDiscovery } from '@/store/discovery';
import { toast } from 'sonner';

export function useSubmitLabJob() {
  const { addJobId } = useDiscovery();
  return useMutation({
    mutationFn: (candidates: string[]) =>
      api.labSubmit({
        smiles_list: candidates,
        predicted_activity: candidates.map(() => 0.5),
        predicted_selectivity: candidates.map(() => 0.5),
        predicted_stability: candidates.map(() => 0.5),
        priority: 'normal',
      }),
    onSuccess: (data) => {
      if (data.job_id) {
        addJobId(data.job_id);
        toast.success(`Job ${data.job_id.substring(0, 8)} queued`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLabJobStatus(jobId: string) {
  return useQuery({
    queryKey: ['lab', jobId],
    queryFn: () => api.labStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return (s === 'completed' || s === 'failed') ? false : 3000;
    },
  });
}

export function useLabResults(jobId: string) {
  return useQuery({
    queryKey: ['lab-results', jobId],
    queryFn: () => api.labResults(jobId),
    enabled: !!jobId,
  });
}

export function useRetrain() {
  return useMutation({
    mutationFn: (jobIds: string[]) => api.labRetrain(jobIds),
    onSuccess: (data) => {
      toast.success(data.message || 'Active Learning fine-tuning queued');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTrainModel() {
  return useMutation({
    mutationFn: (n_candidates?: number) => api.train(n_candidates),
    onSuccess: (data: any) => {
      toast.success(data.message || 'Base model training initiated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
