'use client';

import { SubmissionForm } from '@/components/lab/SubmissionForm';
import { JobCard } from '@/components/lab/JobCard';
import { useDiscovery } from '@/store/discovery';
import { useTrainModel } from '@/hooks/useLabJobs';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { OptimizationConsole } from '@/components/lab/OptimizationConsole';

export default function LabPage() {
  const { jobIds } = useDiscovery();
  const trainMutation = useTrainModel();

  return (
    <div className="relative space-y-8">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 -z-10 opacity-10 bg-[url('/chem-flasks.svg')] bg-cover bg-center pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">Experimental Forge</h2>
          <p className="text-text-secondary mt-1">Queue synthesis jobs and orchestrate the lab feedback loop.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => trainMutation.mutate(10)}
          disabled={trainMutation.isPending}
          className="h-11 rounded-xl border-border/70 bg-surface-1/50 text-text-primary hover:bg-cyan/10 hover:text-cyan hover:border-cyan/50 gap-2 font-mono uppercase tracking-wider text-xs transition-all"
        >
          <Zap className={`h-4 w-4 ${trainMutation.isPending ? 'animate-pulse' : ''}`} />
          {trainMutation.isPending ? 'Training...' : 'Train Base Model'}
        </Button>
      </div>

      <OptimizationConsole />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Controls & Workflow */}
        <div className="lg:col-span-1 space-y-6">
          <SubmissionForm />
          
          <div className="glass rounded-2xl border border-border/80 p-6 bg-gradient-to-b from-cyan/5 to-transparent">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary mb-6">Forge Workflow</div>
            <div className="space-y-6">
              <WorkflowStep num="01" title="Validate" desc="Submit digital candidates for physical simulation." active={true} />
              <WorkflowStep num="02" title="Compute" desc="Run high-fidelity Cloud DFT quantum calculations." active={true} />
              <WorkflowStep num="03" title="Analyze" desc="Ingest real-world electronic properties & activity." active={true} />
              <WorkflowStep num="04" title="Optimize" desc="Trigger Active Learning to update GNN weights." active={true} />
            </div>
          </div>
        </div>

        {/* Right Column: Job Monitoring */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              Active Synthesis Queue
              <span className="text-[10px] font-mono font-normal bg-surface-2 px-2 py-1 rounded border border-border/60 text-text-tertiary">
                {jobIds.length} TOTAL JOBS
              </span>
            </h3>
          </div>

          {jobIds.length === 0 ? (
            <div className="h-80 border-2 border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-surface-1/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-surface-2 border border-border/50 flex items-center justify-center mb-4">
                 <Zap className="h-6 w-6 text-text-tertiary opacity-30" />
              </div>
              <h4 className="text-sm font-semibold text-text-primary">No active synthesis jobs</h4>
              <p className="text-xs text-text-tertiary mt-1 max-w-[240px]">
                Candidates submitted from the dashboard or via the form on the left will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {jobIds.map((id) => (
                <JobCard key={id} jobId={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ num, title, desc, active }: { num: string; title: string; desc: string; active: boolean }) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={`h-6 w-6 rounded-full border text-[10px] font-mono flex items-center justify-center ${active ? 'border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(14,165,233,0.2)]' : 'border-border/60 text-text-tertiary'}`}>
          {num}
        </div>
        <div className="w-px h-8 bg-border/40 mt-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-text-primary' : 'text-text-tertiary'}`}>{title}</div>
        <div className="text-[10px] text-text-tertiary mt-1 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
