import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme tokens (see globals.css). Dark values are the original palette;
        // [data-theme="light"] swaps them, `.theme-dark` scopes restore dark.
        void: "rgb(var(--void-rgb) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface-rgb) / <alpha-value>)",
          raised: "rgb(var(--surface-raised-rgb) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
          muted: "rgb(var(--ink-muted-rgb) / <alpha-value>)",
          faint: "rgb(var(--ink-faint-rgb) / <alpha-value>)",
        },
        accent: {
          cyan: "rgb(var(--accent-cyan-rgb) / <alpha-value>)",
          iris: "rgb(var(--accent-iris-rgb) / <alpha-value>)",
        },
        line: "rgb(var(--tint-rgb) / var(--line-alpha))",
        // Hairlines and frosted fills (`border-white/10`, `bg-white/[0.03]`) follow
        // the theme: white on dark, near-black on light.
        white: "rgb(var(--tint-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        shell: "1440px",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
        precise: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      zIndex: {
        nav: "100",
        overlay: "200",
        intro: "300",
      },
    },
  },
  plugins: [
    // `light:` — styles that apply only in the light theme, e.g. `light:bg-white`.
    // Dark-theme classes stay untouched, so the original dark design is preserved.
    plugin(({ addVariant }) => {
      addVariant("light", '[data-theme="light"] &');
    }),
  ],
};

export default config;
