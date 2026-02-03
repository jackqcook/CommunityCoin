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
        midnight: "#1a1a2e",
        obsidian: "#f8f9fa",
        slate: "#f1f3f5",
        graphite: "#e9ecef",
        smoke: "#6b7280",
        pearl: "#1f2937",
        ember: "#dc143c",
        flame: "#e63946",
        gold: "#b8860b",
        mint: "#059669",
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
          "0%": { boxShadow: "0 0 20px rgba(220, 20, 60, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(220, 20, 60, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
