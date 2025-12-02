import React, { createContext, useContext, useMemo } from 'react';

/**
 * Parse a comma-separated or JSON string of flags to a normalized object.
 * Supports:
 * - "mock=true,insightsBeta=false"
 * - '{"mock": true, "insightsBeta": false}'
 */
function parseFlags(raw) {
  if (!raw) return {};
  const str = String(raw).trim();
  try {
    if (str.startsWith('{') || str.startsWith('[')) {
      const parsed = JSON.parse(str);
      if (parsed && typeof parsed === 'object') return parsed;
      return {};
    }
  } catch {
    // fallthrough to CSV parsing
  }
  // CSV parsing: key=value,key2=value2 ...
  return str.split(',').reduce((acc, pair) => {
    const [k, v] = pair.split('=').map(s => (s || '').trim());
    if (!k) return acc;
    let val = v;
    if (v === undefined || v === '') val = true;
    else if (/^(true|false)$/i.test(v)) val = /^true$/i.test(v);
    else if (!isNaN(Number(v))) val = Number(v);
    acc[k] = val;
    return acc;
  }, {});
}

// PUBLIC_INTERFACE
export const FeatureFlagsContext = createContext({});

/**
 * PUBLIC_INTERFACE
 * Provide feature flags parsed from REACT_APP_FEATURE_FLAGS to children.
 */
export function FeatureFlagsProvider({ children }) {
  const flags = useMemo(() => {
    const raw = process.env.REACT_APP_FEATURE_FLAGS;
    return parseFlags(raw);
  }, []);

  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * Hook to access feature flags
 */
export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}

export default FeatureFlagsProvider;
