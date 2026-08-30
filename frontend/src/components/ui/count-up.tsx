"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Animates from 0 to `end` over `duration` ms using easeOutExpo easing.
 */
export function CountUp({
  end,
  duration = 1400,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(eased * end);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);

  const display = value.toFixed(decimals);
  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
