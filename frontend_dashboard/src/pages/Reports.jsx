import React, { useEffect, useMemo, useRef, useState } from "react";
import { exportCsv } from "../utils/csv";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { getAccounts, getTrends, getOpportunities } from "../data/mockData";

/**
 * PUBLIC_INTERFACE
 * Reports - Simple report builder with date range, metric selections, preview, CSV export, and print.
 *
 * Features:
 * - Date range selection (from/to)
 * - Metric selection: Revenue, Win Rate, Upsell Rate, Pipeline
 * - Data preview table aggregated from mock sources
 * - Export CSV using utils/csv.js
 * - Print with print-friendly layout
 * - Loading and empty states, accessible labels, client-side validation
 *
 * Notes:
 * - Uses mock data from src/data/mockData to simulate aggregates
 * - Formatters from utils/formatters are reused to match the Ocean Professional theme
 */
export default function Reports() {
  // Filters and controls
  const [from, setFrom] = useState(getDefaultFrom());
  const [to, setTo] = useState(getDefaultTo());
  const [metrics, setMetrics] = useState({
    revenue: true,
    winRate: true,
    upsellRate: false,
    pipeline: true
  });

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  // Load mock data and compute report rows on demand
  async function buildReport() {
    setError("");
    const validation = validate({ from, to, metrics });
    if (!validation.valid) {
      setError(validation.message);
      setRows([]);
      return;
    }

    setLoading(true);
    try {
      // Pull required datasets; these are async Promise-based
      const [accounts, trends, opps] = await Promise.all([
        getAccounts(),
        getTrends(),
        getOpportunities()
      ]);

      // Aggregate per month in range
      const months = enumerateMonths(from, to);
      const byMonth = months.map((m) => {
        const revenueVal = sumMonth(trends?.revenue, m); // number
        const pipelineVal = sumByMonthFromOpps(opps, m); // number
        const winRateVal = estimateWinRate(trends, m); // fraction 0..1
        const upsellRateVal = estimateUpsellRate(accounts, m); // fraction 0..1 (mock heuristic)

        return {
          month: m,
          revenue: revenueVal,
          pipeline: pipelineVal,
          winRate: winRateVal,
          upsellRate: upsellRateVal
        };
      });

      setRows(byMonth);
    } catch (e) {
      setError("Failed to build report. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Build initial report for default range
    buildReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedColumns = useMemo(() => {
    const cols = [{ key: "month", label: "Month" }];
    if (metrics.revenue) cols.push({ key: "revenue", label: "Revenue (USD)" });
    if (metrics.winRate) cols.push({ key: "winRate", label: "Win Rate" });
    if (metrics.upsellRate) cols.push({ key: "upsellRate", label: "Upsell Rate" });
    if (metrics.pipeline) cols.push({ key: "pipeline", label: "Pipeline (USD)" });
    return cols;
  }, [metrics]);

  const hasSelection = metrics.revenue || metrics.winRate || metrics.upsellRate || metrics.pipeline;

  const handleExport = () => {
    if (!rows.length) return;
    const headers = selectedColumns.map((c) => c.key);
    const csvRows = rows.map((r) => {
      const out = {};
      headers.forEach((h) => {
        if (h === "winRate" || h === "upsellRate") {
          // Export percentages as 0..100 with % sign
          out[h] = formatPercent(Number(r[h]) * 100, { inputIsFraction: false, minimumFractionDigits: 1, maximumFractionDigits: 1 });
        } else if (h === "revenue" || h === "pipeline") {
          out[h] = formatCurrency(r[h], { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        } else {
          out[h] = r[h];
        }
      });
      return out;
    });
    exportCsv(csvRows, {
      headers,
      filename: `report_${from}_to_${to}.csv`
    });
  };

  const handlePrint = () => {
    // For print-friendly view, we trigger native print; CSS will handle background
    window.print();
  };

  const empty = !loading && rows.length === 0;

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Reports</h1>
        <span className="text-muted">Build and export performance reports</span>
      </header>

      {/* Controls */}
      <section
        className="card"
        aria-label="Report controls"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 12
        }}
      >
        <div style={{ gridColumn: "span 3" }}>
          <label htmlFor="from-date" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            From
          </label>
          <input
            id="from-date"
            type="month"
            aria-label="Start month"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <label htmlFor="to-date" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            To
          </label>
          <input
            id="to-date"
            type="month"
            aria-label="End month"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <fieldset
          style={{
            gridColumn: "span 6",
            margin: 0,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px"
          }}
          aria-label="Metric selection"
        >
          <legend className="text-muted" style={{ fontSize: 12, padding: "0 6px" }}>Metrics</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 8 }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={metrics.revenue}
                onChange={(e) => setMetrics((m) => ({ ...m, revenue: e.target.checked }))}
                aria-label="Include Revenue"
              />
              Revenue
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={metrics.winRate}
                onChange={(e) => setMetrics((m) => ({ ...m, winRate: e.target.checked }))}
                aria-label="Include Win Rate"
              />
              Win Rate
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={metrics.upsellRate}
                onChange={(e) => setMetrics((m) => ({ ...m, upsellRate: e.target.checked }))}
                aria-label="Include Upsell Rate"
              />
              Upsell Rate
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={metrics.pipeline}
                onChange={(e) => setMetrics((m) => ({ ...m, pipeline: e.target.checked }))}
                aria-label="Include Pipeline"
              />
              Pipeline
            </label>
          </div>
        </fieldset>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={buildReport} className="btn-primary" aria-label="Build report">
            Build Report
          </button>
          <button onClick={handleExport} disabled={!hasSelection || rows.length === 0} aria-label="Export CSV">
            Export CSV
          </button>
          <button onClick={handlePrint} disabled={!hasSelection || rows.length === 0} aria-label="Print report">
            Print
          </button>
        </div>

        {/* Validation and status */}
        {error && (
          <div className="text-muted" role="alert" style={{ gridColumn: "1 / -1", color: "var(--color-error)" }}>
            {error}
          </div>
        )}
        {loading && (
          <div className="text-muted" aria-live="polite" style={{ gridColumn: "1 / -1" }}>
            Building report…
          </div>
        )}
      </section>

      {/* Preview Table */}
      <section className="card" aria-label="Report preview" ref={printRef} style={{ overflowX: "auto" }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <h3 style={{ margin: 0 }}>Preview</h3>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Range: {from} to {to}
            </div>
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </div>
        </header>

        <table role="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {selectedColumns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    position: "sticky",
                    top: 0,
                    background: "var(--color-surface)",
                    borderBottom: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                    fontWeight: 600
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month} style={{ borderBottom: "1px solid var(--color-border)" }}>
                {selectedColumns.map((c) => (
                  <td key={`${r.month}-${c.key}`} style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    {renderCell(c.key, r)}
                  </td>
                ))}
              </tr>
            ))}
            {empty && (
              <tr>
                <td colSpan={selectedColumns.length} className="text-muted" style={{ padding: 16 }}>
                  No data for the selected period and metrics.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Print styles: scoped minimal override */}
      <style>
        {`@media print {
          .sidebar, .topnav, button { display: none !important; }
          .app-shell { grid-template-columns: 0 1fr !important; }
          .card { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }`}
      </style>
    </div>
  );

  function renderCell(key, row) {
    if (key === "revenue" || key === "pipeline") {
      return formatCurrency(row[key], { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    if (key === "winRate" || key === "upsellRate") {
      return formatPercent(row[key], { inputIsFraction: true, minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return row[key] ?? "—";
  }
}

/**
 * Client-side validation for report inputs.
 */
function validate({ from, to, metrics }) {
  if (!from || !to) {
    return { valid: false, message: "Please select both From and To months." };
  }
  if (from > to) {
    return { valid: false, message: "The From month must be before or equal to the To month." };
  }
  const anyMetric = metrics?.revenue || metrics?.winRate || metrics?.upsellRate || metrics?.pipeline;
  if (!anyMetric) {
    return { valid: false, message: "Please select at least one metric." };
  }
  const span = enumerateMonths(from, to);
  if (span.length > 36) {
    return { valid: false, message: "Please limit the range to 36 months or fewer." };
  }
  return { valid: true };
}

/**
 * Enumerate months between yyyy-mm strings inclusive.
 */
function enumerateMonths(from, to) {
  const [fy, fm] = from.split("-").map((s) => Number(s));
  const [ty, tm] = to.split("-").map((s) => Number(s));
  const res = [];
  let y = fy;
  let m = fm;
  // basic guard
  for (let i = 0; i < 120; i++) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    res.push(key);
    if (y === ty && m === tm) break;
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return res;
}

/**
 * Sum trend revenue series for a given month key ("YYYY-MM").
 */
function sumMonth(series, month) {
  if (!Array.isArray(series)) return 0;
  const item = series.find((d) => d.month === month);
  return Number(item?.value || 0);
}

/**
 * Sum opportunities considered "in month" by expectedClose within that month,
 * as a proxy for pipeline for the month (mock heuristic).
 */
function sumByMonthFromOpps(opps, month) {
  if (!Array.isArray(opps)) return 0;
  return opps
    .filter((o) => {
      if (!o?.expectedClose) return false;
      const [y, m] = String(o.expectedClose).split("-"); // "YYYY-MM-DD"
      const key = `${y}-${m}`;
      return key === month;
    })
    .reduce((acc, o) => acc + Number(o.amount || 0), 0);
}

/**
 * Estimate win rate as a function of deals trend variance (mock).
 * If deals increased vs previous month, win rate slightly higher.
 */
function estimateWinRate(trends, month) {
  const deals = Array.isArray(trends?.deals) ? trends.deals : [];
  const idx = deals.findIndex((d) => d.month === month);
  if (idx < 0) return 0.3; // default 30%
  const prev = idx > 0 ? deals[idx - 1].value : deals[idx].value;
  const curr = deals[idx].value;
  const delta = curr - prev;
  const base = 0.28;
  const adj = Math.max(-0.05, Math.min(0.05, delta / 500)); // clamp adjustment
  return clamp01(base + adj);
}

/**
 * Estimate upsell rate using accounts' growth distribution (mock).
 */
function estimateUpsellRate(accounts, month) {
  // Simple month-based variation to avoid unused variable warning for 'month'
  const monthIdx = Number(month.split("-")[1] || 1);
  const factor = (monthIdx % 6) / 100; // up to 5% swing
  const base = 0.12; // 12%
  const growthAvg =
    (Array.isArray(accounts) ? accounts.reduce((acc, a) => acc + Number(a.growthPct || 0), 0) / Math.max(accounts.length || 1, 1) : 0);
  return clamp01(base + factor + growthAvg / 10);
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number(n) || 0));
}

function getDefaultTo() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function getDefaultFrom() {
  const d = new Date();
  d.setMonth(d.getMonth() - 5); // last 6 months default
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
