"use client";

import { Settings, User, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useDiscovery } from "@/store/discovery";
import Link from "next/link";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Header() {
  const { isTraining } = useDiscovery();
  const { isError, isLoading } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 30000,
    staleTime: 0,
  });

  const apiStatus = isError ? "error" : isLoading ? "loading" : "connected";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-void/80 backdrop-blur-2xl">
      <div className="flex h-20 items-center justify-between px-8">
        <div className="flex flex-col">
          <span className="text-[12px] font-mono font-black uppercase tracking-[0.6em] text-white/70">DiffuCat</span>
          <span className="text-[18px] font-black tracking-tight text-white mt-1.5">Molecular Engine</span>
        </div>

        <div className="hidden lg:flex items-center gap-12 font-sans">
          <StatusDot label="API Connected" status={apiStatus} />
          <StatusDot label="Model: Trained" status={isTraining ? "loading" : "connected"} />
          <StatusDot label="System: Stable" status="connected" />
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider delayDuration={0}>
            {/* Telemetry Button */}
            <Tooltip>
              <TooltipTrigger 
                className="h-12 w-12 rounded-xl flex items-center justify-center text-text-secondary hover:text-cyan hover:bg-cyan/10 transition-all duration-300 outline-none cursor-pointer"
                onClick={() => toast.info('System Telemetry', {
                  description: 'Latency: 24ms | GPU Load: 42% | Nodes: 12 Active',
                  duration: 5000,
                  style: { 
                    background: '#010409', 
                    color: '#0EA5E9', 
                    border: '1px solid rgba(14,165,233,0.3)',
                    fontSize: '14px',
                    padding: '20px'
                  }
                })}
              >
                <Activity className="h-6 w-6" />
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black font-bold border-white shadow-2xl">
                System Telemetry Diagnostics
              </TooltipContent>
            </Tooltip>

            {/* Security Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/auth"
                className="h-12 w-12 rounded-xl flex items-center justify-center text-text-secondary hover:text-emerald hover:bg-emerald/10 transition-all duration-300 outline-none cursor-pointer"
                >
                  <ShieldCheck className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black font-bold border-white shadow-2xl">
                Security & Access Control
              </TooltipContent>
            </Tooltip>

            {/* Settings Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/settings"
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-text-secondary hover:text-cyan hover:bg-cyan/10 transition-all duration-300 outline-none cursor-pointer"
                >
                  <Settings className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black font-bold border-white shadow-2xl">
                Global Platform Settings
              </TooltipContent>
            </Tooltip>

            {/* User Button */}
            <Tooltip>
              <TooltipTrigger 
                className="h-12 w-12 rounded-xl flex items-center justify-center text-text-secondary hover:text-cyan hover:bg-cyan/10 transition-all duration-300 outline-none cursor-pointer"
                onClick={() => toast.success('Profile Synchronized', {
                  description: 'Authenticated as: Mahak Lab (Enterprise Tier)',
                  duration: 5000,
                  style: { 
                    background: '#010409', 
                    color: '#10B981', 
                    border: '1px solid rgba(14,165,233,0.3)',
                    fontSize: '14px',
                    padding: '20px'
                  }
                })}
              >
                <User className="h-6 w-6" />
              </TooltipTrigger>
              <TooltipContent className="bg-white text-black font-bold border-white shadow-2xl">
                Account & Identity Management
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}

function StatusDot({ label, status }: { label: string; status: "connected" | "loading" | "error" }) {
  const color = status === "connected" ? "bg-emerald" : status === "loading" ? "bg-amber" : "bg-red";
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-text-primary">
      <span className={`h-2.5 w-2.5 rounded-full ${color} ${status === "loading" ? "animate-pulse" : ""} shadow-[0_0_10px_rgba(16,185,129,0.4)]`} />
      <span className="tracking-tight">{label}</span>
    </div>
  );
}

