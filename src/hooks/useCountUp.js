import { useState, useEffect, useRef } from 'react';

/**
 * Animated number count-up hook
 * @param {number} target - The target number to count up to
 * @param {number} duration - Animation duration in ms (default: 600)
 * @param {number} decimals - Number of decimal places to format (default: 0)
 * @returns {string|number} The animated value formatted with specified decimals
 */
export const useCountUp = (target = 0, duration = 600, decimals = 0) => {
  const [value, setValue] = useState(0);
  const startRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // If target is 0 or NaN, reset immediately
    const targetNum = Number(target) || 0;
    const startNum = startRef.current;
    const diff = targetNum - startNum;

    if (diff === 0) {
      setValue(targetNum);
      return;
    }

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: 1 - Math.pow(1 - p, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = startNum + diff * easeProgress;

      setValue(currentVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(targetNum);
        startRef.current = targetNum;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [target, duration]);

  // Format value with requested decimals
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
};

export default useCountUp;
