const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        // DJI Design System - Primary Colors
        dji: {
          blue: "rgb(0, 112, 213)",
          black: "rgb(0, 0, 0)",
          white: "rgb(255, 255, 255)",
        },
        // Reference project primary/secondary for gradient
        primary: {
          50: "#f5f7ff",
          100: "#ebefff",
          200: "#d6dfff",
          300: "#b3c2ff",
          400: "#8a9dff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          DEFAULT: "#8b5cf6",
          foreground: "#ffffff",
        },
        // DJI Design System - Gray Scale
        gray: {
          50: "rgb(250, 250, 250)",
          100: "rgb(247, 249, 250)",
          200: "rgb(242, 242, 242)",
          300: "rgb(238, 238, 237)",
          400: "rgb(237, 237, 237)",
          500: "rgb(145, 150, 153)",
          600: "rgb(108, 112, 115)",
          700: "rgb(97, 100, 102)",
          800: "rgb(60, 62, 64)",
          900: "rgb(48, 50, 51)",
        },
        // DJI Design System - Semantic Colors
        error: "rgb(211, 32, 41)",
        success: "rgb(24, 144, 255)",
        link: "rgb(0, 0, 238)",
        // Keep Medusa grey for compatibility
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
      },
      borderRadius: {
        // DJI Standard Radius System
        xs: "2px",
        sm: "4px",
        base: "6px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        // DJI Capsule System
        pill: "60px",
        "pill-md": "64px",
        "pill-lg": "99px",
        "pill-xl": "999px",
        "pill-xxl": "1408px",
        full: "9999px",
        // Legacy Medusa support
        none: "0px",
        soft: "2px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        // DJI Mobile-First Breakpoints
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        // Legacy Medusa breakpoints
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontSize: {
        // DJI Typography Scale
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
        "5xl": ["48px", { lineHeight: "52px" }],
        "6xl": ["64px", { lineHeight: "68px" }],
      },
      fontFamily: {
        // DJI Design System Font
        primary: [
          "Open Sans",
          "PingFang SC",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Hiragino Sans GB",
          "WenQuanYi Micro Hei",
          "Arial",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
        // Medusa default (fallback)
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
      },
      spacing: {
        // DJI 8px Grid System
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
        32: "128px",
      },
      boxShadow: {
        // DJI 7-Level Shadow System
        xs: "rgba(0, 0, 0, 0.05) 0px 2px 4px 0px",
        sm: "rgba(0, 0, 0, 0.1) 0px 2px 6px 0px",
        md: "rgba(0, 0, 0, 0.1) 0px 8px 16px 0px",
        lg: "rgba(0, 0, 0, 0.1) 0px 16px 16px 0px",
        xl: "rgba(0, 0, 0, 0.1) 0px 16px 32px 0px",
        directional: "rgba(0, 0, 0, 0.1) 4px 4px 8px 0px",
        elevated: "rgba(0, 0, 0, 0.2) 0px 2px 8px 0px",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
