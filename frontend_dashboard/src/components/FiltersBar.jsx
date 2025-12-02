import React from "react";

/**
 * PUBLIC_INTERFACE
 * FiltersBar - Compact set of accessible filters with semantic form controls.
 *
 * Props:
 * - filters: {
 *     search: string,
 *     region: string,
 *     segment: string,
 *     owner: string
 *   }
 * - options: {
 *     regions: string[],
 *     segments: string[],
 *     owners: string[]
 *   }
 * - onChange: (nextFilters) => void
 * - onReset: () => void
 */
export default function FiltersBar({ filters = {}, options = {}, onChange, onReset }) {
  const { search = "", region = "", segment = "", owner = "" } = filters;
  const { regions = [], segments = [], owners = [] } = options;

  const update = (key, value) => {
    onChange && onChange({ ...filters, [key]: value });
  };

  return (
    <form
      role="search"
      aria-label="Filter accounts"
      className="card"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr repeat(3, minmax(160px, 220px)) auto",
        gap: 12,
        alignItems: "end"
      }}
      onSubmit={(e) => e.preventDefault()}
    >
      <div>
        <label htmlFor="filter-search" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Search
        </label>
        <input
          id="filter-search"
          type="search"
          placeholder="Search accounts, owners…"
          value={search}
          onChange={(e) => update("search", e.target.value)}
          aria-label="Search text"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="filter-region" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Region
        </label>
        <select
          id="filter-region"
          value={region}
          onChange={(e) => update("region", e.target.value)}
          aria-label="Region"
        >
          <option value="">All</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-segment" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Segment
        </label>
        <select
          id="filter-segment"
          value={segment}
          onChange={(e) => update("segment", e.target.value)}
          aria-label="Segment"
        >
          <option value="">All</option>
          {segments.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-owner" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
          Owner
        </label>
        <select
          id="filter-owner"
          value={owner}
          onChange={(e) => update("owner", e.target.value)}
          aria-label="Owner"
        >
          <option value="">All</option>
          {owners.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn-primary" aria-label="Apply filters">Apply</button>
        <button type="button" onClick={() => onReset && onReset()} aria-label="Reset filters">Reset</button>
      </div>
    </form>
  );
}
