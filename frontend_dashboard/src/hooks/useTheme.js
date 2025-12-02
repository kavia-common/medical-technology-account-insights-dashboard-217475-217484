//
// React hook to manage theme (light/dark) using CSS variables and localStorage.
// Integrates with CSS in src/index.css which listens to [data-theme="dark"].
//

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "mtai.theme";

/**
 * PUBLIC_INTERFACE
 * useTheme hook
 * - Returns current theme ("light" | "dark"), setter, and toggler.
 * - Persists preference in localStorage under STORAGE_KEY.
 * - Applies attribute on <html> as data-theme="light|dark" for CSS variables.
 * - Respects system preference on first load if no stored preference.
 */
export function useTheme() {
  const getInitial = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  }, []);

  const [theme, setTheme] = useState(getInitial);

  // Apply to DOM and persist
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // no-op if storage restricted
    }
  }, [theme]);

  // Toggle function
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }, []);

  // Helper flags for convenience in components
  const isDark = theme === "dark";
  const isLight = theme === "light";

  return useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark, isLight }),
    [theme, toggleTheme, isDark, isLight]
  );
}

export default useTheme;
