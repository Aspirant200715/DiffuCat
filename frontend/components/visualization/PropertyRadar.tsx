'use client';

import { PredictionResult } from '@/lib/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PropertyRadarProps {
  data: PredictionResult[];
}

export function PropertyRadar({ data }: PropertyRadarProps) {
  if (!data.length) {
    return (
      <div className="glass rounded-2xl border border-border/80 p-6 h-[320px] flex items-center justify-center text-text-tertiary font-mono text-xs">
        Radar telemetry standby
      </div>
    );
  }

  const avgActivity = data.reduce((acc, cur) => acc + (cur.metrics?.activity ?? 0), 0) / data.length;
  const avgSelectivity = data.reduce((acc, cur) => acc + (cur.metrics?.selectivity ?? 0), 0) / data.length;
  const avgStability = data.reduce((acc, cur) => acc + (cur.metrics?.stability ?? 0), 0) / data.length;

  const chartData = [
    { subject: 'Activity', value: avgActivity },
    { subject: 'Selectivity', value: avgSelectivity },
    { subject: 'Stability', value: avgStability },
  ];

  return (
    <div className="glass rounded-2xl border border-border/80 p-6">
      <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Batch Radar</div>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="75%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Radar dataKey="value" stroke="#0EA5E9" fill="rgba(14,165,233,0.35)" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
