import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#040406",
        surface: {
          DEFAULT: "#0A0B0E",
          raised: "#12141A",
        },
        ink: {
          DEFAULT: "#E6EBF0",
          muted: "#828B9A",
          faint: "#565F6E",
        },
        accent: {
          cyan: "#5EEAD4",
          iris: "#6E62E5",
        },
        line: "rgba(255,255,255,0.07)",
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
  plugins: [],
};

export default config;
