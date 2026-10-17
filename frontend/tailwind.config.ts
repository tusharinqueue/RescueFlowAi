import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "var(--font-inter)", ...fontFamily.sans],
        mono: ["JetBrains Mono", "var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Emergency domain palette ──────────────────────────────────
        emergency: {
          50:  "hsl(0, 100%, 97%)",
          100: "hsl(0, 100%, 94%)",
          200: "hsl(0, 100%, 87%)",
          300: "hsl(0, 90%, 75%)",
          400: "hsl(0, 86%, 62%)",
          500: "hsl(0, 84%, 52%)",   // critical red
          600: "hsl(0, 78%, 42%)",
          700: "hsl(0, 74%, 34%)",
          800: "hsl(0, 70%, 28%)",
          900: "hsl(0, 65%, 20%)",
        },
        severity: {
          critical: "hsl(0 78% 55%)",
          high:     "hsl(22 95% 55%)",
          moderate: "hsl(38 96% 52%)",
          low:      "hsl(142 76% 40%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "18":  "4.5rem",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "pulse-alert": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%":   { opacity: "0", transform: "scale(0.97) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-in-left": {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        scan: {
          "0%":   { top: "-5%" },
          "100%": { top: "105%" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "pulse-alert":     "pulse-alert 2s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer:           "shimmer 1.5s linear infinite",
        "fade-in":         "fade-in 0.35s cubic-bezier(0.25,1,0.5,1) both",
        "fade-scale":      "fade-in-scale 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-left":      "slide-in-left 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-right":     "slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up":        "slide-in-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-ring":      "pulse-ring 1.5s ease-out infinite",
        float:             "float-y 3s ease-in-out infinite",
        scan:              "scan 3s linear infinite",
      },
      backgroundImage: {
        "grid-dark": `
          repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.012) 59px, rgba(255,255,255,0.012) 60px),
          repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.012) 59px, rgba(255,255,255,0.012) 60px)
        `,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
