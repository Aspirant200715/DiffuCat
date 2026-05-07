import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed } from "lucide-react";

interface ParetoChipProps {
  isOptimal: boolean;
}

export function ParetoChip({ isOptimal }: ParetoChipProps) {
  if (isOptimal) {
    return (
      <Badge className="bg-success/15 text-success hover:bg-success/25 border-success/30 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        <span className="text-xs">Optimal</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground border-border flex items-center gap-1">
      <CircleDashed className="w-3 h-3" />
      <span className="text-xs">Dominated</span>
    </Badge>
  );
}
