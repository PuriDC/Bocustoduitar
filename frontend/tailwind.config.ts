import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0806",
        surface: "#0f0d0a",
        "surface-container-lowest": "#070605",
        "surface-container-low": "#100e0b",
        "surface-container": "#171310",
        "surface-container-high": "#201b16",
        "surface-container-highest": "#2a231c",
        "surface-bright": "#241e18",
        "on-surface": "#f1e7d8",
        "on-surface-variant": "#c9b8a0",
        outline: "#4a3f30",
        "outline-variant": "#2a2319",
        primary: "#d4a94a",
        "primary-dim": "#b8903a",
        "on-primary": "#0a0806",
        "primary-container": "#2e2410",
        "on-primary-container": "#f2dca3",
        secondary: "#9c8468",
        tertiary: "#7a97a3",
        error: "#e5877a"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Cormorant Garamond", "serif"],
        body: ["Space Grotesk", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
