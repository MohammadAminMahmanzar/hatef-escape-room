import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#04060f",
          800: "#070b1c",
          700: "#0b1230",
          600: "#111a44",
        },
        cyanGlow: "#38f0e6",
        amberGlow: "#ffb347",
        dangerGlow: "#ff4d5e",
      },
      fontFamily: {
        sans: ["var(--font-vazir)", "Vazirmatn", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(56, 240, 230, 0.45)",
        amber: "0 0 24px rgba(255, 179, 71, 0.45)",
        danger: "0 0 24px rgba(255, 77, 94, 0.5)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.97)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "0.85" },
          "50%": { opacity: "0.4" },
          "55%": { opacity: "0.9" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        flicker: "flicker 3s linear infinite",
        scan: "scan 6s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
