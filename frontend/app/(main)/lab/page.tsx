'use client';

import { SubmissionForm } from '@/components/lab/SubmissionForm';
import { JobCard } from '@/components/lab/JobCard';
import { useDiscovery } from '@/store/discovery';

export default function LabPage() {
  const { jobIds } = useDiscovery();

  return (
    <div className="relative space-y-8">
      <div className="absolute inset-0 -z-10 opacity-20 bg-[url('/chem-flasks.svg')] bg-cover bg-center" />
      <div>
        <h2 className="text-3xl font-semibold">Experimental Forge</h2>
        <p className="text-text-secondary mt-2">Queue synthesis jobs and track the lab feedback loop.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <SubmissionForm />
          <div className="glass rounded-2xl border border-border/80 p-6">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Resource Status</div>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between">
                <span>Synthesizers</span>
                <span className="text-emerald">3 / 4 Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reagents</span>
                <span className="text-amber">Low (22%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Queue Time</span>
                <span className="text-text-primary">~45 mins</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Jobs</h3>
            <span className="text-xs font-mono text-text-tertiary">{jobIds.length} total</span>
          </div>

          {jobIds.length === 0 ? (
            <div className="h-64 border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-text-tertiary font-mono">
              No active synthesis jobs.
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
