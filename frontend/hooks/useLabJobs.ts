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
