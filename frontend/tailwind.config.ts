import type { Config } from "tailwindcss";

/** Token-backed color. Keeps Tailwind's `/opacity` syntax working. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  // Tokens carry light/dark themselves, so `dark:` is only a safety net for
  // any variant that hasn't been converted yet.
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Semantic tokens defined in app/globals.css, swapped per [data-theme].
      colors: {
        bg: token("bg"),
        surface: {
          DEFAULT: token("surface"),
          2: token("surface-2"),
          alt: token("surface-alt"),
        },
        line: {
          DEFAULT: token("border"),
          subtle: token("border-subtle"),
        },
        // `ink` keeps its existing name so the ~90 text-ink* usages become
        // theme-aware without edits.
        ink: {
          DEFAULT: token("text"),
          soft: token("text-soft"),
          faint: token("text-faint"),
        },
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          fg: token("accent-fg"),
        },
        inverted: {
          DEFAULT: token("inverted"),
          fg: token("inverted-fg"),
        },
        success: token("success"),
        danger: token("danger"),
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
