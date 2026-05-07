"use client";

import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as $3Dmol from "3dmol";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Activity } from "lucide-react";


interface Molecule3DViewerProps {
  smiles: string;
}

export default function Molecule3DViewer({ smiles }: Molecule3DViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerInstance = useRef<any>(null);
  const [style, setStyle] = useState<"stick" | "sphere" | "cross">("stick");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!viewerRef.current) return;
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

    const loadMolecule = async () => {
      if (smiles) {
        try {
          // Fetch 3D SDF data from PubChem using SMILES
          const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`);
          if (!response.ok) {
            throw new Error("Failed to fetch 3D structure");
          }
          const sdfData = await response.text();
          
          viewer.addModel(sdfData, "sdf");
          viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
          viewer.zoomTo();
          viewer.render();
          viewer.spin("y", 1);
        } catch (error) {
          console.error("Error loading molecule:", error);
          // Fallback to basic SMILES parsing if possible, though it usually fails without 3D coords
          try {
            viewer.addModel(smiles, "smi");
            viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
            viewer.zoomTo();
            viewer.render();
          } catch (fallbackError) {
            console.error("Fallback failed:", fallbackError);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMolecule();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.removeAllModels();
        viewerInstance.current.clear();
      }
    };
  }, [smiles]);

  // Update style without recreating viewer
  useEffect(() => {
    if (!viewerInstance.current) return;
    const viewer = viewerInstance.current;
    
    if (style === "stick") {
      viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.4 } });
    } else if (style === "sphere") {
      viewer.setStyle({}, { sphere: {} });
    } else if (style === "cross") {
      viewer.setStyle({}, { cross: { linewidth: 2 } });
    }
    viewer.render();
  }, [style]);

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

  return (
    <div className="w-full h-full relative group">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F14] z-10">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Activity className="w-8 h-8 animate-pulse molecular-glow" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary/70">Rendering 3D Context</span>
          </div>
        </div>
      )}
      
      <div 
        ref={viewerRef} 
        className="w-full h-full hover-molecular-glow transition-all duration-700"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Floating Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex bg-muted/50 rounded-full p-0.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyle("stick")}
            className={`h-7 px-3 text-xs rounded-full ${style === 'stick' ? 'bg-background shadow-sm' : ''}`}
          >
            Stick
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyle("sphere")}
            className={`h-7 px-3 text-xs rounded-full ${style === 'sphere' ? 'bg-background shadow-sm' : ''}`}
          >
            Sphere
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStyle("cross")}
            className={`h-7 px-3 text-xs rounded-full ${style === 'cross' ? 'bg-background shadow-sm' : ''}`}
          >
            Cross
          </Button>
        </div>
        
        <div className="w-px h-4 bg-border/50 mx-1" />
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleZoom('out')}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleZoom('in')}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
