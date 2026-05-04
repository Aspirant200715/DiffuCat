import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusTimelineProps {
  status: 'queued' | 'running' | 'completed' | 'failed';
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  const steps = [
    { id: 'queued', label: 'Queued' },
    { id: 'running', label: 'Synthesis' },
    { id: 'completed', label: 'Validation' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === status);
  const isFailed = status === 'failed';

  return (
    <div className="flex items-center w-full max-w-sm">
      {steps.map((step, idx) => {
        const isPast = currentIndex > idx || status === 'completed';
        const isCurrent = status === step.id;
        
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <div 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center bg-card border-2",
                  isPast ? "border-success text-success" : 
                  isCurrent && !isFailed ? "border-primary text-primary" : 
                  isFailed && isCurrent ? "border-destructive text-destructive" :
                  "border-muted-foreground/30 text-muted-foreground/30"
                )}
              >
                {isPast ? <CheckCircle2 className="w-4 h-4" /> : 
                 isCurrent && !isFailed ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                 isFailed && isCurrent ? <XCircle className="w-4 h-4" /> :
                 <Circle className="w-3 h-3" />}
              </div>
              <span className={cn(
                "text-[10px] font-medium absolute top-8 whitespace-nowrap",
                isPast || isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-2",
                isPast ? "bg-success" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
