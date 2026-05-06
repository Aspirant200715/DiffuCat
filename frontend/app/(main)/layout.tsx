"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen bg-[#010409] selection:bg-cyan/30 selection:text-white">
      {/* Landing Page Style Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20 contrast-125 brightness-75"
          style={{ 
            backgroundImage: 'url("/next_gen_chem_bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'screen'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#010409_100%)] opacity-80" />
      </div>

      <Sidebar />
      <div className="flex-1 ml-16 lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden relative">
          {/* Laboratory Aesthetic Layer */}
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
             <div className="absolute inset-0 chemistry-pattern-bg opacity-40" />
             <div className="glow-orb w-[600px] h-[600px] bg-cyan/20 -top-40 -left-40 animate-pulse" />
             <div className="glow-orb w-[500px] h-[500px] bg-emerald/10 bottom-0 -right-20 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <motion.div 
            key="page-content"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
