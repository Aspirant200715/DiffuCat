"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Beaker, LayoutDashboard, Dna } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Molecular Engine",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Structural Archive",
      href: "/molecules/CCO", // Default or last viewed molecule
      icon: Dna,
    },
    {
      title: "Experimental Forge",
      href: "/lab",
      icon: Beaker,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 border-r border-border bg-card">
      <div className="h-full px-4 py-6 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 mb-10 px-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:border-primary/60 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">DiffuCat</span>
        </Link>
        
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href.split('/')[1] ? `/${item.href.split('/')[1]}` : item.href);
            
            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all group",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/15" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="ml-3 text-sm">{item.title}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
