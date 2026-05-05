'use client';

import { useLabJobStatus } from '@/hooks/useLabJobs';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  queued: { label: 'In Queue', color: 'text-amber', icon: Clock },
  running: { label: 'Synthesizing…', color: 'text-cyan', icon: RefreshCw },
  completed: { label: 'Completed', color: 'text-emerald', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red', icon: AlertCircle },
};

export function JobCard({ jobId }: { jobId: string }) {
  const { data, isLoading } = useLabJobStatus(jobId);

  if (isLoading || !data) {
    return (
      <div className="glass rounded-2xl border border-border/80 p-5 h-44 animate-pulse" />
    );
  }

  const status = statusConfig[data.status] ?? statusConfig.queued;
  const Icon = status.icon;

  return (
    <div className="relative glass rounded-2xl border border-border/80 p-5 overflow-hidden">
      {data.status === 'running' && (
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
          <Icon className={`h-4 w-4 ${data.status === 'running' ? 'animate-spin' : ''}`} />
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-2 text-sm">
        <span className={`h-2 w-2 rounded-full ${status.color.replace('text-', 'bg-')} ${data.status === 'queued' ? 'animate-pulse' : ''}`} />
        <span className={status.color}>{status.label}</span>
      </div>

      <div className="relative z-10 mt-4 text-xs font-mono text-text-tertiary space-y-1">
        <div>Submitted: {new Date(data.submitted_at).toLocaleTimeString()}</div>
        {data.completed_at && <div>Completed: {new Date(data.completed_at).toLocaleTimeString()}</div>}
      </div>
    </div>
  );
}
