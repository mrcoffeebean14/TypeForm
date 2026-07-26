import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Typeform-like ink + accent palette. Ink is a warm near-black, not
        // pure black, matching Typeform's softer text tone.
        ink: {
          DEFAULT: "#262627",
          soft: "#4B4B4B",
          faint: "#767676",
        },
        accent: {
          DEFAULT: "#0445AF",
          hover: "#03389B",
        },
        // Restrained warm-neutral band for alternating marketing sections.
        paper: "#F5F4F1",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
