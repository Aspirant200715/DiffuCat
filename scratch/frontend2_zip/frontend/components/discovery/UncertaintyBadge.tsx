
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UncertaintyBadgeProps {
  mean: number;
  std: number;
}

export function UncertaintyBadge({ mean, std }: UncertaintyBadgeProps) {
  const relativeStd = Math.abs(std / (mean || 1));
  
  let colorClass = "bg-success";
  let textColor = "text-success";
  
  if (relativeStd > 0.5) {
    colorClass = "bg-destructive";
    textColor = "text-destructive";
  } else if (relativeStd > 0.2) {
    colorClass = "bg-uncertainty";
    textColor = "text-uncertainty";
  }

  // Calculate percentage for progress bar (cap between 0-100)
  // Assuming mean is typically between 0-100 for this scale. If not, we might need a normalized scale.
  // For the sake of UI, let's normalize mean to 0-100% just for the bar length if possible,
  // or use the standard deviation to represent the error width.
  // Since we don't have absolute bounds, let's just show a filled bar for the mean, and a subtle background.
  const meanPercentage = Math.min(Math.max((mean) * 100, 0), 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<div />}>
          <div className="flex flex-col gap-1.5 w-full cursor-help">
            <div className="flex items-center justify-between text-xs">
              <span className="tabular-nums font-medium text-foreground">{mean.toFixed(2)}</span>
              <span className={cn("tabular-nums font-mono text-[10px]", textColor)}>
                ±{std.toFixed(2)}
              </span>
            </div>
            <div className="relative h-1.5 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40">
              <div 
                className={cn("absolute top-0 left-0 h-full rounded-full transition-all", colorClass)} 
                style={{ width: `${meanPercentage}%` }} 
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Mean: {mean.toFixed(4)} | StdDev: {std.toFixed(4)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
