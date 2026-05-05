import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UncertaintyBarProps {
  value: number; // 0 to 1
  uncertainty: number; // 0 to 1
  className?: string;
  color?: string; // e.g. "bg-cyan"
}

export function UncertaintyBar({ value, uncertainty, className, color = "bg-cyan" }: UncertaintyBarProps) {
  // Clamp values
  const v = Math.max(0, Math.min(1, value));
  const u = Math.max(0, Math.min(1, uncertainty));
  
  // High uncertainty -> amber
  const activeColor = u > 0.4 ? "bg-amber" : color;

  return (
    <div className={cn("relative w-full h-1.5 bg-surface-2 rounded-full overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${v * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("absolute top-0 left-0 h-full rounded-full shadow-[0_0_8px_currentColor]", activeColor)}
      />
      {/* Uncertainty marker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-text-primary z-10"
        style={{ left: `${v * 100}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-text-tertiary rounded-full -translate-x-1/2" style={{ width: `${u * 100 * 2}px` }} />
      </motion.div>
    </div>
  );
}
