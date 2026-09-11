"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which of a list of section refs currently sits in a thin band at
 * vertical centre — the standard scrollytelling technique for driving a
 * pinned visual from scroll position, without any scroll-jacking.
 */
export function useScrollActiveIndex(
  refs: React.RefObject<HTMLElement>[],
): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.forEach((ref, index) => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry && entry.isIntersecting) setActive(index);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs.length]);

  return active;
}
