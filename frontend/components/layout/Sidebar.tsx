"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom, FlaskConical, LayoutDashboard, Dna, Database, Settings, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { title: "Discovery Engine", href: "/dashboard", icon: LayoutDashboard },
  { title: "Experimental Forge", href: "/lab", icon: FlaskConical },
  { title: "Structural Archive", href: "/molecules", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-16 lg:w-[260px] border-r border-border/60 bg-void/85 backdrop-blur-2xl transition-all duration-500">
      <div className="flex h-full flex-col py-8">
        {/* Branding */}
        <div className="flex items-center justify-center lg:justify-start px-6 pb-10">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan/30 to-emerald/20 border border-cyan/40 flex items-center justify-center shadow-[0_0_25px_rgba(14,165,233,0.3)] group-hover:scale-105 transition-all duration-500">
              <FlaskConical className="h-6 w-6 text-cyan group-hover:rotate-180 transition-all duration-700" />
            </div>
            <div className="hidden lg:block">
               <span className="text-xl font-black tracking-tighter text-white block">Diffu<span className="text-cyan">Cat</span></span>
               <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest leading-none">Discovery v2.1</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 px-3 lg:px-4">
          <div className="hidden lg:block text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary mb-3 ml-3">Main Interface</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300 group",
                  isActive
                    ? "bg-cyan/10 text-cyan shadow-[inset_0_0_20px_rgba(14,165,233,0.05)]"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2/40"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-all duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="hidden lg:block font-bold tracking-tight">{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 w-1 h-6 bg-cyan rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System & Utils */}
        <div className="mt-10 px-4 flex flex-col gap-1.5">
           <div className="hidden lg:block text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary mb-3 ml-3">System Control</div>
           <Link 
             href="/auth" 
             className={cn(
               "flex items-center gap-4 px-4 py-3 text-sm transition-all group rounded-xl",
               pathname === '/auth' ? "bg-emerald/10 text-emerald" : "text-text-tertiary hover:text-text-primary hover:bg-surface-2/40"
             )}
           >
              <ShieldCheck className={cn("h-5 w-5", pathname === '/auth' ? "text-emerald" : "group-hover:text-emerald")} />
              <span className="hidden lg:block font-medium">Auth & Privacy</span>
           </Link>
           <Link 
             href="/settings" 
             className={cn(
               "flex items-center gap-4 px-4 py-3 text-sm transition-all group rounded-xl",
               pathname === '/settings' ? "bg-cyan/10 text-cyan" : "text-text-tertiary hover:text-text-primary hover:bg-surface-2/40"
             )}
           >
              <Settings className={cn("h-5 w-5", pathname === '/settings' ? "text-cyan" : "group-hover:text-cyan")} />
              <span className="hidden lg:block font-medium">Global Settings</span>
           </Link>
        </div>

        {/* System Status Metrics */}
        <div className="mt-auto px-6 pb-8 hidden lg:block">
          <div className="rounded-2xl border border-border/70 bg-surface-1/40 p-5 space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary">System Integrity</span>
                 <span className="text-[10px] font-mono text-emerald font-bold">STABLE</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "98.6%" }}
                  className="h-full bg-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-mono">
               <div className="flex items-center gap-2 text-text-secondary">
                  <Activity className="h-3 w-3 text-cyan" /> Latency
               </div>
               <span className="text-text-primary">24ms</span>
            </div>

            <div className="pt-4 border-t border-border/40">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-3 border border-border flex items-center justify-center text-[10px] font-bold text-cyan">
                     MA
                  </div>
                  <div>
                     <div className="text-[11px] font-bold text-text-primary leading-none">Mahak Lab</div>
                     <div className="text-[9px] text-text-tertiary mt-1">Enterprise Tier</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
