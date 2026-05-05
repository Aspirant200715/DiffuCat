import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParetoBadgeProps {
  optimal?: boolean;
  className?: string;
}

export function ParetoBadge({ optimal, className }: ParetoBadgeProps) {
  if (!optimal) return null;

  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6875rem] font-mono tracking-wider bg-emerald/10 text-emerald border border-emerald/20 relative group", className)}>
      <div className="absolute inset-0 rounded bg-emerald/20 animate-ping opacity-20" />
      <Sparkles className="w-3 h-3" />
      <span>PARETO</span>
    </div>
  );
}
