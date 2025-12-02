import React from "react";
import { formatCurrency, formatPercent, formatTrend, formatCompactNumber } from "../utils/formatters";
import { theme as ThemeTokens } from "../theme";

/**
 * PUBLIC_INTERFACE
 * KPICard - A compact card for displaying a KPI metric with label and optional delta/trend.
 *
 * Props:
 * - title: string - KPI label
 * - value: number|string - Primary metric value
 * - valueType: "currency" | "number" | "percent" | "compact" | "raw" (default: "number")
 * - currency: string - currency code if valueType is "currency" (default "USD")
 * - delta: number - change value (typically percentage change, e.g., 0.072 for 7.2%)
 * - deltaType: "percent" | "number" | "raw" (default "percent")
 * - icon: ReactNode - optional leading icon
 * - footer: ReactNode - optional footer content
 * - emphasis: "primary" | "neutral" (affects accenting)
 */
export default function KPICard({
  title,
  value,
  valueType = "number",
  currency = "USD",
  delta = null,
  deltaType = "percent",
  icon = null,
  footer = null,
  emphasis = "neutral"
}) {
  const formattedValue = (() => {
    if (valueType === "currency") return formatCurrency(value, { currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (valueType === "percent") return formatPercent(value, { inputIsFraction: true, minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (valueType === "compact") return formatCompactNumber(value, { maximumFractionDigits: 1 });
    if (valueType === "raw") return String(value ?? "—");
    // default number with compact display for large numbers
    const num = Number(value);
    if (!isNaN(num) && Math.abs(num) >= 10000) return formatCompactNumber(num);
    if (!isNaN(num)) return num.toLocaleString();
    return "—";
  })();

  const deltaLabel = (() => {
    if (delta === null || delta === undefined) return null;
    if (deltaType === "percent") {
      const t = formatTrend(delta * 100, { decimals: 1, showSign: true, suffix: "%" });
      return t;
    }
    if (deltaType === "number") {
      const t = formatTrend(delta, { decimals: 1, showSign: true, suffix: "" });
      return t;
    }
    return { direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat", icon: delta > 0 ? "▲" : delta < 0 ? "▼" : "•", value: String(delta), label: `${delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} ${delta}` };
  })();

  const accentStyle = emphasis === "primary" ? { borderColor: "var(--color-primary)", boxShadow: "0 0 0 2px rgba(37,99,235,0.10)" } : {};

  return (
    <section
      className="card"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gridTemplateRows: "auto auto auto",
        gap: "8px 12px",
        alignItems: "center",
        ...accentStyle
      }}
      aria-label={`${title} metric`}
    >
      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "var(--color-muted)",
          color: "var(--color-primary)",
          boxShadow: ThemeTokens.shadows.xs
        }}
      >
        {icon || "📈"}
      </div>
      <div>
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{formattedValue}</div>
      </div>

      <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        {deltaLabel && (
          <span
            aria-label={`Change ${deltaLabel.label}`}
            title={`Change ${deltaLabel.label}`}
            style={{
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 999,
              background:
                deltaLabel.direction === "up"
                  ? "rgba(16,185,129,0.12)"
                  : deltaLabel.direction === "down"
                  ? "rgba(239,68,68,0.12)"
                  : "var(--color-muted)",
              color:
                deltaLabel.direction === "up"
                  ? "var(--color-success)"
                  : deltaLabel.direction === "down"
                  ? "var(--color-error)"
                  : "var(--color-text-muted)",
              border: "1px solid var(--color-border)"
            }}
          >
            {deltaLabel.label}
          </span>
        )}
        {footer && <span className="text-muted" style={{ fontSize: 12 }}>{footer}</span>}
      </div>
    </section>
  );
}
