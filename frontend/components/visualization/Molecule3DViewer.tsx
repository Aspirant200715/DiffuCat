"use client";

import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as $3Dmol from "3dmol";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Activity } from "lucide-react";
import { PredictionResult } from "@/lib/types";

interface Molecule3DViewerProps {
  data?: PredictionResult;
  smiles?: string; // Fallback if data is not provided
}

export default function Molecule3DViewer({ data, smiles }: Molecule3DViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerInstance = useRef<any>(null);
  const [style, setStyle] = useState<"stick" | "sphere" | "cross">("stick");
  const [isLoading, setIsLoading] = useState(true);

  const targetSmiles = data?.smiles || smiles;

  useEffect(() => {
    if (!viewerRef.current || !targetSmiles) {
      if (!targetSmiles) setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    if (viewerInstance.current) {
      viewerInstance.current.removeAllModels();
      viewerInstance.current.clear();
    } else {
      viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
        backgroundColor: "transparent",
      });
    }

    const viewer = viewerInstance.current;

    const applyAtomUncertainty = (viewerObj: any) => {
      if (data?.atom_uncertainty && data.atom_uncertainty.length > 0) {
        const atoms = viewerObj.getModel().selectedAtoms({});
        if (atoms.length === data.atom_uncertainty.length) {
          atoms.forEach((atom: any, i: number) => {
            const u = data.atom_uncertainty![i];
            const r = Math.min(255, Math.max(0, Math.floor(255 * u)));
            const g = Math.min(255, Math.max(0, Math.floor(255 * (1 - u))));
            const color = (r << 16) | (g << 8); // hex color
            viewerObj.setStyle(
              { serial: atom.serial }, 
              { sphere: { radius: 0.4, color }, stick: { radius: 0.15, color } }
            );
          });
        }
      }
    };

    const loadMolecule = async () => {
      try {
        if (data?.mol_block) {
          // Use the backend-provided 3D conformer directly
          viewer.addModel(data.mol_block, "sdf");
          viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
          applyAtomUncertainty(viewer);
          viewer.zoomTo();
          viewer.render();
          viewer.spin("y", 1);
          setIsLoading(false);
          return;
        }

        // Fallback: Fetch 3D SDF data from PubChem using SMILES
        const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(targetSmiles)}/SDF?record_type=3d`);
        if (!response.ok) {
          throw new Error("Failed to fetch 3D structure");
        }
        const sdfData = await response.text();
        
        viewer.addModel(sdfData, "sdf");
        viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
        applyAtomUncertainty(viewer);
        viewer.zoomTo();
        viewer.render();
        viewer.spin("y", 1);
      } catch (error) {
        console.error("Error loading molecule:", error);
        // Fallback to basic SMILES parsing if possible
        try {
          viewer.addModel(targetSmiles, "smi");
          viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
          viewer.zoomTo();
          viewer.render();
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMolecule();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.removeAllModels();
        viewerInstance.current.clear();
      }
    };
  }, [targetSmiles, data]);

  // Update style without recreating viewer
  useEffect(() => {
    if (!viewerInstance.current) return;
    const viewer = viewerInstance.current;
    
    // Reset all styles first to avoid overlapping styles
    viewer.setStyle({}, {});
    
    if (style === "stick") {
      viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
    } else if (style === "sphere") {
      viewer.setStyle({}, { sphere: { radius: 0.8 } });
    } else if (style === "cross") {
      viewer.setStyle({}, { cross: { linewidth: 2 } });
    }

    // Re-apply atom uncertainty colors if they exist
    if (data?.atom_uncertainty && data.atom_uncertainty.length > 0) {
      const atoms = viewer.getModel().selectedAtoms({});
      if (atoms.length === data.atom_uncertainty.length) {
        atoms.forEach((atom: any, i: number) => {
          const u = data.atom_uncertainty![i];
          const r = Math.min(255, Math.max(0, Math.floor(255 * u)));
          const g = Math.min(255, Math.max(0, Math.floor(255 * (1 - u))));
          const color = (r << 16) | (g << 8); 
          
          if (style === "stick") {
            viewer.setStyle({ serial: atom.serial }, { sphere: { radius: 0.4, color }, stick: { radius: 0.15, color } });
          } else if (style === "sphere") {
            viewer.setStyle({ serial: atom.serial }, { sphere: { radius: 0.8, color } });
          } else if (style === "cross") {
            viewer.setStyle({ serial: atom.serial }, { cross: { linewidth: 2, color } });
          }
        });
      }
    }

    viewer.render();
  }, [style, data]);

  useEffect(() => {
    const handleResize = () => {
      if (viewerInstance.current) {
        viewerInstance.current.resize();
        viewerInstance.current.render();
      }
    };
    
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    if (viewerInstance.current) {
      const zoomFactor = direction === 'in' ? 1.2 : 0.8;
      viewerInstance.current.zoom(zoomFactor);
      viewerInstance.current.render();
    }
  };

  const handleReset = () => {
    if (viewerInstance.current) {
      viewerInstance.current.zoomTo();
      viewerInstance.current.render();
    }
  };

  if (!targetSmiles && !isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary font-mono text-xs p-6 text-center">
        <div className="mb-2">3D Conformer not available</div>
        <div>Generate candidates to view structure</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group min-h-[300px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
          <div className="flex flex-col items-center gap-4 text-cyan">
            <Activity className="w-8 h-8 animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.5)] rounded-full" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan/70">Rendering 3D Context</span>
          </div>
        </div>
      )}
      
      {targetSmiles && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary">Active Topology</div>
          <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-cyan/20 text-cyan font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            {targetSmiles}
          </div>
        </div>
      )}

      {data?.atom_uncertainty && (
        <div className="absolute top-2 right-2 flex items-center gap-2 text-[10px] font-mono text-text-secondary z-20 bg-black/40 px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-[#00ff00]"></span> Confident
            <span className="w-2 h-2 rounded-full bg-[#ff0000] ml-2"></span> Uncertain
        </div>
      )}

      <div 
        ref={viewerRef} 
        className="w-full h-full transition-all duration-700"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Floating Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-surface-1/80 backdrop-blur-md border border-border/50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex bg-void/50 rounded-full p-0.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyle("stick")}
            className={`h-7 px-3 text-xs rounded-full ${style === 'stick' ? 'bg-surface-2 text-cyan shadow-sm' : 'text-text-secondary'}`}
          >
            Stick
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyle("sphere")}
            className={`h-7 px-3 text-xs rounded-full ${style === 'sphere' ? 'bg-surface-2 text-cyan shadow-sm' : 'text-text-secondary'}`}
          >
            Sphere
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyle("cross")}
            className={`h-7 px-3 text-xs rounded-full ${style === 'cross' ? 'bg-surface-2 text-cyan shadow-sm' : 'text-text-secondary'}`}
          >
            Cross
          </Button>
        </div>
        
        <div className="w-px h-4 bg-border/50 mx-1" />
        
        <div className="flex items-center gap-1 text-text-secondary">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:text-cyan hover:bg-cyan/10" onClick={() => handleZoom('out')}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:text-cyan hover:bg-cyan/10" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:text-cyan hover:bg-cyan/10" onClick={() => handleZoom('in')}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
