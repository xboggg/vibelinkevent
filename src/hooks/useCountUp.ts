import { useState, useEffect, useRef } from "react";

interface UseCountUpProps {
  end: number;
  duration?: number;
  startOnView?: boolean;
}

export function useCountUp({ end, duration = 2000, startOnView = true }: UseCountUpProps) {
  // Initialize to end value: if observer never fires (above-fold, fast scroll,
  // headless screenshots), the correct number is shown instead of 0.
  const [count, setCount] = useState(end);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setCount(0);
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setCount(0);
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Safety fallback: if observer hasn't fired after 3s, just show end value.
    const fallback = setTimeout(() => {
      if (!hasStarted) setCount(end);
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [startOnView, hasStarted, end]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return { count, ref };
}
