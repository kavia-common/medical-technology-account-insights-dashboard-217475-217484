import React, { useEffect, useMemo, useState } from "react";
import { KPICard, TrendChart } from "../components";
import { formatCurrency, formatPercent, formatCompactNumber } from "../utils/formatters";
import { getKpis as getKpisMock, getTrends, getOpportunities, getInsights } from "../data/mockData";

/**
 * PUBLIC_INTERFACE
 * Dashboard page - Ocean Professional
 * Displays:
 * - KPI cards (revenue, growth, active accounts, churn, pipeline, win rate)
 * - Trend charts (Revenue trend, Opportunities trend)
 * - Top Upsell Opportunities and Risks lists
 *
 * Uses mock async data from src/data/mockData.
 */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState({ revenue: [], deals: [] });
  const [opps, setOpps] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [k, t, o, i] = await Promise.all([
          getKpisMock(),
          getTrends(),
          getOpportunities(),
          getInsights()
        ]);
        if (!isMounted) return;
        setKpis(k);
        setTrends(t);
        setOpps(o);
        setInsights(i);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Transform trends for charts
  const revenueSeries = useMemo(() => {
    const arr = Array.isArray(trends?.revenue) ? trends.revenue : [];
    return arr.map((d) => ({ x: d.month, y: d.value }));
  }, [trends]);

  const dealsSeries = useMemo(() => {
    const arr = Array.isArray(trends?.deals) ? trends.deals : [];
    return arr.map((d) => ({ x: d.month, y: d.value }));
  }, [trends]);

  // Top lists: opportunities by amount desc; risks from insights with severity high/medium
  const topOpportunities = useMemo(() => {
    const arr = Array.isArray(opps) ? opps : [];
    return [...arr].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5);
  }, [opps]);

  const topRisks = useMemo(() => {
    const list = Array.isArray(insights) ? insights : [];
    const riskLike = list.filter((i) =>
      String(i?.type || "").toLowerCase().includes("risk") ||
      String(i?.type || "").toLowerCase().includes("retention") ||
      String(i?.severity || "").toLowerCase() === "high"
    );
    return riskLike.slice(0, 5);
  }, [insights]);

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <span className="text-muted">Overview KPIs and quick insights</span>
      </div>

      {/* KPI Grid */}
      <section
        aria-label="Key Performance Indicators"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 16
        }}
      >
        <div style={{ gridColumn: "span 3" }}>
          <KPICard
            title="Total Revenue"
            value={kpis?.totalRevenue}
            valueType="currency"
            delta={kpis?.revenueGrowthPct ?? 0}
            deltaType="percent"
            emphasis="primary"
            footer="Last 12 months"
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KPICard
            title="Active Accounts"
            value={kpis?.activeAccounts}
            valueType="number"
            footer="Currently engaged"
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KPICard
            title="Avg Deal Size"
            value={kpis?.avgDealSize}
            valueType="currency"
            footer="Rolling 12 mo avg"
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KPICard
            title="Churn Rate"
            value={kpis?.churnPct}
            valueType="percent"
            footer="Year to date"
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KPICard
            title="Pipeline Value"
            value={kpis?.pipelineValue}
            valueType="currency"
            footer="Open opportunities"
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <KPICard
            title="Win Rate"
            value={kpis?.winRatePct}
            valueType="percent"
            footer="Trailing 12 mo"
          />
        </div>
      </section>

      {/* Charts */}
      <section
        aria-label="Trends"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginBottom: 16
        }}
      >
        <div className="card" aria-label="Revenue trend">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Revenue Trend</h3>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {revenueSeries.length
                ? `${formatCurrency(revenueSeries[0].y, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} → ${formatCurrency(revenueSeries[revenueSeries.length - 1].y, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                : "—"}
            </span>
          </header>
          <TrendChart
            data={revenueSeries}
            width={780}
            height={220}
            showAxis
            accessibleLabel="Revenue over time"
          />
        </div>

        <div className="card" aria-label="Opportunities trend">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Opportunities Trend</h3>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {dealsSeries.length
                ? `${dealsSeries[0].y} → ${dealsSeries[dealsSeries.length - 1].y}`
                : "—"}
            </span>
          </header>
          <TrendChart
            data={dealsSeries}
            width={380}
            height={220}
            stroke="var(--color-secondary)"
            fill="rgba(245,158,11,0.15)"
            showAxis
            accessibleLabel="Opportunities over time"
          />
        </div>
      </section>

      {/* Two-column: Top Opportunities and Risks */}
      <section
        aria-label="Highlights"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12
        }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Top Upsell Opportunities</h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {topOpportunities.map((o) => (
              <li
                key={o.id}
                className="rounded border"
                style={{
                  padding: "12px 12px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                  background: "var(--color-surface)"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{o.title}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {o.accountName} • Stage: {o.stage} • Prob: {formatPercent(o.probability, { inputIsFraction: true, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontWeight: 700 }}>
                  {formatCurrency(o.amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </li>
            ))}
            {topOpportunities.length === 0 && (
              <li className="text-muted">No opportunities available.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Top Risks</h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {topRisks.map((r) => (
              <li
                key={r.id}
                className="rounded border"
                style={{
                  padding: "12px 12px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 10,
                  alignItems: "start",
                  background: "var(--color-surface)"
                }}
              >
                <span
                  aria-hidden="true"
                  title={`Severity: ${r.severity || "n/a"}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    marginTop: 6,
                    background:
                      String(r.severity).toLowerCase() === "high"
                        ? "var(--color-error)"
                        : String(r.severity).toLowerCase() === "medium"
                        ? "var(--color-secondary)"
                        : "var(--color-muted)"
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Impact: {formatCurrency(r.potentialImpactUSD, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} • Type: {r.type}
                  </div>
                </div>
              </li>
            ))}
            {topRisks.length === 0 && (
              <li className="text-muted">No risks detected.</li>
            )}
          </ul>
        </div>
      </section>

      {loading && (
        <div className="text-muted" style={{ marginTop: 12, fontSize: 12 }}>
          Loading data…
        </div>
      )}
    </div>
  );
}
