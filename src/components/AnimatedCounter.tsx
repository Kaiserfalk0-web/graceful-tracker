import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({ value, prefix = "", duration = 1200, decimals = 2 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className="animate-counter-up">
      {prefix}{formatted}
    </span>
  );
}
