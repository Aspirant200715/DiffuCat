"use client";

import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  
  // Format pathname to Title Case
  const pageTitle = pathname === "/" 
    ? "Welcome" 
    : pathname.split("/")[1].charAt(0).toUpperCase() + pathname.split("/")[1].slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
        <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono h-5 bg-card text-muted-foreground border-border/50">
          v2.0-pro
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
