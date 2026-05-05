"use client";

import { Settings, User, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useDiscovery } from "@/store/discovery";

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
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-void/70 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.35em] text-text-tertiary">DiffuCat</span>
          <span className="text-sm text-text-secondary">Molecular Engine</span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
          <StatusDot label="API Connected" status={apiStatus} />
          <StatusDot label="Model: Trained" status={isTraining ? "loading" : "connected"} />
          <StatusDot label="System: Stable" status="connected" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-cyan hover:bg-cyan/10">
            <Activity className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-cyan hover:bg-cyan/10">
            <ShieldCheck className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-cyan hover:bg-cyan/10">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-text-secondary hover:text-cyan hover:bg-cyan/10">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function StatusDot({ label, status }: { label: string; status: "connected" | "loading" | "error" }) {
  const color = status === "connected" ? "bg-emerald" : status === "loading" ? "bg-amber" : "bg-red";
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <span className={`h-2 w-2 rounded-full ${color} ${status === "loading" ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </div>
  );
}

