import React, { useEffect, useMemo, useRef, useState } from "react";
import { InsightCard } from "../components";
import { formatCurrency } from "../utils/formatters";
import { getInsights as getMockInsights } from "../data/mockData";

/**
 * PUBLIC_INTERFACE
 * Insights page - Ocean Professional
 * - Filterable feed of insights by type and severity
 * - Supports quick actions (mark as done/dismiss) with client-side state
 * - Accessible labels, keyboard focus management, and live regions for updates
 *
 * Data source: src/data/mockData.getInsights()
 */
export default function Insights() {
  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  // Client-side status for per-insight actions (done/dismissed)
  // Shape: { [insightId]: { done?: boolean, dismissed?: boolean } }
  const [status, setStatus] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    type: "", // upsell | churn risk | cross-sell | retention | efficiency ... (mock contains upsell/retention/efficiency)
    severity: "" // low | medium | high
  });

  // For accessible announcements
  const liveRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getMockInsights();
        if (!mounted) return;
        setInsights(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Map incoming types to normalized labels to cover synonyms requested
  // The request mentions: upsell, churn risk, cross-sell. Mock contains upsell, retention (risk-like), efficiency.
  function normalizeType(t) {
    const s = String(t || "").toLowerCase();
    if (s === "retention" || s.includes("risk") || s.includes("churn")) return "churn risk";
    if (s === "upsell" || s.includes("up-sell")) return "upsell";
    if (s.includes("cross-sell") || s === "crosssell" || s === "cross_sell") return "cross-sell";
    if (s === "efficiency") return "efficiency";
    return s || "other";
  }

  const availableTypes = useMemo(() => {
    const raw = Array.isArray(insights) ? insights : [];
    const set = new Set(raw.map((i) => normalizeType(i.type)).filter(Boolean));
    // Ensure the requested common types appear in the list even if not present, to guide the user:
    ["upsell", "churn risk", "cross-sell"].forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [insights]);

  const availableSeverities = ["low", "medium", "high"];

  // Apply filters and client-side status (omit dismissed)
  const filtered = useMemo(() => {
    const typeFilter = (filters.type || "").toLowerCase();
    const sevFilter = (filters.severity || "").toLowerCase();
    return (Array.isArray(insights) ? insights : []).filter((i) => {
      const st = status[i.id] || {};
      if (st.dismissed) return false; // dismissed items hidden
      const typeMatch =
        !typeFilter || normalizeType(i.type) === typeFilter;
      const sevMatch =
        !sevFilter || String(i.severity || "").toLowerCase() === sevFilter;
      return typeMatch && sevMatch;
    });
  }, [insights, status, filters.type, filters.severity]);

  // Handlers for quick actions
  const handleApply = (insight) => {
    // For this mock, mark as done and announce
    setStatus((prev) => ({ ...prev, [insight.id]: { ...prev[insight.id], done: true } }));
    announce(`Insight "${insight.title}" marked as done.`);
  };

  const handleDismiss = (insight) => {
    // Hide from list
    setStatus((prev) => ({ ...prev, [insight.id]: { ...prev[insight.id], dismissed: true } }));
    announce(`Insight "${insight.title}" dismissed.`);
  };

  function announce(message) {
    if (liveRef.current) {
      liveRef.current.textContent = message;
      // Clear after a moment to avoid verbose SR history
      setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = "";
      }, 1500);
    }
  }

  // Empty and loading states
  const isEmpty = !loading && filtered.length === 0;

  // Keyboard: allow quick action on selected card via Enter/Space when focused on card container
  const onCardKeyDown = (e, insight) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply(insight);
    } else if (e.key === " ") {
      e.preventDefault();
      handleDismiss(insight);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Insights</h1>
        <span className="text-muted">Filterable feed of opportunities and risks</span>
      </div>

      {/* Filter Bar */}
      <section
        className="card"
        aria-label="Filter insights"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(180px, 1fr)) auto",
          gap: 12,
          alignItems: "end",
          marginBottom: 12
        }}
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <div>
          <label htmlFor="insights-type" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Insight Type
          </label>
          <select
            id="insights-type"
            aria-label="Insight type"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">All</option>
            {availableTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="insights-severity" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Severity
          </label>
          <select
            id="insights-severity"
            aria-label="Severity"
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          >
            <option value="">All</option>
            {availableSeverities.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Summary
          </label>
          <div className="text-muted" aria-live="polite">
            Showing {filtered.length} of {Array.isArray(insights) ? insights.filter(i => !(status[i.id]?.dismissed)).length : 0}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            aria-label="Apply filters"
            onClick={() => null}
            title="Filters apply instantly"
          >
            Apply
          </button>
          <button
            type="button"
            aria-label="Reset filters"
            onClick={() => setFilters({ type: "", severity: "" })}
          >
            Reset
          </button>
        </div>
      </section>

      {/* List/Grid of Insight Cards */}
      <section
        aria-label="Insights list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: 12
        }}
      >
        {filtered.map((insight) => {
          const st = status[insight.id] || {};
          return (
            <div
              key={insight.id}
              style={{ gridColumn: "span 6" }}
              role="group"
              aria-label={`Insight ${insight.title}`}
              tabIndex={0}
              onKeyDown={(e) => onCardKeyDown(e, insight)}
            >
              <InsightCard
                insight={{
                  ...insight,
                  // Present normalized type in subtitle while preserving original fields
                  type: normalizeType(insight.type)
                }}
                onApply={handleApply}
                onDismiss={handleDismiss}
              />
              {/* Status footer for done marker */}
              {st.done && (
                <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                  Marked as done. Potential impact captured: {formatCurrency(insight.potentialImpactUSD, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Loading/Empty states */}
      {loading && (
        <div className="text-muted" style={{ marginTop: 12 }}>
          Loading insights…
        </div>
      )}
      {!loading && isEmpty && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>No insights match your filters.</div>
          <div className="text-muted" style={{ fontSize: 14 }}>
            Try adjusting type or severity. Recently dismissed items are hidden from the feed.
          </div>
        </div>
      )}

      {/* aria-live region for announcements */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}
      />
    </div>
  );
}
