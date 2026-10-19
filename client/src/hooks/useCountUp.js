import { useEffect, useState } from "react";

/** Eases a number from 0 to `target` over `duration` ms (respects reduced motion). */
const useCountUp = (target = 0, duration = 600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = Number(target) || 0;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced || end === 0) {
      const id = requestAnimationFrame(() => setValue(end));
      return () => cancelAnimationFrame(id);
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

export default useCountUp;
