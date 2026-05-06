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
        <div className="flex items-center justify-center lg:justify-start px-8 pb-12">
          <Link href="/" className="flex items-center gap-5 group">
            <div className="h-14 w-14 rounded-[20px] bg-gradient-to-br from-cyan/30 to-emerald/20 border border-cyan/40 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)] group-hover:scale-110 transition-all duration-700">
              <FlaskConical className="h-7 w-7 text-cyan group-hover:rotate-180 transition-all duration-700" />
            </div>
            <div className="hidden lg:block">
               <span className="text-2xl font-black tracking-tighter text-white block leading-none">Diffu<span className="text-cyan">Cat</span></span>
               <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-[0.4em] leading-none mt-2 block opacity-60">Discovery v2.1</span>
            </div>
          </Link>
        </div>
 
        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-3 lg:px-4">
          <div className="hidden lg:block text-[11px] font-mono uppercase tracking-[0.4em] text-white/40 mb-4 ml-4">Main Interface</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-5 rounded-[22px] px-5 py-4 text-[16px] transition-all duration-300 group",
                  isActive
                    ? "bg-cyan/10 text-cyan shadow-[inset_0_0_30px_rgba(14,165,233,0.08)]"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2/40"
                )}
              >
                <item.icon className={cn("h-6 w-6 transition-all duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="hidden lg:block font-black tracking-tight">{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 w-1.5 h-8 bg-cyan rounded-full shadow-[0_0_15px_rgba(14,165,233,1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
 
        {/* System & Utils */}
        <div className="mt-12 px-4 flex flex-col gap-2">
           <div className="hidden lg:block text-[11px] font-mono uppercase tracking-[0.4em] text-white/40 mb-4 ml-4">System Control</div>
           <Link 
             href="/auth" 
             className={cn(
               "flex items-center gap-5 px-5 py-3.5 text-[15px] transition-all group rounded-2xl",
               pathname === '/auth' ? "bg-emerald/10 text-emerald" : "text-text-tertiary hover:text-text-primary hover:bg-surface-2/40"
             )}
           >
              <ShieldCheck className={cn("h-6 w-6", pathname === '/auth' ? "text-emerald" : "group-hover:text-emerald")} />
              <span className="hidden lg:block font-bold">Auth & Privacy</span>
           </Link>
           <Link 
             href="/settings" 
             className={cn(
               "flex items-center gap-5 px-5 py-3.5 text-[15px] transition-all group rounded-2xl",
               pathname === '/settings' ? "bg-cyan/10 text-cyan" : "text-text-tertiary hover:text-text-primary hover:bg-surface-2/40"
             )}
           >
              <Settings className={cn("h-6 w-6", pathname === '/settings' ? "text-cyan" : "group-hover:text-cyan")} />
              <span className="hidden lg:block font-bold">Global Settings</span>
           </Link>
        </div>

        {/* System Status Metrics */}
        <div className="mt-auto px-4 pb-12 hidden lg:block">
          <div className="rounded-[28px] border-2 border-white/10 bg-gradient-to-br from-surface-2/80 to-surface-1/40 p-6 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan/5 rounded-full blur-[80px] group-hover:bg-cyan/10 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">System Integrity</span>
                 <div className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-emerald animate-pulse" />
                    <span className="text-[10px] font-black text-emerald tracking-widest drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">STABLE</span>
                 </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/50 border border-white/5 overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "98.6%" }}
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                />
              </div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
               <div className="flex items-center gap-3 text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                  <div className="p-1.5 rounded-lg bg-cyan/10 border border-cyan/20">
                    <Activity className="h-4 w-4 text-cyan" />
                  </div>
                  <span>Latency</span>
               </div>
               <span className="text-base font-black text-white tracking-tight">24<span className="text-[10px] text-text-tertiary ml-1 uppercase">ms</span></span>
            </div>
 
            <div className="relative z-10 pt-6 border-t border-white/10">
               <div className="flex items-center gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-cyan/20 to-blue-600/10 border border-cyan/30 flex items-center justify-center text-xs font-black text-cyan shadow-xl group-hover:scale-105 transition-transform">
                     MA
                  </div>
                  <div className="min-w-0">
                     <div className="text-[15px] font-black text-white leading-tight tracking-tight truncate">Mahak Labs</div>
                     <div className="text-[10px] font-bold text-text-tertiary mt-1 tracking-wider uppercase opacity-70">Enterprise Core</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
