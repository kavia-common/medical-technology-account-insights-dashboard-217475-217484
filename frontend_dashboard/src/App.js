import React, { useState, useEffect } from 'react';
import './App.css';
import { useFeatureFlags } from './featureFlags';

/**
 * Basic shell layout with TopNav and Sidebar placeholders.
 * Children content area is where routed pages render.
 */
function Shell({ children, theme, onToggleTheme }) {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: '56px 1fr', gridTemplateColumns: '240px 1fr', gridTemplateAreas: `"topnav topnav" "sidebar main"` }}>
      <header style={{ gridArea: 'topnav', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, background: 'var(--color-primary)', borderRadius: 999 }} aria-hidden="true" />
          <strong>MedTech Account Insights</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-primary" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>
      <aside style={{ gridArea: 'sidebar', padding: '16px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            <li><a href="#/dashboard">Dashboard</a></li>
            <li><a href="#/accounts">Accounts</a></li>
            <li><a href="#/insights">Insights</a></li>
            <li><a href="#/reports">Reports</a></li>
          </ul>
        </nav>
      </aside>
      <main style={{ gridArea: 'main' }}>
        {children}
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App({ children }) {
  const [theme, setTheme] = useState('light');
  const flags = useFeatureFlags();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Example: expose mock flag (if set) via data attribute for debugging/styles
  useEffect(() => {
    if (flags && typeof flags.mock !== 'undefined') {
      document.documentElement.setAttribute('data-flag-mock', String(Boolean(flags.mock)));
    }
  }, [flags]);

  return (
    <Shell theme={theme} onToggleTheme={toggleTheme}>
      {children}
    </Shell>
  );
}

export default App;
