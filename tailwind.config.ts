import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        "primary-dark": "var(--color-primary-dark)",
        secondary: "var(--color-secondary)",
        "secondary-light": "var(--color-secondary-light)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "surface-0": "var(--color-surface-0)",
        "surface-1": "var(--color-surface-1)",
        "surface-2": "var(--color-surface-2)",
        "surface-3": "var(--color-surface-3)",
        "role-admin": "var(--color-role-admin)",
        "role-teacher": "var(--color-role-teacher)",
        "role-parent": "var(--color-role-parent)",
        "role-student": "var(--color-role-student)",
      },
      fontFamily: {
        rubik: ["var(--font-rubik)", "sans-serif"],
        heebo: ["var(--font-heebo)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        theme: "var(--theme-card-radius)",
      },
      boxShadow: {
        theme: "var(--theme-card-shadow)",
      },
      transitionDuration: {
        theme: "var(--theme-animation-duration)",
      },
      transitionTimingFunction: {
        theme: "var(--theme-animation-easing)",
      },
      maxWidth: {
        theme: "var(--theme-content-max-width)",
      },
      gap: {
        theme: "var(--theme-card-gap)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(100%)", opacity: "0" },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        celebrate: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "bounce-playful": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(16,185,129,0.3)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },
        "portal-appear": {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "fade-out": "fadeOut 200ms ease-out",
        "slide-up": "slideUp 300ms ease-out",
        "slide-down": "slideDown 300ms ease-out",
        "slide-in-right": "slideInRight 300ms ease-out",
        "slide-out-right": "slideOutRight 300ms ease-out",
        "scale-in": "scaleIn 200ms ease-out",
        shimmer: "shimmer 2s infinite linear",
        celebrate: "celebrate 500ms ease-in-out",
        bounce: "bounce 600ms ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        spin: "spin 1s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        confetti: "confetti 3s ease-out forwards",
        "bounce-playful": "bounce-playful 600ms var(--theme-animation-easing) infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        wiggle: "wiggle 300ms ease-in-out",
        twinkle: "twinkle 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "portal-appear": "portal-appear 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
