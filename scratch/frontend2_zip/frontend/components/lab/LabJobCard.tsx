"use client";

import { useLabJobStatus } from "@/hooks/useLabJobs";
import { Card, CardContent } from "@/components/ui/card";
import { StatusTimeline } from "./StatusTimeline";
import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LabJobCardProps {
  jobId: string;
}

export function LabJobCard({ jobId }: LabJobCardProps) {
  const { data, isLoading, refetch, isRefetching } = useLabJobStatus(jobId);

  if (isLoading || !data) {
    return (
      <Card className="border-border/40 shadow-sm animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 w-32 bg-muted rounded mb-4"></div>
          <div className="h-4 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "glass-panel overflow-hidden transition-all duration-500 hud-border relative",
      data.status === 'completed' && "border-success/50",
      data.status === 'failed' && "border-destructive/50"
    )}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6 relative overflow-hidden">
          {data.status === 'running' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-light-beam pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-pulse" />
            </>
          )}
          <div className="space-y-1 flex-1 pl-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">Job #{jobId.substring(0, 8)}</h3>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-mono">
                {data.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date((data.submitted_at as string) || Date.now()).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex-1 w-full flex justify-center pb-8 md:pb-0">
            <StatusTimeline status={data.status as 'queued' | 'running' | 'completed' | 'failed'} />
          </div>

          <div className="flex justify-end gap-2 w-full md:w-auto">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" disabled={data.status !== 'completed'}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
