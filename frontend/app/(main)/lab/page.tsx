"use client";

import { useState } from "react";
import { SubmissionForm } from "@/components/lab/SubmissionForm";
import { LabJobCard } from "@/components/lab/LabJobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function LabPage() {
  const [jobIds, setJobIds] = useState<string[]>([]);

  const handleJobSubmitted = (jobId: string) => {
    setJobIds((prev) => [jobId, ...prev]);
  };

  return (
    <div className="container max-w-screen-2xl py-6 space-y-6 relative min-h-screen perspective">
      <div className="absolute top-0 left-0 w-full h-full hex-pattern opacity-10 pointer-events-none -z-10" />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400">
            Experimental
          </span>{" "}
          <span className="text-foreground font-light">Forge</span>
        </h1>
        <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] opacity-80">
          [Status: Online] Multi-Phase Reaction Orchestration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-1 space-y-6 preserve-3d">
          <div className="p-1 glass-panel hud-border rounded-2xl card-3d">
            <SubmissionForm onJobSubmitted={handleJobSubmitted} />
          </div>
          
          <Card className="glass-panel border-primary/10 hud-border hidden lg:block card-3d">
            <CardHeader className="bg-muted/30 border-b border-primary/10">
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-primary/70">Lab Resources</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">Synthesizer Alpha</span>
                <span className="text-emerald-500">[IDLE]</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground">Analysis Module B</span>
                <span className="text-primary animate-pulse">[BUSY]</span>
              </div>
              <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary/30 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-primary/70">Active Experimental Jobs</h2>
            <div className="h-px flex-1 mx-6 bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          
          {jobIds.length === 0 ? (
            <div className="border-2 border-dashed border-primary/20 rounded-2xl p-16 text-center bg-muted/30 flex flex-col items-center justify-center relative group">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10 group-hover:border-primary/30 transition-all">
                <FlaskConical className="w-8 h-8 text-primary/30 group-hover:text-primary/60 transition-all" />
              </div>
              <p className="text-primary/70 font-mono tracking-widest uppercase text-sm mb-2">No Active Lab Jobs</p>
              <p className="text-muted-foreground text-xs font-mono max-w-xs">
                Queue top-performing candidates for synthesis and property verification.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {jobIds.map((id) => (
                <LabJobCard key={id} jobId={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
