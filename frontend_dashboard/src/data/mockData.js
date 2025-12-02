//
// Mock datasets and async getters for OEM account mining dashboard
// Shapes align to expected usage in dashboard, accounts, trends, opportunities, and insights pages.
// All getters return Promises to mirror async API behavior.
//

/**
 * Shared utilities
 */
function deepClone(obj) {
  try {
    // eslint-disable-next-line no-undef
    if (typeof structuredClone === "function") return structuredClone(obj);
  } catch {}
  return JSON.parse(JSON.stringify(obj));
}

// Generate last 12 months labels and values helper
function generate12MonthSeries({ base = 100, volatility = 0.08 }) {
  const now = new Date();
  const months = [];
  let value = base;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    // Random walk within volatility
    const delta = (Math.random() * 2 - 1) * volatility;
    value = Math.max(0, value * (1 + delta));
    months.push({ month: key, value: Number(value.toFixed(2)) });
  }
  return months;
}

// ----------------------
// Mock Data Definitions
// ----------------------

const mockKPIs = {
  // High-level dashboard KPIs
  totalRevenue: 18452344.67, // YTD or last 12 mo
  revenueGrowthPct: 0.072, // YoY
  activeAccounts: 418,
  avgDealSize: 124000.5,
  churnPct: 0.017,
  pipelineValue: 5620000,
  winRatePct: 0.312
};

const mockAccounts = [
  {
    id: "ACC-1001",
    name: "City General Hospital",
    region: "Northeast",
    segment: "Integrated Delivery Network",
    spendYTD: 1534000,
    last12moRevenue: 2012500,
    growthPct: 0.042,
    owner: "Alex Chen",
    specialties: ["Cardiology", "Imaging", "Monitoring"],
    bedCount: 850,
    city: "Boston",
    state: "MA"
  },
  {
    id: "ACC-1002",
    name: "Valley Medical Center",
    region: "West",
    segment: "Acute Care",
    spendYTD: 986000,
    last12moRevenue: 1234800,
    growthPct: -0.012,
    owner: "Priya Singh",
    specialties: ["Surgery", "Orthopedics"],
    bedCount: 420,
    city: "San Jose",
    state: "CA"
  },
  {
    id: "ACC-1003",
    name: "Riverside Health",
    region: "Midwest",
    segment: "Academic Medical Center",
    spendYTD: 712300,
    last12moRevenue: 945200,
    growthPct: 0.078,
    owner: "Chris Johnson",
    specialties: ["Cardiology", "Neurology", "Imaging"],
    bedCount: 1200,
    city: "Chicago",
    state: "IL"
  },
  {
    id: "ACC-1004",
    name: "Sunrise Regional Hospital",
    region: "South",
    segment: "Acute Care",
    spendYTD: 532000,
    last12moRevenue: 702200,
    growthPct: 0.023,
    owner: "Morgan Lee",
    specialties: ["Emergency", "Imaging"],
    bedCount: 600,
    city: "Atlanta",
    state: "GA"
  }
];

// 12-month KPI trends for dashboard charts
const mockTrends = {
  revenue: generate12MonthSeries({ base: 1.6, volatility: 0.1 }).map(({ month, value }) => ({
    month,
    value: Number((value * 1_000_000).toFixed(0)) // in USD
  })),
  deals: generate12MonthSeries({ base: 75, volatility: 0.2 }).map(({ month, value }) => ({
    month,
    value: Math.round(value)
  })),
  churnRatePct: generate12MonthSeries({ base: 2, volatility: 0.25 }).map(({ month, value }) => ({
    month,
    value: Number((value / 100).toFixed(3)) // store as fraction 0..1
  })),
  // Example product line trends for stacked/segmented charts
  productLines: [
    {
      key: "Cardiology",
      series: generate12MonthSeries({ base: 420, volatility: 0.12 }).map(({ month, value }) => ({
        month,
        value: Math.round(value * 1000)
      }))
    },
    {
      key: "Imaging",
      series: generate12MonthSeries({ base: 560, volatility: 0.10 }).map(({ month, value }) => ({
        month,
        value: Math.round(value * 1000)
      }))
    },
    {
      key: "Monitoring",
      series: generate12MonthSeries({ base: 280, volatility: 0.15 }).map(({ month, value }) => ({
        month,
        value: Math.round(value * 1000)
      }))
    }
  ]
};

// Opportunity records for pipeline/up-sell views
const mockOpportunities = [
  {
    id: "OPP-5001",
    accountId: "ACC-1001",
    accountName: "City General Hospital",
    title: "Cardiology Cath Lab Upgrade",
    stage: "Proposal",
    amount: 850000,
    probability: 0.45,
    owner: "Alex Chen",
    expectedClose: "2025-02-15",
    products: ["Cath Lab System X", "Hemodynamic Monitoring"],
    notes: "Strong clinical champion; budget cycle closes in Q1."
  },
  {
    id: "OPP-5002",
    accountId: "ACC-1002",
    accountName: "Valley Medical Center",
    title: "Imaging Suite Refurbishment",
    stage: "Qualification",
    amount: 420000,
    probability: 0.25,
    owner: "Priya Singh",
    expectedClose: "2025-04-30",
    products: ["MRI 1.5T Upgrade", "Ultrasound Portable Fleet"],
    notes: "RFP expected next month; competitor entrenched."
  },
  {
    id: "OPP-5003",
    accountId: "ACC-1003",
    accountName: "Riverside Health",
    title: "Remote Monitoring Expansion",
    stage: "Negotiation",
    amount: 610000,
    probability: 0.6,
    owner: "Chris Johnson",
    expectedClose: "2025-01-20",
    products: ["Telemetry Central Station", "Wearable Monitors"],
    notes: "Pilot outcomes positive; procurement aligned."
  }
];

// AI/analyst insights list for the Insights page/cards
const mockInsights = [
  {
    id: "INS-9001",
    type: "upsell",
    severity: "high",
    title: "Bundle proposal opportunity for Imaging + Monitoring",
    description:
      "Accounts with above-average Imaging utilization and below-average Monitoring adoption show 18% higher close rate with bundled offers.",
    impactedAccounts: ["ACC-1001", "ACC-1003"],
    potentialImpactUSD: 1200000,
    recommendedActions: [
      "Prepare bundled pricing for Imaging + Monitoring",
      "Highlight interoperability and workflow benefits",
      "Target high utilization imaging departments"
    ]
  },
  {
    id: "INS-9002",
    type: "retention",
    severity: "medium",
    title: "Rising risk in West region due to competitor service contracts",
    description:
      "Renewal delays and increased competitor activity indicate potential churn risk in the West. Focus on service SLAs and equipment uptime guarantees.",
    impactedAccounts: ["ACC-1002"],
    potentialImpactUSD: 350000,
    recommendedActions: [
      "Offer enhanced service SLA with guaranteed response time",
      "Engage clinical leadership with uptime metrics",
      "Include proactive maintenance plan"
    ]
  },
  {
    id: "INS-9003",
    type: "efficiency",
    severity: "low",
    title: "Standardize accessory consumables",
    description:
      "Accounts purchasing mixed accessories can realize 3–5% savings by standardizing on OEM consumables tied to equipment bundles.",
    impactedAccounts: ["ACC-1001", "ACC-1004"],
    potentialImpactUSD: 180000,
    recommendedActions: [
      "Audit accessory SKUs across departments",
      "Propose standardized bundle SKUs",
      "Include staff training for new accessory procedures"
    ]
  }
];

// ----------------------
// Async Getters (Promises)
// ----------------------

/**
 * PUBLIC_INTERFACE
 * getKpis: summary metrics for the dashboard
 * Returns: Promise<{ totalRevenue, revenueGrowthPct, activeAccounts, avgDealSize, churnPct, pipelineValue, winRatePct }>
 */
export function getKpis() {
  return Promise.resolve(deepClone(mockKPIs));
}

/**
 * PUBLIC_INTERFACE
 * getAccounts: list of customer accounts with basic profiling
 * Returns: Promise<Array<Account>>
 * Account shape:
 *  { id, name, region, segment, spendYTD, last12moRevenue, growthPct, owner, specialties[], bedCount, city, state }
 */
export function getAccounts() {
  return Promise.resolve(deepClone(mockAccounts));
}

/**
 * PUBLIC_INTERFACE
 * getTrends: time series data for 12-month trends used in charts
 * Returns: Promise<{
 *   revenue: Array<{ month: "YYYY-MM", value: number }>,
 *   deals: Array<{ month: "YYYY-MM", value: number }>,
 *   churnRatePct: Array<{ month: "YYYY-MM", value: number /* fraction 0..1 */ }>,
 *   productLines: Array<{ key: string, series: Array<{ month, value }> }>
 * }>
 */
export function getTrends() {
  return Promise.resolve(deepClone(mockTrends));
}

/**
 * PUBLIC_INTERFACE
 * getOpportunities: pipeline opportunities data
 * Returns: Promise<Array<Opportunity>>
 * Opportunity shape:
 *  { id, accountId, accountName, title, stage, amount, probability, owner, expectedClose, products[], notes }
 */
export function getOpportunities() {
  return Promise.resolve(deepClone(mockOpportunities));
}

/**
 * PUBLIC_INTERFACE
 * getInsights: AI/analyst suggested insights for action
 * Returns: Promise<Array<Insight>>
 * Insight shape:
 *  { id, type, severity, title, description, impactedAccounts[], potentialImpactUSD, recommendedActions[] }
 */
export function getInsights() {
  return Promise.resolve(deepClone(mockInsights));
}

/**
 * PUBLIC_INTERFACE
 * getAccountById: fetch a single account plus convenience computed fields
 * Returns: Promise<{ account, related: { opportunities: [], insights: [] } } | null>
 */
export async function getAccountById(accountId) {
  const accounts = await getAccounts();
  const account = accounts.find(a => a.id === accountId);
  if (!account) return null;

  const [opps, insights] = await Promise.all([getOpportunities(), getInsights()]);
  const related = {
    opportunities: opps.filter(o => o.accountId === accountId),
    insights: insights.filter(i => i.impactedAccounts?.includes?.(accountId))
  };
  return { account, related };
}

export default {
  getKpis,
  getAccounts,
  getTrends,
  getOpportunities,
  getInsights,
  getAccountById
};
