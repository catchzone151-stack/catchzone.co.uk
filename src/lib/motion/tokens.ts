export const easing = {
  cinematic: [0.16, 1, 0.3, 1] as const,
  precise: [0.65, 0, 0.35, 1] as const,
  standard: [0.4, 0, 0.2, 1] as const,
};

export const duration = {
  instant: 0.15,
  fast: 0.3,
  base: 0.6,
  slow: 0.9,
  cinematic: 1.4,
};

export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
};

export const viewport = {
  once: true,
  margin: "-10% 0px -10% 0px",
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.cinematic },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.base, ease: easing.standard },
  },
};
