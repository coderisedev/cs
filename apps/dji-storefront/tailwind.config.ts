import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "16px",
        xs: "20px",
        sm: "24px",
        lg: "32px",
        xl: "40px",
      },
      screens: {
        xs: "430px",    // Large phones (iPhone 14 Pro Max)
        sm: "734px",    // Apple Mobile Breakpoint
        md: "1068px",   // Apple Tablet Breakpoint
        lg: "1440px",   // Apple Desktop Breakpoint
        xl: "1440px",   // Max Width
      },
    },
    screens: {
      xs: "430px",      // Large phones (iPhone 14 Pro Max)
      mobile: "600px",  // H5 optimization breakpoint
      sm: "734px",      // Apple Mobile Breakpoint
      md: "1068px",     // Apple Tablet Breakpoint
      lg: "1440px",     // Apple Desktop Breakpoint
      xl: "1680px",     // Extra large screens
    },
    extend: {
      spacing: {
        // Apple 8px Grid System
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        30: "120px",
      },
      fontSize: {
        // Apple Typography Scale
        "2xs": ["10px", { lineHeight: "12px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["17px", { lineHeight: "25px", letterSpacing: "-0.022em" }], // Apple Body
        lg: ["19px", { lineHeight: "24px", letterSpacing: "0.012em" }],
        xl: ["21px", { lineHeight: "28px", letterSpacing: "0.011em" }],
        "2xl": ["24px", { lineHeight: "28px", letterSpacing: "0.009em" }],
        "3xl": ["28px", { lineHeight: "32px", letterSpacing: "0.007em" }],
        "4xl": ["34px", { lineHeight: "40px", letterSpacing: "0.004em" }], // H1
        "5xl": ["40px", { lineHeight: "44px", letterSpacing: "0" }],       // H3
        "6xl": ["48px", { lineHeight: "52px", letterSpacing: "-0.003em" }], // Hero
        "7xl": ["56px", { lineHeight: "60px", letterSpacing: "-0.005em" }], // Large Hero
      },
      fontFamily: {
        // Apple System Font Stack
        primary: [
          "SF Pro Text",
          "SF Pro Icons",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        display: [
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        mono: ["SF Mono", "Menlo", "Monaco", "Courier New", "monospace"],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      letterSpacing: {
        tight: "-0.022em",
        normal: "0",
        wide: "0.012em",
      },
      colors: {
        // Mapped to CSS Variables
        background: {
          primary: "hsl(var(--background-primary))",
          secondary: "hsl(var(--background-secondary))",
          elevated: "hsl(var(--background-elevated))",
          overlay: "hsl(var(--background-overlay))",
        },
        foreground: {
          primary: "hsl(var(--foreground-primary))",
          secondary: "hsl(var(--foreground-secondary))",
          muted: "hsl(var(--foreground-muted))",
        },
        brand: {
          blue: {
            500: "hsl(var(--brand-blue-500) / <alpha-value>)",
            600: "hsl(var(--brand-blue-600) / <alpha-value>)",
            700: "hsl(var(--brand-blue-700) / <alpha-value>)",
          },
        },
        primary: {
          500: "hsl(var(--brand-blue-500) / <alpha-value>)",
          600: "hsl(var(--brand-blue-600) / <alpha-value>)",
          700: "hsl(var(--brand-blue-700) / <alpha-value>)",
        },
        border: {
          DEFAULT: "hsl(var(--border-primary))",
          primary: "hsl(var(--border-primary))",
          secondary: "hsl(var(--border-secondary))",
        },
        semantic: {
          error: "hsl(0 84% 60%)", // Apple Red
          success: "hsl(142 71% 45%)", // Apple Green
          warning: "hsl(32 95% 44%)", // Apple Orange
        },
      },

      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "18px",   // Apple Card Radius
        xl: "24px",
        pill: "980px", // Apple Button Radius
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        modal: "var(--shadow-modal)",
        "glow-blue": "var(--shadow-glow-blue)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
