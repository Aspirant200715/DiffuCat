'use client';

import { useLabJobStatus, useLabResults, useRetrain } from '@/hooks/useLabJobs';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Beaker, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const statusConfig = {
  queued: { label: 'In Queue', color: 'text-amber', icon: Clock },
  running: { label: 'Synthesizing…', color: 'text-cyan', icon: RefreshCw },
  completed: { label: 'Completed', color: 'text-emerald', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red', icon: AlertCircle },
};

export function JobCard({ jobId }: { jobId: string }) {
  const { data: statusData, isLoading: isStatusLoading } = useLabJobStatus(jobId);
  const { data: resultsData } = useLabResults(statusData?.status === 'completed' ? jobId : '');
  const retrainMutation = useRetrain();

  if (isStatusLoading || !statusData) {
    return (
      <div className="glass rounded-2xl border border-border/80 p-5 h-44 animate-pulse" />
    );
  }

  const status = statusConfig[statusData.status] ?? statusConfig.queued;
  const Icon = status.icon;

  const handleRetrain = () => {
    retrainMutation.mutate([jobId]);
  };

  return (
    <div className="relative glass rounded-2xl border border-border/80 p-5 overflow-hidden transition-all hover:border-border/100">
      {statusData.status === 'running' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Job</div>
          <div className="text-lg font-semibold text-text-primary">{jobId.substring(0, 8)}</div>
        </div>
        <div className={`h-9 w-9 rounded-full border border-border/70 flex items-center justify-center ${status.color}`}>
          <Icon className={`h-4 w-4 ${statusData.status === 'running' ? 'animate-spin' : ''}`} />
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-2 text-sm">
        <span className={`h-2 w-2 rounded-full ${status.color.replace('text-', 'bg-')} ${statusData.status === 'queued' ? 'animate-pulse' : ''}`} />
        <span className={status.color}>{status.label}</span>
      </div>

      {statusData.status === 'completed' && resultsData && Array.isArray(resultsData) && (
        <div className="relative z-10 mt-4 p-3 rounded-xl bg-surface-1/50 border border-border/50 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <Beaker className="w-3 h-3" /> Lab Results Ingested
          </div>
          {resultsData.slice(0, 2).map((res: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="font-mono text-text-secondary truncate max-w-[100px]">{res.smiles}</span>
              <span className="text-emerald font-semibold">act: {res.activity?.toFixed(2)}</span>
            </div>
          ))}
          {resultsData.length > 2 && (
            <div className="text-[9px] text-text-tertiary text-center">+{resultsData.length - 2} more results</div>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRetrain}
            disabled={retrainMutation.isPending}
            className="w-full mt-2 h-7 text-[10px] uppercase tracking-wider text-cyan hover:bg-cyan/10 border border-cyan/20 rounded-lg flex items-center gap-2"
          >
            <Play className="w-3 h-3" /> {retrainMutation.isPending ? 'Retraining...' : 'Active Learning Loop'}
          </Button>
        </div>
      )}

      <div className="relative z-10 mt-4 text-xs font-mono text-text-tertiary space-y-1">
        <div>Submitted: {new Date(statusData.submitted_at).toLocaleTimeString()}</div>
        {statusData.completed_at && <div>Completed: {new Date(statusData.completed_at).toLocaleTimeString()}</div>}
      </div>
    </div>
  );
}
