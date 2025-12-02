//
// Formatting utilities for currency, percent, and trend indicators
// Designed for consistent, locale-aware presentation across the app.
//

/**
 * Format a number as currency using Intl.NumberFormat.
 * Options allow customizing currency code and precision.
 *
 * Examples:
 *  formatCurrency(1234.5) -> "$1,234.50"
 *  formatCurrency(1234.5, { currency: "EUR", minimumFractionDigits: 0 }) -> "€1,235"
 */
// PUBLIC_INTERFACE
export function formatCurrency(
  value,
  {
    currency = "USD",
    locale = undefined, // defaults to user's locale
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = {}
) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(Number(value));
  } catch {
    // Fallback if Intl or currency code not supported
    const num = Number(value).toFixed(Math.max(minimumFractionDigits, 0));
    const symbol = currency === "USD" ? "$" : `${currency} `;
    return `${symbol}${num}`;
  }
}

/**
 * Format a value as percent using Intl.NumberFormat.
 *
 * Examples:
 *  formatPercent(0.1234) -> "12.34%"
 *  formatPercent(12.34, { inputIsFraction: false }) -> "12.34%"
 */
// PUBLIC_INTERFACE
export function formatPercent(
  value,
  {
    locale = undefined,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    inputIsFraction = true // if false, treat input as already in [0..100]
  } = {}
) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  const numeric = Number(value);
  const fraction = inputIsFraction ? numeric : numeric / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits,
      maximumFractionDigits
    }).format(fraction);
  } catch {
    const pct = (fraction * 100).toFixed(Math.max(minimumFractionDigits, 0));
    return `${pct}%`;
  }
}

/**
 * Format a trend with arrow indicator and optional sign.
 * Returns a small object for flexible UI usage and a prebuilt label.
 *
 * Examples:
 *  formatTrend(5.2) => { direction: "up", icon: "▲", value: "5.2%", label: "▲ 5.2%" }
 *  formatTrend(-1.1, { showSign: true }) => { direction: "down", icon: "▼", value: "-1.1%", label: "▼ -1.1%" }
 */
// PUBLIC_INTERFACE
export function formatTrend(
  value,
  {
    decimals = 1,
    showSign = false,
    suffix = "%"
  } = {}
) {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return { direction: "flat", icon: "•", value: "—", label: "• —" };
  }
  const n = Number(value);
  const direction = n > 0 ? "up" : n < 0 ? "down" : "flat";
  const icon = direction === "up" ? "▲" : direction === "down" ? "▼" : "•";
  const signed = showSign && n > 0 ? `+${n.toFixed(decimals)}` : n.toFixed(decimals);
  const valLabel = `${signed}${suffix ? suffix : ""}`;
  return {
    direction,
    icon,
    value: valLabel,
    label: `${icon} ${valLabel}`
  };
}

/**
 * Compact number formatting like 1.2K, 3.4M using Intl.NumberFormat.
 */
// PUBLIC_INTERFACE
export function formatCompactNumber(
  value,
  {
    locale = undefined,
    minimumFractionDigits = 0,
    maximumFractionDigits = 1
  } = {}
) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      minimumFractionDigits,
      maximumFractionDigits
    }).format(Number(value));
  } catch {
    // Simple fallback: no compact notation
    return String(Number(value).toFixed(Math.max(minimumFractionDigits, 0)));
  }
}

export default {
  formatCurrency,
  formatPercent,
  formatTrend,
  formatCompactNumber
};
