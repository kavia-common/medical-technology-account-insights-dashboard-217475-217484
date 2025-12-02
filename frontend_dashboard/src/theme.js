//
// Theme tokens for Ocean Professional
// Mirrors CSS variables in index.css to enable JS-driven styling and component theming.
//

// PUBLIC_INTERFACE
export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB",
    secondary: "#F59E0B",
    success: "#10B981",
    error: "#EF4444",
    background: "#f9fafb",
    surface: "#ffffff",
    muted: "#f3f4f6",
    border: "#e5e7eb",
    text: "#111827",
    textMuted: "#4b5563",
    link: "#2563EB"
  },
  darkMode: {
    primary: "#3B82F6",
    secondary: "#F59E0B",
    success: "#34D399",
    error: "#F87171",
    background: "#0b1220",
    surface: "#111826",
    muted: "#0f172a",
    border: "#1f2937",
    text: "#e5e7eb",
    textMuted: "#94a3b8",
    link: "#93c5fd"
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96
  },
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18
  },
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    md: "0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
    lg: "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05)"
  },
  transitions: {
    fast: "150ms ease",
    normal: "250ms ease",
    slow: "400ms ease"
  },
  gradients: {
    soft: "linear-gradient(180deg, rgba(59,130,246,0.10), #F9FAFB)",
    accent: "radial-gradient(1200px 600px at 10% -10%, rgba(37,99,235,0.10), transparent 60%)"
  },
  // PUBLIC_INTERFACE
  toCSSVariables: (mode = "light") => {
    /**
     * Convert theme tokens to a style object with CSS variables for inline usage.
     * mode: "light" | "dark"
     */
    const palette = mode === "dark" ? theme.darkMode : theme.colors;
    return {
      "--color-primary": palette.primary,
      "--color-secondary": palette.secondary,
      "--color-success": palette.success,
      "--color-error": palette.error,
      "--color-background": palette.background,
      "--color-surface": palette.surface,
      "--color-muted": palette.muted,
      "--color-border": palette.border,
      "--color-text": palette.text,
      "--color-text-muted": palette.textMuted,
      "--color-link": palette.link,
      "--radius-sm": `${theme.radii.sm}px`,
      "--radius-md": `${theme.radii.md}px`,
      "--radius-lg": `${theme.radii.lg}px`,
      "--radius-xl": `${theme.radii.xl}px`
    };
  }
};

export default theme;
