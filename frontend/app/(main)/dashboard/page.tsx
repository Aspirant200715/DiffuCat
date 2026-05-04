"use client";

import { useState } from "react";
import { MoleculeInput } from "@/components/discovery/MoleculeInput";
import { PredictionTable } from "@/components/discovery/PredictionTable";
import { PropertyRadar } from "@/components/visualization/PropertyRadar";
import { usePredict } from "@/hooks/useMolecule";
import { PredictionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

export default function DashboardPage() {
  const predictMutation = usePredict();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  const handlePredict = async (smilesList: string[]) => {
    try {
      const data = await predictMutation.mutateAsync({ smiles_list: smilesList });
      setPredictions(data.predictions);
    } catch {
      // Error is handled in hook
    }
  };

  const handleSort = (column: string) => {
    const sorted = [...predictions].sort((a, b) => {
      if (column === 'ucb_score') return (b.ucb_score ?? 0) - (a.ucb_score ?? 0);
      if (column === 'activity') return (b.metrics?.activity ?? 0) - (a.metrics?.activity ?? 0);
      if (column === 'selectivity') return (b.metrics?.selectivity ?? 0) - (a.metrics?.selectivity ?? 0);
      if (column === 'stability') return (b.metrics?.stability ?? 0) - (a.metrics?.stability ?? 0);
      return 0;
    });
    setPredictions(sorted);
  };

  const handleFilterPareto = () => {
    setPredictions(prev => prev.filter(p => p.pareto_optimal));
  };

  return (
    <div className="container max-w-screen-2xl py-6 space-y-6 perspective">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400">
            Molecular
          </span>{" "}
          <span className="text-foreground font-light">Engine</span>
        </h1>
        <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] opacity-80">
          [System Ready] Uncertainty-Aware Catalyst Generation Core
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-8 preserve-3d">
          <div className="card-3d">
            <MoleculeInput onSubmit={handlePredict} isLoading={predictMutation.isPending} />
          </div>
          
          <div className="space-y-4 card-3d">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-primary/70">Engine Results // Predicted Candidates</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleFilterPareto} disabled={predictions.length === 0} className="hud-border text-[10px] uppercase tracking-widest h-8">
                  <ListFilter className="w-3 h-3 mr-2" />
                  Pareto Optimality
                </Button>
              </div>
            </div>
            <div className="hud-shadow rounded-xl overflow-hidden">
              <PredictionTable data={predictions} onSort={handleSort} />
            </div>
          </div>
        </div>
        
        <div className="space-y-6 preserve-3d">
          <div className="sticky top-20 card-3d">
            <PropertyRadar data={predictions} />
          </div>
        </div>
      </div>
    </div>
  );
}
