import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0a0a0f",
        obsidian: "#12121a",
        slate: "#1a1a24",
        graphite: "#252532",
        smoke: "#8888a0",
        pearl: "#e8e8f0",
        ember: "#ff6b35",
        flame: "#ff8c42",
        gold: "#ffd700",
        mint: "#00d4aa",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(255, 107, 53, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
