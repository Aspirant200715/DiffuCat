"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Atom, FlaskConical, LayoutDashboard, Dna } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { title: "Molecular Engine", href: "/dashboard", icon: LayoutDashboard },
  { title: "Experimental Forge", href: "/lab", icon: FlaskConical },
  { title: "Structural Archive", href: "/molecules/CCO", icon: Dna },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-16 lg:w-[220px] border-r border-border/60 bg-void/85 backdrop-blur-2xl">
      <div className="flex h-full flex-col py-6">
        <div className="flex items-center justify-center lg:justify-start px-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan/30 to-emerald/20 border border-border/60 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.25)]">
              <Atom className="h-5 w-5 text-cyan" />
            </div>
            <span className="hidden lg:block text-lg font-semibold tracking-tight text-text-primary">DiffuCat</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-2 lg:px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href);
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all",
                  isActive
                    ? "bg-cyan/10 text-cyan border-l-2 border-cyan"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2/40"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden lg:block font-medium">{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-xl border border-cyan/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-6 hidden lg:block">
          <div className="rounded-xl border border-border/70 bg-surface-1/80 px-4 py-3 text-[11px] text-text-secondary">
            <div className="font-mono uppercase tracking-[0.2em] text-text-tertiary">System</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-emerald">Stability</span>
              <span className="text-text-primary">98.6%</span>
            </div>
            <div className="mt-2 h-1 w-full rounded-full bg-surface-2">
              <div className="h-full w-[85%] rounded-full bg-emerald" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

