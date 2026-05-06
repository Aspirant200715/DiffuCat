'use client';

import { SubmissionForm } from '@/components/lab/SubmissionForm';
import { JobCard } from '@/components/lab/JobCard';
import { useDiscovery } from '@/store/discovery';
import { useTrainModel } from '@/hooks/useLabJobs';
import { Button } from '@/components/ui/button';
import { Zap, HelpCircle, Layers, Database } from 'lucide-react';
import { OptimizationConsole } from '@/components/lab/OptimizationConsole';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function LabPage() {
  const { jobIds } = useDiscovery();
  const trainMutation = useTrainModel();

  return (
    <TooltipProvider>
      <div className="relative space-y-8 min-h-screen pb-20">
        {/* Background Decorative Layer */}
        <div className="absolute inset-0 -z-10 molecular-grid-bg opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-emerald/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary">Experimental Forge</h2>
              <Tooltip>
                <TooltipTrigger>
                  <div className="p-1 cursor-help">
                    <HelpCircle className="h-4 w-4 text-text-tertiary hover:text-emerald transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-surface-2 border-border p-3">
                  <p className="text-xs leading-relaxed">
                    The Forge is where digital candidates are sent for high-fidelity simulation. We use Density Functional Theory (DFT) to calculate real-world physical properties.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-text-secondary max-w-xl">
              Queue candidates for physical validation. Results are used to retrain the AI models, creating a virtuous feedback loop of scientific discovery.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => trainMutation.mutate(10)}
            disabled={trainMutation.isPending}
            className="h-11 px-6 rounded-xl border-border/70 bg-surface-1/50 text-text-primary hover:bg-emerald/10 hover:text-emerald hover:border-emerald/50 gap-3 font-mono uppercase tracking-wider text-[10px] transition-all shadow-lg group"
          >
            <Zap className={`h-4 w-4 text-emerald ${trainMutation.isPending ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
            {trainMutation.isPending ? 'Optimizing Weights...' : 'Retrain AI Core'}
          </Button>
        </div>

        <OptimizationConsole />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Controls & Workflow */}
          <div className="lg:col-span-1 space-y-8">
            <SubmissionForm />
            
            <div className="glass rounded-2xl border border-border/80 p-8 bg-gradient-to-b from-cyan/5 to-transparent shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <Layers className="h-5 w-5 text-cyan" />
                <div className="text-sm font-mono uppercase tracking-[0.3em] text-text-tertiary">Forge Pipeline</div>
              </div>
              <div className="space-y-10">
                <WorkflowStep 
                  num="01" 
                  title="Virtual Validation" 
                  desc="Candidates are screened for geometric stability and basic energy levels before full simulation." 
                  active={true} 
                />
                <WorkflowStep 
                  num="02" 
                  title="Quantum Compute" 
                  desc="Running DFT (Density Functional Theory) to find the 'Ground State' of the catalyst structure." 
                  active={true} 
                />
                <WorkflowStep 
                  num="03" 
                  title="Activity Mapping" 
                  desc="Calculating how easily molecules bind to the surface and exit as reaction products." 
                  active={true} 
                />
                <WorkflowStep 
                  num="04" 
                  title="Active Learning" 
                  desc="Results are fed back into the Discovery Engine to improve future GNN predictions." 
                  active={true} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Job Monitoring */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-text-primary flex items-center gap-4">
                Synthesis Queue
                <span className="text-xs font-mono font-bold bg-surface-2 px-4 py-2 rounded-full border border-border/60 text-cyan">
                  {jobIds.length} ACTIVE JOBS
                </span>
              </h3>
            </div>

            {jobIds.length === 0 ? (
              <div className="h-[500px] border-2 border-dashed border-border/40 rounded-[32px] flex flex-col items-center justify-center text-center p-12 bg-surface-1/10 backdrop-blur-sm group hover:border-cyan/30 transition-all duration-700">
                <div className="w-24 h-24 rounded-3xl bg-surface-2 border border-border/50 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:border-cyan/50 transition-all duration-500 shadow-2xl">
                   <Database className="h-12 w-12 text-text-tertiary opacity-30 group-hover:text-cyan group-hover:opacity-100 transition-all" />
                </div>
                <h4 className="text-xl font-bold text-text-primary">Your Forge is Quiet</h4>
                <p className="text-base text-text-tertiary mt-4 max-w-[360px] leading-relaxed">
                  Start your discovery journey by entering SMILES on the dashboard or using the submission form on the left.
                </p>
                <div className="mt-12 flex gap-6">
                   <div className="flex flex-col items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan" />
                      <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-widest">Digital Input</span>
                   </div>
                   <div className="w-10 h-px bg-border/40 mt-1.5" />
                   <div className="flex flex-col items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald" />
                      <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-widest">Forge Queue</span>
                   </div>
                   <div className="w-10 h-px bg-border/40 mt-1.5" />
                   <div className="flex flex-col items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber" />
                      <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-widest">Lab Data</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobIds.map((id) => (
                  <JobCard key={id} jobId={id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function WorkflowStep({ num, title, desc, active }: { num: string; title: string; desc: string; active: boolean }) {
  return (
    <div className="flex gap-6 relative group">
      <div className="flex flex-col items-center shrink-0">
        <div className={`h-10 w-10 rounded-xl border text-xs font-bold flex items-center justify-center transition-all duration-500 ${active ? 'border-cyan/50 bg-cyan/10 text-cyan shadow-[0_0_20px_rgba(14,165,233,0.1)] group-hover:scale-110' : 'border-border/60 text-text-tertiary'}`}>
          {num}
        </div>
        <div className="w-px h-full bg-gradient-to-b from-border/60 to-transparent mt-3" />
      </div>
      <div className="flex-1 pb-10">
        <div className={`text-sm font-bold uppercase tracking-widest ${active ? 'text-text-primary' : 'text-text-tertiary'}`}>{title}</div>
        <div className="text-[13px] text-text-secondary mt-2.5 leading-relaxed font-medium">{desc}</div>
      </div>
    </div>
  );
}
