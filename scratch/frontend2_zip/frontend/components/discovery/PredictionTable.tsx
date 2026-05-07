"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PredictionResult } from "@/lib/types";
import { ParetoChip } from "./ParetoChip";
import { UCBBar } from "./UCBBar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

interface PredictionTableProps {
  data: PredictionResult[];
  onSort?: (column: string) => void;
}

export function PredictionTable({ data, onSort }: PredictionTableProps) {
  const maxUcb = Math.max(...data.map(d => d.ucb_score ?? 0), 1);

  if (data.length === 0) {
    return (
      <div className="border-2 border-dashed border-primary/20 rounded-xl p-12 text-center bg-muted/30 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
          <svg className="w-8 h-8 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <p className="text-primary/70 font-mono tracking-widest uppercase text-sm mb-2">No Candidates Simulated</p>
        <p className="text-muted-foreground text-xs font-mono">
          Enter SMILES and run calculation to populate prediction matrix.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 glass-panel overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[200px]">Candidate (SMILES)</TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => onSort?.('activity')}>
                <span>Activity</span>
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => onSort?.('selectivity')}>
                <span>Selectivity</span>
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => onSort?.('stability')}>
                <span>Stability</span>
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => onSort?.('ucb_score')}>
                <span>UCB Score</span>
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={`${row.smiles}-${idx}`} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="font-mono text-xs font-medium text-foreground/80 truncate max-w-[200px]" title={row.smiles}>
                <Link href={`/molecules/${encodeURIComponent(row.smiles)}`} className="hover:underline hover:text-primary transition-colors">
                  {row.smiles}
                </Link>
              </TableCell>
              <TableCell className="w-1/6">
                <div className="flex flex-col gap-1.5 w-full cursor-help group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between text-xs">
                    <span className="tabular-nums font-bold energy-text-cool">{(row.metrics?.activity ?? 0).toFixed(2)}</span>
                    <span className="tabular-nums font-mono text-[10px] text-muted-foreground">
                      ±{((row.uncertainty?.activity ?? row.uncertainty_details?.activity?.std) ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-[#05080f] rounded-full overflow-hidden hud-border">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#818cf8]" 
                      style={{ width: `${Math.min(Math.max((row.metrics?.activity ?? 0) * 100, 0), 100)}%` }} 
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-1/6">
                <div className="flex flex-col gap-1.5 w-full cursor-help group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between text-xs">
                    <span className="tabular-nums font-bold energy-text-warm">{(row.metrics?.selectivity ?? 0).toFixed(2)}</span>
                    <span className="tabular-nums font-mono text-[10px] text-muted-foreground">
                      ±{((row.uncertainty?.selectivity ?? row.uncertainty_details?.selectivity?.std) ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-[#05080f] rounded-full overflow-hidden hud-border">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444]" 
                      style={{ width: `${Math.min(Math.max((row.metrics?.selectivity ?? 0) * 100, 0), 100)}%` }} 
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-1/6">
                <div className="flex flex-col gap-1.5 w-full cursor-help group-hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between text-xs">
                    <span className="tabular-nums font-bold energy-text-neutral">{(row.metrics?.stability ?? 0).toFixed(2)}</span>
                    <span className="tabular-nums font-mono text-[10px] text-muted-foreground">
                      ±{((row.uncertainty?.stability ?? row.uncertainty_details?.stability?.std) ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-[#05080f] rounded-full overflow-hidden hud-border">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399]" 
                      style={{ width: `${Math.min(Math.max((row.metrics?.stability ?? 0) * 100, 0), 100)}%` }} 
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <UCBBar score={row.ucb_score ?? 0} maxScore={maxUcb} />
              </TableCell>
              <TableCell className="text-right">
                <ParetoChip isOptimal={!!row.pareto_optimal} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
