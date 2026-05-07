import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LabJobSubmissionRequest, LabJobStatusResponse } from '@/lib/types';
import { toast } from 'sonner';

export function useSubmitLabJob() {
  return useMutation({
    mutationFn: (data: { candidates: string[] }) => {
      // Map simple frontend form `{ candidates }` to backend expected shape
      const payload: LabJobSubmissionRequest = {
        smiles_list: data.candidates,
        predicted_activity: data.candidates.map(() => 0.5),
        predicted_selectivity: data.candidates.map(() => 0.5),
        predicted_stability: data.candidates.map(() => 0.5),
        priority: 'normal'
      };
      return api.submitLabJob(payload);
    },
    onError: (error) => {
      toast.error('Lab Submission Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    },
    onSuccess: (data) => {
      toast.success('Job Submitted to Lab', {
        description: `Job ID: ${data.job_id} is now queued.`,
      });
    },
  });
}

export function useLabJobStatus(jobId: string | null) {
  return useQuery<LabJobStatusResponse | null>({
    queryKey: ['labJob', jobId],
    queryFn: () => api.getLabJobStatus(jobId!),
    enabled: !!jobId,
    // Poll every 5 seconds if job is not completed or failed
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 5000;
    },
  });
}
