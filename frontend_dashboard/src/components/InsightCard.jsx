import React from "react";
import { formatCurrency } from "../utils/formatters";

/**
 * PUBLIC_INTERFACE
 * InsightCard - Displays a single insight with severity, title, description, impacted accounts, and actions.
 *
 * Props:
 * - insight: {
 *     id, type, severity: "low"|"medium"|"high",
 *     title, description, impactedAccounts: Array<string>, potentialImpactUSD: number,
 *     recommendedActions: Array<string>
 *   }
 * - onApply: (insight) => void
 * - onDismiss: (insight) => void
 */
export default function InsightCard({ insight, onApply, onDismiss }) {
  if (!insight) return null;
  const { severity = "low" } = insight;

  const severityStyles = {
    low: { bg: "rgba(37,99,235,0.08)", color: "var(--color-primary)", label: "Low" },
    medium: { bg: "rgba(245,158,11,0.18)", color: "var(--color-secondary)", label: "Medium" },
    high: { bg: "rgba(239,68,68,0.18)", color: "var(--color-error)", label: "High" }
  };
  const sev = severityStyles[severity] || severityStyles.low;

  return (
    <article className="card" aria-labelledby={`insight-${insight.id}-title`} style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          aria-label={`Severity ${sev.label}`}
          title={`Severity ${sev.label}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 8,
            background: sev.bg,
            color: sev.color,
            fontWeight: 700
          }}
        >
          {severity === "high" ? "!" : severity === "medium" ? "△" : "•"}
        </span>
        <div>
          <h3 id={`insight-${insight.id}-title`} style={{ margin: 0 }}>{insight.title}</h3>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
            Type: {insight.type} • Potential impact: {formatCurrency(insight.potentialImpactUSD, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
      </header>

      <p style={{ margin: 0 }}>{insight.description}</p>

      {Array.isArray(insight.impactedAccounts) && insight.impactedAccounts.length > 0 && (
        <div className="text-muted" style={{ fontSize: 12 }}>
          Impacted Accounts: {insight.impactedAccounts.join(", ")}
        </div>
      )}

      {Array.isArray(insight.recommendedActions) && insight.recommendedActions.length > 0 && (
        <div>
          <div className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>Recommended actions:</div>
          <ul style={{ marginTop: 0, marginBottom: 0 }}>
            {insight.recommendedActions.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          className="btn-primary"
          onClick={() => onApply && onApply(insight)}
          aria-label="Apply recommendation"
          title="Apply recommendation"
        >
          Apply
        </button>
        <button
          onClick={() => onDismiss && onDismiss(insight)}
          aria-label="Dismiss insight"
          title="Dismiss insight"
        >
          Dismiss
        </button>
      </div>
    </article>
  );
}
