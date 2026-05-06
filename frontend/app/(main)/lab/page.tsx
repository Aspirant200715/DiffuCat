'use client';

import { useDiscovery } from '@/store/discovery';
import { useTrainModel } from '@/hooks/useLabJobs';
import { Button } from '@/components/ui/button';
import { Zap, HelpCircle, Layers, Database } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SubmissionForm = dynamic(() => import('@/components/lab/SubmissionForm').then(mod => mod.SubmissionForm), { ssr: false });
const JobCard = dynamic(() => import('@/components/lab/JobCard').then(mod => mod.JobCard), { ssr: false });
const OptimizationConsole = dynamic(() => import('@/components/lab/OptimizationConsole').then(mod => mod.OptimizationConsole), { ssr: false });

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
                <TooltipContent side="right" className="max-w-xs bg-white border-white p-4 shadow-2xl">
                  <p className="text-xs leading-relaxed text-black font-bold">
                    The Forge is where digital candidates are sent for high-fidelity simulation. We use <span className="text-emerald font-black">Density Functional Theory (DFT)</span> to calculate real-world physical properties.
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
              <div className="flex items-center gap-4 mb-10">
                <Layers className="h-6 w-6 text-cyan" />
                <div className="text-xs font-mono uppercase tracking-[0.4em] text-white/70 font-black">Forge Pipeline</div>
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
              <h3 className="text-4xl font-black text-white flex items-center gap-6">
                Synthesis Queue
                <span className="text-sm font-mono font-black bg-cyan/10 px-6 py-2.5 rounded-full border border-cyan/40 text-cyan uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                  {jobIds.length} ACTIVE JOBS
                </span>
              </h3>
            </div>

            {jobIds.length === 0 ? (
              <div className="h-[500px] border-2 border-dashed border-border/40 rounded-[32px] flex flex-col items-center justify-center text-center p-12 bg-surface-1/10 backdrop-blur-sm group hover:border-cyan/30 transition-all duration-700">
                <div className="w-24 h-24 rounded-3xl bg-surface-2 border border-border/50 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:border-cyan/50 transition-all duration-500 shadow-2xl">
                   <Database className="h-12 w-12 text-text-tertiary opacity-30 group-hover:text-cyan group-hover:opacity-100 transition-all" />
                </div>
                <h4 className="text-3xl font-black text-white tracking-tight">Your Forge is Quiet</h4>
                <p className="text-lg text-white/70 mt-6 max-w-[420px] leading-relaxed font-bold">
                  Start your discovery journey by entering SMILES on the dashboard or using the submission form on the left.
                </p>
                <div className="mt-14 flex gap-10">
                   <div className="flex flex-col items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                      <span className="text-xs font-mono text-white/60 font-black uppercase tracking-[0.2em]">Digital Input</span>
                   </div>
                   <div className="w-12 h-px bg-white/10 mt-2.5" />
                   <div className="flex flex-col items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-mono text-white/60 font-black uppercase tracking-[0.2em]">Forge Queue</span>
                   </div>
                   <div className="w-12 h-px bg-white/10 mt-2.5" />
                   <div className="flex flex-col items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      <span className="text-xs font-mono text-white/60 font-black uppercase tracking-[0.2em]">Lab Data</span>
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
        <div className={`text-sm font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-white/40'}`}>{title}</div>
        <div className={`text-[13px] mt-3 leading-relaxed font-bold ${active ? 'text-white/70' : 'text-white/20'}`}>{desc}</div>
      </div>
    </div>
  );
}
