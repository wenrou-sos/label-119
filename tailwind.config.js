/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        obsidian: "#08090d",
        panel: "#0f1117",
        "panel-2": "#151821",
        "panel-3": "#1c2030",
        edge: "#232733",
        "edge-soft": "#1a1d27",
        acid: {
          DEFAULT: "#b6ff3a",
          soft: "#8fcc2e",
          glow: "rgba(182,255,58,0.35)",
        },
        ember: {
          DEFAULT: "#ff6b35",
          soft: "#cc5429",
          glow: "rgba(255,107,53,0.35)",
        },
        steel: {
          DEFAULT: "#38bdf8",
          soft: "#2b7fb8",
          glow: "rgba(56,189,248,0.3)",
        },
        violetx: {
          DEFAULT: "#a78bfa",
        },
        ink: {
          900: "#08090d",
          800: "#0c0e14",
          700: "#0f1117",
          600: "#151821",
          500: "#1c2030",
          400: "#232733",
          300: "#2e3342",
        },
        muted: "#8b93a7",
        fg: "#e6e9ef",
      },
      fontFamily: {
        display: ['"Chakra Petch"', "sans-serif"],
        sans: ['"Saira"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(182,255,58,0.25), 0 0 24px -6px rgba(182,255,58,0.45)",
        "glow-ember":
          "0 0 0 1px rgba(255,107,53,0.25), 0 0 24px -6px rgba(255,107,53,0.45)",
        "glow-steel":
          "0 0 0 1px rgba(56,189,248,0.25), 0 0 24px -6px rgba(56,189,248,0.4)",
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -16px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(35,39,51,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(35,39,51,0.5) 1px, transparent 1px)",
        "radial-acid":
          "radial-gradient(600px circle at 0% 0%, rgba(182,255,58,0.08), transparent 45%)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.8)" },
        },
        "sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "grow-w": {
          "0%": { width: "0%" },
          "100%": { width: "var(--w, 100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "sweep": "sweep 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
