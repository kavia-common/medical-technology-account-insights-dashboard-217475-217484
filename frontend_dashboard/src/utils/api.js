//
// API utilities with feature-flagged mock support.
// Reads REACT_APP_API_BASE and exposes simple methods that currently return mock data via Promises,
// while remaining future-ready for real fetch() calls.
//

import { useFeatureFlags } from "../featureFlags";

/**
 * Internal: obtain API base from environment.
 * Consumers should not hard-code URLs; use environment variables.
 */
function getApiBase() {
  // Note: Ensure REACT_APP_API_BASE is provided in .env at runtime by the orchestrator.
  return process.env.REACT_APP_API_BASE || "";
}

/**
 * Internal: mock data fixtures for the dashboard.
 * These can be extended as the app grows.
 */
const mockData = {
  kpis: {
    revenue: 12345678.9,
    growthPct: 0.064,
    activeAccounts: 342,
    churnPct: 0.018
  },
  accounts: [
    { id: "A-1001", name: "City General Hospital", region: "Northeast", spend: 1534000, growthPct: 0.042 },
    { id: "A-1002", name: "Valley Medical Center", region: "West", spend: 986000, growthPct: -0.012 },
    { id: "A-1003", name: "Riverside Health", region: "Midwest", spend: 712300, growthPct: 0.078 }
  ],
  insights: [
    { id: "I-1", title: "Upsell opportunity in Cardiology devices", impact: "high" },
    { id: "I-2", title: "Bundle proposal for imaging and monitoring", impact: "medium" }
  ]
};

/**
 * PUBLIC_INTERFACE
 * getKpis: Returns KPI overview data.
 * If feature flag "mock" is true, returns mock data; otherwise, prepares for real API call.
 * Returns a Promise for consistency and easy future migration.
 */
export function getKpis({ signal } = {}) {
  const useMock = readMockFlag();
  if (useMock) {
    return Promise.resolve(structuredCloneIfPossible(mockData.kpis));
  }
  const base = getApiBase();
  if (!base) {
    // Graceful fallback to mock if API base is not configured
    return Promise.resolve(structuredCloneIfPossible(mockData.kpis));
  }
  // Future: replace with real fetch
  return fetchJson(`${base}/kpis`, { signal }).catch(() => structuredCloneIfPossible(mockData.kpis));
}

/**
 * PUBLIC_INTERFACE
 * getAccounts: Returns list of accounts.
 */
export function getAccounts({ signal } = {}) {
  const useMock = readMockFlag();
  if (useMock) {
    return Promise.resolve(structuredCloneIfPossible(mockData.accounts));
  }
  const base = getApiBase();
  if (!base) {
    return Promise.resolve(structuredCloneIfPossible(mockData.accounts));
  }
  return fetchJson(`${base}/accounts`, { signal }).catch(() => structuredCloneIfPossible(mockData.accounts));
}

/**
 * PUBLIC_INTERFACE
 * getInsights: Returns list of insights.
 */
export function getInsights({ signal } = {}) {
  const useMock = readMockFlag();
  if (useMock) {
    return Promise.resolve(structuredCloneIfPossible(mockData.insights));
  }
  const base = getApiBase();
  if (!base) {
    return Promise.resolve(structuredCloneIfPossible(mockData.insights));
  }
  return fetchJson(`${base}/insights`, { signal }).catch(() => structuredCloneIfPossible(mockData.insights));
}

/**
 * PUBLIC_INTERFACE
 * useApi: React-friendly accessor for API methods alongside the mock flag from context.
 * This allows components to easily switch behaviors based on flags if needed.
 */
export function useApi() {
  const flags = useFeatureFlags();
  return {
    mock: Boolean(flags?.mock),
    getKpis,
    getAccounts,
    getInsights
  };
}

/**
 * Helper to read the "mock" feature flag from process.env or FeatureFlags context emulation.
 * Priority: REACT_APP_FEATURE_FLAGS (env) -> default false.
 */
function readMockFlag() {
  const raw = process.env.REACT_APP_FEATURE_FLAGS || "";
  if (!raw) return false;
  // Support JSON or CSV "key=value" parsing similar to featureFlags.js
  try {
    const t = String(raw).trim();
    if (t.startsWith("{") || t.startsWith("[")) {
      const parsed = JSON.parse(t);
      if (parsed && typeof parsed === "object" && "mock" in parsed) {
        return Boolean(parsed.mock);
      }
    } else {
      const map = t.split(",").reduce((acc, pair) => {
        const [k, v] = pair.split("=").map(s => (s || "").trim());
        if (k) acc[k] = v === undefined || v === "" ? true : /^(true|1)$/i.test(v);
        return acc;
      }, {});
      if ("mock" in map) return Boolean(map.mock);
    }
  } catch {
    // ignore parse errors
  }
  return false;
}

/**
 * Internal: JSON fetch helper with robust error handling.
 */
async function fetchJson(url, { signal, ...init } = {}) {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    signal,
    ...init
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Request failed ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Clone helper to avoid accidental mutations of mock fixtures across components.
 */
function structuredCloneIfPossible(obj) {
  try {
    // eslint-disable-next-line no-undef
    if (typeof structuredClone === "function") return structuredClone(obj);
  } catch {
    // fallthrough
  }
  return JSON.parse(JSON.stringify(obj));
}

export default {
  getKpis,
  getAccounts,
  getInsights,
  useApi
};
