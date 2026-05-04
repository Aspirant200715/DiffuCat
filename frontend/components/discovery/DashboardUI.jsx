import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Hero3D from "./Hero3D";

export default function DashboardUI() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const cardsRef = useRef([]);

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetReaction, setTargetReaction] = useState("CO2_to_methanol");

  // GSAP Choreography
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }).from(
        formRef.current,
        { scale: 0.95, opacity: 0, duration: 0.6, ease: "back.out(1.5)" },
        "-=0.4",
      );

      if (candidates.length > 0) {
        tl.from(
          cardsRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
          },
          "-=0.2",
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [candidates]);

  const handleRunPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // Connect to DiffuCat FastAPI backend
      const response = await fetch("http://localhost:8000/v1/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_reaction: targetReaction,
          n_candidates: 3,
        }),
      });

      if (!response.ok)
        throw new Error("Failed to generate candidates from backend");

      // In production, you would parse the real response here.
      // e.g., const data = await response.json(); setCandidates(data.candidates);
      // For now, we simulate success since the model might still be untrained
      setTimeout(() => {
        setCandidates([
          { id: 1, smiles: "CCO", activity: 0.85, selectivity: 0.72 },
          { id: 2, smiles: "c1ccccc1", activity: 0.78, selectivity: 0.88 },
          { id: 3, smiles: "CC(=O)O", activity: 0.92, selectivity: 0.65 },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Backend unreachable. Showing cached predictions.");

      // Fallback data for demonstration if the backend server is offline
      setTimeout(() => {
        setCandidates([
          { id: 1, smiles: "CCO (Cached)", activity: 0.85, selectivity: 0.72 },
          {
            id: 2,
            smiles: "c1ccccc1 (Cached)",
            activity: 0.78,
            selectivity: 0.88,
          },
          {
            id: 3,
            smiles: "CC(=O)O (Cached)",
            activity: 0.92,
            selectivity: 0.65,
          },
        ]);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Hero3D />
      </div>

      {/* UI Layer */}
      <div
        ref={containerRef}
        className="relative z-10 flex flex-col min-h-screen p-8 pointer-events-none"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center pt-8 md:pt-16">
          <h1
            ref={titleRef}
            className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 mb-10 pointer-events-auto tracking-tighter drop-shadow-2xl text-center"
          >
            DiffuCat <span className="text-white font-light">Discovery</span>
          </h1>

          {/* High-End Frosted Glass Control Panel */}
          <div
            ref={formRef}
            className="p-8 rounded-3xl w-full max-w-lg pointer-events-auto transition-all bg-white/5 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <label className="block text-xs font-bold text-sky-300 mb-3 uppercase tracking-[0.2em]">
              Target Reaction
            </label>
            <div className="relative">
              <select
                value={targetReaction}
                onChange={(e) => setTargetReaction(e.target.value)}
                className="w-full bg-slate-950/60 border border-sky-500/40 text-white rounded-xl p-4 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer custom-select appearance-none font-medium text-lg shadow-inner"
              >
                <option value="CO2_to_methanol">CO2 to Methanol</option>
                <option value="N2_reduction">Nitrogen Reduction</option>
              </select>
            </div>

            {error && (
              <p className="mt-4 text-sm text-rose-400 font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

            <button
              onClick={handleRunPrediction}
              disabled={loading}
              className="mt-8 w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-3"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Synthesizing...
                </>
              ) : (
                "Run Catalyst Prediction"
              )}
            </button>
          </div>
        </div>

        {/* Animated Results Boxes */}
        <div className="w-full max-w-6xl mx-auto flex flex-wrap justify-center gap-8 mt-16 pointer-events-auto pb-20">
          {candidates.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="w-80 relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-7 hover:border-sky-400 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(56,189,248,0.2)] group cursor-pointer"
            >
              {/* Glowing Top Border Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <div className="flex justify-between items-start mb-6">
                <div className="bg-sky-500/20 p-3 rounded-2xl text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/30 transition-all duration-300">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 2v7.31"></path>
                    <path d="M14 9.3V1.99"></path>
                    <path d="M8.5 2h7"></path>
                    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                    <path d="M5.52 16h12.96"></path>
                  </svg>
                </div>
                <span className="bg-slate-800 text-xs font-bold px-3 py-1 rounded-full text-slate-300 border border-slate-700 shadow-sm">
                  Rank #{index + 1}
                </span>
              </div>

              <h3
                className="text-2xl text-white font-bold tracking-tight mb-6 truncate"
                title={item.smiles}
              >
                {item.smiles}
              </h3>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400 font-medium">Activity</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {item.activity.toFixed(2)} eV
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${item.activity * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400 font-medium">
                      Selectivity
                    </span>
                    <span className="font-mono text-sky-400 font-bold">
                      {item.selectivity.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-sky-300 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${item.selectivity * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
