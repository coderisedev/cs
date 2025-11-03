const withOpacityValue = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `hsl(var(${variable}))`
    }

    return `hsl(var(${variable}) / ${opacityValue})`
  }
}

const colors = {
  transparent: "transparent",
  current: "currentColor",
  surface: {
    primary: withOpacityValue("--dji-color-surface-primary"),
    secondary: withOpacityValue("--dji-color-surface-secondary"),
    elevated: withOpacityValue("--dji-color-surface-elevated"),
    overlay: withOpacityValue("--dji-color-surface-overlay"),
    field: withOpacityValue("--dji-color-surface-field"),
    "field-hover": withOpacityValue("--dji-color-surface-field-hover"),
    interactive: withOpacityValue("--dji-color-surface-interactive"),
    "interactive-hover": withOpacityValue(
      "--dji-color-surface-interactive-hover"
    ),
    "neutral-hover": withOpacityValue("--dji-color-surface-neutral-hover"),
    disabled: withOpacityValue("--dji-color-surface-disabled"),
    "component-pressed": withOpacityValue(
      "--dji-color-surface-component-pressed"
    ),
  },
  foreground: {
    base: withOpacityValue("--dji-color-foreground-base"),
    subtle: withOpacityValue("--dji-color-foreground-subtle"),
    muted: withOpacityValue("--dji-color-foreground-muted"),
    disabled: withOpacityValue("--dji-color-foreground-disabled"),
    inverse: withOpacityValue("--dji-color-foreground-inverse"),
    on: withOpacityValue("--dji-color-foreground-on-color"),
    interactive: withOpacityValue("--dji-color-foreground-interactive"),
    "interactive-hover": withOpacityValue(
      "--dji-color-foreground-interactive-hover"
    ),
  },
  border: {
    base: withOpacityValue("--dji-color-border-base"),
    secondary: withOpacityValue("--dji-color-border-secondary"),
    interactive: withOpacityValue("--dji-color-border-interactive"),
  },
  accent: {
    DEFAULT: withOpacityValue("--dji-color-foreground-interactive"),
    hover: withOpacityValue("--dji-color-foreground-interactive-hover"),
  },
  status: {
    success: withOpacityValue("--dji-color-status-success"),
    error: withOpacityValue("--dji-color-status-error"),
    warning: withOpacityValue("--dji-color-status-warning"),
  },
  focus: {
    ring: withOpacityValue("--dji-color-focus-ring"),
  },
}

const fontFamily = {
  sans: ["var(--dji-font-family-sans)", "system-ui", "sans-serif"],
  primary: ["var(--dji-font-family-sans)", "system-ui", "sans-serif"],
  mono: ["var(--dji-font-family-mono)", "monospace"],
}

const fontSize = {
  xs: ["var(--dji-type-compact-small)", { lineHeight: "var(--dji-leading-tight)" }],
  sm: [
    "var(--dji-type-compact-small-plus)",
    { lineHeight: "var(--dji-leading-tight)" },
  ],
  base: ["var(--dji-type-compact-medium)", { lineHeight: "var(--dji-leading-base)" }],
  lg: ["var(--dji-type-medium)", { lineHeight: "var(--dji-leading-base)" }],
  xl: ["var(--dji-type-large)", { lineHeight: "var(--dji-leading-relaxed)" }],
  "2xl": ["var(--dji-type-xlarge)", { lineHeight: "var(--dji-leading-relaxed)" }],
  "3xl": ["2rem", { lineHeight: "var(--dji-leading-relaxed)" }],
  "4xl": ["2.5rem", { lineHeight: "1.2" }],
  "5xl": ["3rem", { lineHeight: "1.2" }],
}

const spacing = {
  1: "var(--dji-space-1)",
  2: "var(--dji-space-2)",
  3: "var(--dji-space-3)",
  4: "var(--dji-space-4)",
  5: "var(--dji-space-5)",
  6: "var(--dji-space-6)",
  8: "var(--dji-space-8)",
  10: "var(--dji-space-10)",
  12: "var(--dji-space-12)",
  16: "var(--dji-space-16)",
  20: "var(--dji-space-20)",
  24: "var(--dji-space-24)",
  32: "var(--dji-space-32)",
}

const radii = {
  none: "0px",
  xs: "var(--dji-radius-xs)",
  sm: "var(--dji-radius-sm)",
  base: "var(--dji-radius-base)",
  DEFAULT: "var(--dji-radius-base)",
  md: "var(--dji-radius-md)",
  lg: "var(--dji-radius-lg)",
  xl: "var(--dji-radius-xl)",
  pill: "var(--dji-radius-pill)",
  "pill-md": "var(--dji-radius-pill-md)",
  "pill-lg": "var(--dji-radius-pill-lg)",
  "pill-xl": "var(--dji-radius-pill-xl)",
  "pill-xxl": "var(--dji-radius-pill-xxl)",
  full: "var(--dji-radius-full)",
}

const shadows = {
  xs: "var(--dji-shadow-xs)",
  sm: "var(--dji-shadow-sm)",
  md: "var(--dji-shadow-md)",
  lg: "var(--dji-shadow-lg)",
  xl: "var(--dji-shadow-xl)",
  directional: "var(--dji-shadow-directional)",
  elevated: "var(--dji-shadow-elevated)",
}

module.exports = {
  withOpacityValue,
  colors,
  fontFamily,
  fontSize,
  spacing,
  radii,
  shadows,
}
