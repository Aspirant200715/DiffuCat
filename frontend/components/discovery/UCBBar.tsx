import { Progress } from "@/components/ui/progress";

interface UCBBarProps {
  score: number;
  maxScore?: number;
}

export function UCBBar({ score, maxScore = 100 }: UCBBarProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  return (
    <div className="flex items-center gap-3">
      <Progress value={percentage} className="h-2 w-24" />
      <span className="text-xs tabular-nums font-medium w-10 text-right">
        {score.toFixed(1)}
      </span>
    </div>
  );
}
