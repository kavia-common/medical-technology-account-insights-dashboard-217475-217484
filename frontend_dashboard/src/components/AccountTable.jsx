import React, { useMemo, useState } from "react";
import { formatCurrency, formatPercent } from "../utils/formatters";

/**
 * PUBLIC_INTERFACE
 * AccountTable - Sortable, accessible table for accounts listing.
 *
 * Props:
 * - rows: Array<Account> where Account has keys: id, name, region, segment, spendYTD, last12moRevenue, growthPct, owner, city, state, bedCount
 * - onRowClick: (row) => void - optional click handler
 * - initialSort: { key: string, dir: "asc" | "desc" } - optional
 */
export default function AccountTable({ rows = [], onRowClick, initialSort = { key: "last12moRevenue", dir: "desc" } }) {
  const [sort, setSort] = useState(initialSort);

  const columns = useMemo(
    () => [
      { key: "name", label: "Account", sortable: true },
      { key: "region", label: "Region", sortable: true },
      { key: "segment", label: "Segment", sortable: true },
      { key: "last12moRevenue", label: "Revenue (12 mo)", sortable: true, format: (v) => formatCurrency(v, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) },
      { key: "growthPct", label: "Growth", sortable: true, format: (v) => formatPercent(v, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
      { key: "owner", label: "Owner", sortable: true },
      { key: "city", label: "City", sortable: true },
      { key: "state", label: "State", sortable: true }
    ],
    []
  );

  const sortedRows = useMemo(() => {
    const copy = Array.isArray(rows) ? [...rows] : [];
    const { key, dir } = sort || {};
    if (!key) return copy;
    copy.sort((a, b) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (av == null && bv == null) return 0;
      if (av == null) return dir === "asc" ? -1 : 1;
      if (bv == null) return dir === "asc" ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") return dir === "asc" ? av - bv : bv - av;
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return dir === "asc" ? -1 : 1;
      if (as > bs) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sort]);

  const handleSort = (key) => {
    setSort((prev) => {
      if (prev?.key === key) {
        const nextDir = prev.dir === "asc" ? "desc" : "asc";
        return { key, dir: nextDir };
      }
      return { key, dir: "asc" };
    });
  };

  const sortIcon = (key) => {
    if (sort?.key !== key) return "↕";
    return sort.dir === "asc" ? "▲" : "▼";
    };

  return (
    <div className="card" role="region" aria-label="Accounts table" style={{ overflowX: "auto" }}>
      <table role="table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map((c) => (
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
                {c.sortable ? (
                  <button
                    onClick={() => handleSort(c.key)}
                    aria-label={`Sort by ${c.label}`}
                    aria-sort={
                      sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      boxShadow: "none",
                      color: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    <span>{c.label}</span>
                    <span aria-hidden="true" style={{ opacity: 0.7 }}>{sortIcon(c.key)}</span>
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((r) => (
            <tr
              key={r.id}
              tabIndex={0}
              onClick={() => onRowClick && onRowClick(r)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && onRowClick) {
                  e.preventDefault();
                  onRowClick(r);
                }
              }}
              style={{
                borderBottom: "1px solid var(--color-border)",
                cursor: onRowClick ? "pointer" : "default"
              }}
            >
              {columns.map((c) => (
                <td key={c.key} style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                  {c.format ? c.format(r?.[c.key]) : r?.[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {sortedRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-muted" style={{ padding: "16px" }}>
                No accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
