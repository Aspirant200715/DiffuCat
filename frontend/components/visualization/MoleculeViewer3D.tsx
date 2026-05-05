'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Circle, Layers, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface MoleculeViewerProps {
  smiles: string;
  height?: string;
}

type ViewStyle = 'stick' | 'sphere' | 'line';

export default function MoleculeViewer3D({ smiles, height = '480px' }: MoleculeViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('stick');

  useEffect(() => {
    let currentViewer: any = null;
    let spin = true;

    const init = async () => {
      if (!viewerRef.current) return;
      setLoading(true);
      try {
        const $3Dmol = await import('3dmol');

        currentViewer = viewer ?? $3Dmol.createViewer(viewerRef.current, { 
          backgroundColor: 'transparent',
          id: 'molecule-viewer-' + smiles
        });
        setViewer(currentViewer);
        currentViewer.clear();

        const encoded = encodeURIComponent(smiles);
        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encoded}/SDF?record_type=3d`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Structure fetch failed');
        const sdfData = await response.text();

        currentViewer.addModel(sdfData, 'sdf');
        const atomStyles: any = {};
        if (viewStyle === 'stick') atomStyles.stick = { radius: 0.15, colorscheme: 'Jmol' };
        if (viewStyle === 'sphere') atomStyles.sphere = { radius: 0.4, colorscheme: 'Jmol' };
        if (viewStyle === 'line') atomStyles.line = { colorscheme: 'Jmol' };
        
        currentViewer.setStyle({}, atomStyles);
        currentViewer.zoomTo();
        currentViewer.render();
        setLoading(false);

        const spinFunc = () => {
          if (spin && currentViewer) {
            currentViewer.rotate(0.6, 'y');
            currentViewer.render();
            requestAnimationFrame(spinFunc);
          }
        };
        requestAnimationFrame(spinFunc);

        const el = viewerRef.current;
        const onEnter = () => { spin = false; };
        const onLeave = () => { spin = true; requestAnimationFrame(spinFunc); };
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);

        return () => {
          spin = false;
          el.removeEventListener('mouseenter', onEnter);
          el.removeEventListener('mouseleave', onLeave);
        };
      } catch (error) {
        console.error('3Dmol error:', error);
        setLoading(false);
      }
    };

    let cleanup: any = null;
    init().then((clean) => { cleanup = clean; });
    return () => cleanup && cleanup();
  }, [smiles, viewStyle, viewer]);

  return (
    <div className="relative w-full bg-[#010409] rounded-3xl border border-white/5 overflow-hidden group" style={{ height }}>
      {/* Technical Scanning Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,198,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,198,0.05)_0%,transparent_70%)]" />
      </div>

      <div ref={viewerRef} className="w-full h-full relative z-10" />

      {/* HUD Elements */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Active Scanner</span>
        </div>
        <div className="text-[11px] font-mono text-emerald/80 tracking-widest uppercase">
          SDF-3D STRM: {smiles}
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20 pointer-events-none">
        <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-t-2 border-emerald/30 rounded-full"
          />
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-void/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald/20 border-t-emerald rounded-full animate-spin" />
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald">Materializing...</div>
          </div>
        </div>
      )}

      {/* Professional Lab-Grade Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5">
        <StyleButton active={viewStyle === 'stick'} onClick={() => setViewStyle('stick')} icon={<Box className="h-4 w-4" />} label="Stick" />
        <StyleButton active={viewStyle === 'sphere'} onClick={() => setViewStyle('sphere')} icon={<Radio className="h-4 w-4" />} label="Sphere" />
        <StyleButton active={viewStyle === 'line'} onClick={() => setViewStyle('line')} icon={<Layers className="h-4 w-4" />} label="Cross" />
      </div>

      <div className="absolute bottom-6 right-6 z-20">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          Render: OpenGL WebGL 2.0
        </div>
      </div>
    </div>
  );
}

function StyleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
        active 
        ? 'bg-emerald text-void font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
        : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
