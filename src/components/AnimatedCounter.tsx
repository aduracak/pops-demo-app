import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 650,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isBumping, setIsBumping] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    setIsBumping(true);
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = endVal;
        setTimeout(() => setIsBumping(false), 180);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return (
    <span
      className={`inline-block transition-transform duration-200 ${
        isBumping ? 'scale-110 text-[#DF3B16]' : 'scale-100'
      } ${className}`}
    >
      {displayValue}
    </span>
  );
};
