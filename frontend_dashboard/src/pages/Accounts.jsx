import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiltersBar, AccountTable, AccountForm } from "../components";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { getAccounts as getMockAccounts } from "../data/mockData";
import { createAccount as apiCreateAccount } from "../utils/api";

/**
 * PUBLIC_INTERFACE
 * Accounts page - Ocean Professional
 * - Displays a FiltersBar for refining results (region, segment, device category [specialty], min revenue, health score [growth proxy])
 * - Client-side filters applied on mock dataset from data/mockData
 * - Sortable AccountTable with basic pagination
 * - Row click navigates to Account Detail via HashRouter-compatible link
 *
 * Accessibility:
 * - All inputs have labels
 * - Table exposes aria roles and keyboard navigation via AccountTable
 */
export default function Accounts() {
  // data and loading
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // filters state - extends FiltersBar with additional fields for this page
  const [filters, setFilters] = useState({
    search: "",
    region: "",
    segment: "",
    owner: "",
    deviceCategory: "", // maps to account.specialties includes
    minRevenue: "", // number input filters last12moRevenue
    minHealthScore: "" // percentage slider proxy using growthPct (converted)
  });

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getMockAccounts();
        if (!mounted) return;
        setAccounts(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // derive option lists from data for FiltersBar
  const options = useMemo(() => {
    const regions = Array.from(new Set(accounts.map(a => a.region).filter(Boolean))).sort();
    const segments = Array.from(new Set(accounts.map(a => a.segment).filter(Boolean))).sort();
    const owners = Array.from(new Set(accounts.map(a => a.owner).filter(Boolean))).sort();
    const deviceCategories = Array.from(new Set(accounts.flatMap(a => Array.isArray(a.specialties) ? a.specialties : []).filter(Boolean))).sort();
    return { regions, segments, owners, deviceCategories };
  }, [accounts]);

  // apply client-side filters
  const filtered = useMemo(() => {
    const text = String(filters.search || "").toLowerCase().trim();
    const region = filters.region || "";
    const segment = filters.segment || "";
    const owner = filters.owner || "";
    const category = filters.deviceCategory || "";
    const minRevenue = Number(filters.minRevenue) || 0;
    const minHealthPct = Number(filters.minHealthScore); // 0..100 user entry

    return accounts.filter(a => {
      // search on name, city, state, owner
      const matchesSearch =
        !text ||
        [a.name, a.city, a.state, a.owner]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(text));

      const matchesRegion = !region || a.region === region;
      const matchesSegment = !segment || a.segment === segment;
      const matchesOwner = !owner || a.owner === owner;
      const matchesCategory = !category || (Array.isArray(a.specialties) && a.specialties.includes(category));
      const matchesRevenue = !minRevenue || Number(a.last12moRevenue || 0) >= minRevenue;

      // Use growthPct (fraction) as health score proxy; if not set, treat as 0
      const growth = Number(a.growthPct ?? 0) * 100;
      const matchesHealth = isNaN(minHealthPct) || String(filters.minHealthScore).trim() === "" || growth >= minHealthPct;

      return matchesSearch && matchesRegion && matchesSegment && matchesOwner && matchesCategory && matchesRevenue && matchesHealth;
    });
  }, [accounts, filters]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    // reset to page 1 whenever filters change
    setPage(1);
  }, [filters.search, filters.region, filters.segment, filters.owner, filters.deviceCategory, filters.minRevenue, filters.minHealthScore]);

  const handleRowClick = (row) => {
    // Navigate to account detail; row.id is mock like "ACC-1001"
    navigate(`/accounts/${encodeURIComponent(row.id)}`);
  };

  const resetFilters = () =>
    setFilters({
      search: "",
      region: "",
      segment: "",
      owner: "",
      deviceCategory: "",
      minRevenue: "",
      minHealthScore: ""
    });

  async function handleCreateAccount(payload) {
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitBusy(true);
    try {
      const created = await apiCreateAccount({
        ...payload
      });
      // optimistic add to full accounts list
      setAccounts((prev) => [created, ...prev]);
      // reset filters to show the new record easily and go to first page
      resetFilters();
      setPage(1);
      setSubmitSuccess(`Account "${created.name}" created successfully.`);
      // hide the form after a brief delay to confirm success to SR users
      setTimeout(() => {
        setShowAdd(false);
        setSubmitSuccess("");
      }, 1000);
    } catch (e) {
      setSubmitError("Failed to create account. Please try again.");
    } finally {
      setSubmitBusy(false);
    }
  }

  // Additional filter controls not present in shared FiltersBar are rendered inline below it.
  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Accounts</h1>
          <span className="text-muted">Filter and explore customer accounts</span>
        </div>
        <div>
          <button
            className="btn-primary"
            onClick={() => {
              setShowAdd((v) => !v);
              setSubmitError("");
              setSubmitSuccess("");
            }}
            aria-expanded={showAdd}
            aria-controls="add-account-panel"
          >
            {showAdd ? "Close" : "Add Account"}
          </button>
        </div>
      </div>

      {showAdd && (
        <section id="add-account-panel" aria-label="Add account" className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>New Account</h3>
          <AccountForm
            options={{ regions: options.regions, segments: options.segments, deviceCategories: options.deviceCategories }}
            onSubmit={handleCreateAccount}
            onCancel={() => { setShowAdd(false); setSubmitError(""); setSubmitSuccess(""); }}
            submitLabel="Create Account"
            busy={submitBusy}
            error={submitError}
            success={submitSuccess}
          />
        </section>
      )}

      {/* Primary Filters (shared) */}
      <FiltersBar
        filters={{
          search: filters.search,
          region: filters.region,
          segment: filters.segment,
          owner: filters.owner
        }}
        options={{
          regions: options.regions,
          segments: options.segments,
          owners: options.owners
        }}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onReset={resetFilters}
      />

      {/* Secondary Filters: Device Category, Min Revenue, Health Score */}
      <section
        className="card"
        aria-label="Additional filters"
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(200px, 1fr))",
          gap: 12
        }}
      >
        <div>
          <label htmlFor="filter-device" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Device Category
          </label>
          <select
            id="filter-device"
            aria-label="Device category"
            value={filters.deviceCategory}
            onChange={(e) => setFilters((f) => ({ ...f, deviceCategory: e.target.value }))}
          >
            <option value="">All</option>
            {options.deviceCategories?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-minrevenue" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Min Revenue (12 mo)
          </label>
          <input
            id="filter-minrevenue"
            aria-label="Minimum revenue in last 12 months"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="e.g., 500000"
            value={filters.minRevenue}
            onChange={(e) => setFilters((f) => ({ ...f, minRevenue: e.target.value }))}
          />
          <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            Current: {filters.minRevenue ? formatCurrency(Number(filters.minRevenue), { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "—"}
          </div>
        </div>

        <div>
          <label htmlFor="filter-health" className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
            Min Health Score (Growth %)
          </label>
          <input
            id="filter-health"
            aria-label="Minimum health score percent"
            type="number"
            step="1"
            min="-100"
            max="100"
            placeholder="e.g., 0"
            value={filters.minHealthScore}
            onChange={(e) => setFilters((f) => ({ ...f, minHealthScore: e.target.value }))}
          />
          <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            Current: {filters.minHealthScore !== "" ? formatPercent(Number(filters.minHealthScore), { inputIsFraction: false, minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "—"}
          </div>
        </div>
      </section>

      {/* Summary Bar */}
      <div className="card" style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }} aria-live="polite">
        <div className="text-muted">
          Showing {filtered.length} {filtered.length === 1 ? "account" : "accounts"}
          {filtered.length !== accounts.length ? ` (filtered from ${accounts.length})` : ""}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="text-muted" style={{ fontSize: 12 }}>Page</span>
          <button
            aria-label="Previous page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            ◀
          </button>
          <span aria-live="polite" aria-atomic="true">
            {currentPage} / {totalPages}
          </span>
          <button
            aria-label="Next page"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ marginTop: 12 }}>
        <AccountTable
          rows={pagedRows}
          onRowClick={handleRowClick}
          initialSort={{ key: "last12moRevenue", dir: "desc" }}
        />
      </div>

      {/* Loading / Empty */}
      {loading && (
        <div className="text-muted" style={{ marginTop: 12 }}>
          Loading accounts…
        </div>
      )}
      {!loading && accounts.length === 0 && (
        <div className="text-muted" style={{ marginTop: 12 }}>
          No account data available.
        </div>
      )}
    </div>
  );
}
