"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionResult } from "@/lib/types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface PropertyRadarProps {
  data: PredictionResult[];
}

export function PropertyRadar({ data }: PropertyRadarProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (data.length === 0) {
    return (
      <Card className="glass-panel h-full flex flex-col relative overflow-hidden group hud-border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -z-10 rounded-full" />
        <CardHeader className="pb-2 border-b border-primary/20 bg-muted/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary/50">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
            Radar Telemetry [Standby]
          </CardTitle>
          <CardDescription className="text-xs text-primary/40 font-mono">
            Awaiting signal inputs...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[250px] relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-48 h-48 rounded-full border border-primary/30" />
            <div className="absolute w-32 h-32 rounded-full border border-primary/20" />
            <div className="absolute w-16 h-16 rounded-full border border-primary/10" />
            <div className="absolute w-full h-px bg-primary/20 rotate-45" />
            <div className="absolute w-full h-px bg-primary/20 -rotate-45" />
            <div className="absolute w-px h-full bg-primary/20" />
            <div className="absolute w-[200%] h-full bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--primary)/0.2)_60deg,transparent_60deg)] rounded-full animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <p className="text-primary/40 font-mono text-xs z-10 bg-background/50 px-3 py-1 rounded backdrop-blur-sm border border-primary/10">No Target Acquired</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate averages
  const avgActivity = data.reduce((acc, curr) => acc + curr.metrics.activity, 0) / data.length;
  const avgSelectivity = data.reduce((acc, curr) => acc + curr.metrics.selectivity, 0) / data.length;
  const avgStability = data.reduce((acc, curr) => acc + curr.metrics.stability, 0) / data.length;

  const chartData = [
    { subject: 'Activity', A: avgActivity, fullMark: 100 },
    { subject: 'Selectivity', A: avgSelectivity, fullMark: 100 },
    { subject: 'Stability', A: avgStability, fullMark: 100 },
  ];

  const strokeColor = mounted && theme === 'dark' ? 'hsl(199 89% 48%)' : 'hsl(199 89% 48%)';
  const fillColor = mounted && theme === 'dark' ? 'hsl(199 89% 48% / 0.3)' : 'hsl(199 89% 48% / 0.3)';
  const gridColor = mounted && theme === 'dark' ? '#333' : '#ccc';
  const textColor = mounted && theme === 'dark' ? '#aaa' : '#555';

  return (
    <Card className="glass-panel h-full flex flex-col relative overflow-hidden group border-border/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -z-10 rounded-full group-hover:bg-primary/20 transition-colors duration-700" />
      <CardHeader className="pb-2 border-b border-border/40 bg-muted/10">
        <CardTitle className="text-sm font-semibold">Average Properties</CardTitle>
        <CardDescription className="text-xs">Batch aggregate predictions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center min-h-[250px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: textColor, fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: textColor, fontSize: 10 }} />
              <Radar name="Batch Avg" dataKey="A" stroke={strokeColor} fill={fillColor} fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
