'use client';

import { useEffect, useMemo, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Discovery Acceleration', value: 12, suffix: 'x' },
  { label: 'Success Probability', value: 99, suffix: '%' },
  { label: 'Latency per Inference', value: 140, suffix: 'ms' },
];

export default function StatsSection() {
  const [progress, setProgress] = useState(0);
  const targets = useMemo(() => stats.map((s) => s.value), []);

  const { ref, isInView } = useScrollAnimation(0.4);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const start = performance.now();
    const duration = 2000;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * t);
      setProgress(easeOutExpo);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView]);

  return (
    <section ref={ref} className="py-40 px-6 bg-[#030712] relative overflow-hidden">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24 relative z-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className="text-center"
          >
            <div className="text-6xl md:text-7xl font-bold font-display tracking-tighter text-white mb-4">
              {Math.round(targets[i] * progress)}{stat.suffix}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
