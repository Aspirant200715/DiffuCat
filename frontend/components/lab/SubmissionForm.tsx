"use client";

import { useState } from "react";
import { useSubmitLabJob } from "@/hooks/useLabJobs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beaker, Loader2 } from "lucide-react";

interface SubmissionFormProps {
  onJobSubmitted: (jobId: string) => void;
}

export function SubmissionForm({ onJobSubmitted }: SubmissionFormProps) {
  const [candidates, setCandidates] = useState("");
  const submitMutation = useSubmitLabJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidates.trim()) return;

    const candidateList = candidates
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const result = await submitMutation.mutateAsync({ candidates: candidateList });
      onJobSubmitted(result.job_id);
      setCandidates(""); // Clear on success
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Card className="glass-panel overflow-hidden border-primary/20 relative">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -z-10 pointer-events-none" />
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          Submit for Validation
        </CardTitle>
        <CardDescription>
          Enter SMILES strings to queue for automated lab synthesis and testing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="SMILES to validate..."
            value={candidates}
            onChange={(e) => setCandidates(e.target.value)}
            disabled={submitMutation.isPending}
            className="min-h-[120px] font-mono text-sm resize-y bg-black/20 border-border/50 focus-visible:ring-primary/50"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitMutation.isPending || !candidates.trim()}>
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Queue Job"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
