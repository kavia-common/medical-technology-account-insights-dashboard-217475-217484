import React, { useEffect, useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * AccountForm - Reusable, accessible form to create/edit an Account.
 *
 * Fields:
 * - name (required)
 * - region (required)
 * - segment (required)
 * - deviceCategory (maps to specialties; required)
 * - revenue (maps to last12moRevenue; number >= 0; required)
 * - healthScore (maps to growthPct as fraction; -100..100; required)
 * - status (free text or enum; optional)
 *
 * Props:
 * - initial: optional initial values
 * - options: { regions: string[], segments: string[], deviceCategories: string[] }
 * - onSubmit: (payload) => void|Promise - payload shape aligns with data/mockData accounts
 * - onCancel: () => void
 * - submitLabel: string button text
 * - busy: boolean loading state
 * - error: string inline error to show at top
 * - success: string inline success to show at top
 */
export default function AccountForm({
  initial = {},
  options = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  busy = false,
  error = "",
  success = ""
}) {
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState(() => ({
    name: "",
    region: "",
    segment: "",
    deviceCategory: "",
    revenue: "",
    healthScore: "",
    status: "",
    ...initial
  }));

  useEffect(() => {
    setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  const { regions = [], segments = [], deviceCategories = [] } = options;

  const errors = useMemo(() => {
    const e = {};
    if (!String(form.name || "").trim()) e.name = "Name is required.";
    if (!String(form.region || "").trim()) e.region = "Region is required.";
    if (!String(form.segment || "").trim()) e.segment = "Segment is required.";
    if (!String(form.deviceCategory || "").trim()) e.deviceCategory = "Device category is required.";
    if (form.revenue === "" || isNaN(Number(form.revenue)) || Number(form.revenue) < 0) {
      e.revenue = "Revenue must be a non-negative number.";
    }
    if (form.healthScore === "" || isNaN(Number(form.healthScore)) || Number(form.healthScore) < -100 || Number(form.healthScore) > 100) {
      e.healthScore = "Health score must be between -100 and 100.";
    }
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, region: true, segment: true, deviceCategory: true, revenue: true, healthScore: true });
    if (!isValid) return;
    // transform to account shape used in AccountTable and mockData
    const payload = {
      name: String(form.name).trim(),
      region: form.region,
      segment: form.segment,
      last12moRevenue: Number(form.revenue),
      // healthScore provided as percent -> convert to fraction
      growthPct: Number(form.healthScore) / 100,
      owner: "Unassigned",
      specialties: [form.deviceCategory],
      bedCount: 0,
      city: "",
      state: "",
      status: form.status || "Active",
      // optional fields that some consumers might use
      spendYTD: 0
    };
    await onSubmit?.(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Account form"
      className="card"
      style={{ display: "grid", gap: 12 }}
    >
      {(error || success) && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: error ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
            color: error ? "var(--color-error)" : "var(--color-success)"
          }}
        >
          {error || success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(200px, 1fr))", gap: 12 }}>
        <div>
          <label htmlFor="af-name" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Name
          </label>
          <input
            id="af-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={Boolean(touched.name && errors.name)}
            aria-describedby={touched.name && errors.name ? "af-name-err" : undefined}
          />
          {touched.name && errors.name && (
            <div id="af-name-err" role="alert" style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>
              {errors.name}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="af-region" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Region
          </label>
          <select
            id="af-region"
            required
            value={form.region}
            onChange={(e) => setField("region", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, region: true }))}
            aria-invalid={Boolean(touched.region && errors.region)}
            aria-describedby={touched.region && errors.region ? "af-region-err" : undefined}
          >
            <option value="">Select region</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {touched.region && errors.region && (
            <div id="af-region-err" role="alert" style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>
              {errors.region}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="af-segment" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Segment
          </label>
          <select
            id="af-segment"
            required
            value={form.segment}
            onChange={(e) => setField("segment", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, segment: true }))}
            aria-invalid={Boolean(touched.segment && errors.segment)}
            aria-describedby={touched.segment && errors.segment ? "af-segment-err" : undefined}
          >
            <option value="">Select segment</option>
            {segments.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {touched.segment && errors.segment && (
            <div id="af-segment-err" role="alert" style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>
              {errors.segment}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="af-device" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Device Category
          </label>
          <select
            id="af-device"
            required
            value={form.deviceCategory}
            onChange={(e) => setField("deviceCategory", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, deviceCategory: true }))}
            aria-invalid={Boolean(touched.deviceCategory && errors.deviceCategory)}
            aria-describedby={touched.deviceCategory && errors.deviceCategory ? "af-device-err" : undefined}
          >
            <option value="">Select category</option>
            {deviceCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {touched.deviceCategory && errors.deviceCategory && (
            <div id="af-device-err" role="alert" style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>
              {errors.deviceCategory}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="af-revenue" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Revenue (Last 12 mo)
          </label>
          <input
            id="af-revenue"
            type="number"
            inputMode="numeric"
            min="0"
            required
            value={form.revenue}
            onChange={(e) => setField("revenue", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, revenue: true }))}
            aria-invalid={Boolean(touched.revenue && errors.revenue)}
            aria-describedby={touched.revenue && errors.revenue ? "af-revenue-err" : undefined}
          />
          {touched.revenue && errors.revenue && (
            <div id="af-revenue-err" role="alert" style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>
              {errors.revenue}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="af-health" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Health Score (Growth %)
          </label>
          <input
            id="af-health"
            type="number"
            step="1"
            min="-100"
            max="100"
            required
            value={form.healthScore}
            onChange={(e) => setField("healthScore", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, healthScore: true }))}
            aria-invalid={Boolean(touched.healthScore && errors.healthScore)}
            aria-describedby={touched.healthScore && errors.healthScore ? "af-health-err" : undefined}
          />
          {touched.healthScore && errors.healthScore && (
            <div id="af-health-err" role="alert" style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>
              {errors.healthScore}
            </div>
          )}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="af-status" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Status
          </label>
          <input
            id="af-status"
            type="text"
            placeholder="e.g., Active, Prospect, On Hold"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button type="button" onClick={onCancel} aria-label="Cancel account form">
          Cancel
        </button>
        <button className="btn-primary" type="submit" disabled={busy || !isValid} aria-label={submitLabel}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
