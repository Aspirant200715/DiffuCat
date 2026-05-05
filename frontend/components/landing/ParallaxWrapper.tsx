"use client";

import { useEffect, useRef } from "react";

interface ParallaxWrapperProps {
  children: React.ReactNode;
  speed?: number; // multiplier for parallax movement
  className?: string;
}

export default function ParallaxWrapper({ children, speed = 0.2, className = '' }: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    function onScroll() {
      if (!el) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const offset = window.scrollY || window.pageYOffset;
        const y = (rect.top + offset) * speed * -1;
        el.style.transform = `translateY(${y}px)`;
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', transition: 'transform 0.1s linear' }}>
      {children}
    </div>
  );
}
