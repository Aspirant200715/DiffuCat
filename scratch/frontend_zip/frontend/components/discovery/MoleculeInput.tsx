"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FlaskConical } from "lucide-react";

interface MoleculeInputProps {
  onSubmit: (smilesList: string[]) => void;
  isLoading: boolean;
}

export function MoleculeInput({ onSubmit, isLoading }: MoleculeInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Split by comma or newline, trim, and filter out empty strings
    const smilesList = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
      
    onSubmit(smilesList);
  };

  return (
    <Card className="glass-panel overflow-hidden border-primary/20 hud-border relative group">
      <div className="absolute inset-0 hex-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 group-hover:bg-primary/20 transition-all duration-700" />
      
      <CardHeader className="pb-3 border-b border-primary/20 bg-muted/30 relative z-10 backdrop-blur-sm">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent uppercase tracking-wider text-sm">
            Computational Terminal // Input
          </span>
        </CardTitle>
        <CardDescription className="text-primary/60 font-mono text-xs">
          [System Ready] Awaiting SMILES string sequences...
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="> Enter SMILES strings (e.g., CCO, C1=CC=CC=C1)..._"
              className="min-h-[140px] font-mono text-sm resize-y terminal-input transition-all pb-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className="text-[10px] text-primary/40 uppercase tracking-widest self-center mr-1">Presets:</span>
              <button type="button" onClick={() => setInput(prev => prev ? prev + ', CCO' : 'CCO')} className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-sm transition-colors uppercase tracking-wider font-mono">Ethanol</button>
              <button type="button" onClick={() => setInput(prev => prev ? prev + ', c1ccccc1' : 'c1ccccc1')} className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-sm transition-colors uppercase tracking-wider font-mono">Benzene</button>
              <button type="button" onClick={() => setInput(prev => prev ? prev + ', CC(=O)OC1=CC=CC=C1C(=O)O' : 'CC(=O)OC1=CC=CC=C1C(=O)O')} className="text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-sm transition-colors uppercase tracking-wider font-mono">Aspirin</button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] text-primary/70 bg-muted/50 px-3 py-1.5 rounded-md border border-primary/20 uppercase tracking-widest">
              <span className="font-mono text-primary font-bold animate-pulse">sys</span>
              <span className="font-mono opacity-60">Regex Check Active</span>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="px-8 font-mono uppercase tracking-widest relative overflow-hidden group/btn hud-border"
            >
              {isLoading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-light-beam" />}
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Run Calculation"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
