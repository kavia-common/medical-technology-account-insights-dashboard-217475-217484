import React, { useState, useEffect } from 'react';
import './App.css';
import { useFeatureFlags } from './featureFlags';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';

/**
 * Shell layout using TopNav and Sidebar components.
 * Responsive grid: top nav, collapsible sidebar, main content area.
 */
function Shell({ children, theme, onToggleTheme }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => setSidebarCollapsed((v) => !v);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <TopNav
        theme={theme}
        onToggleTheme={onToggleTheme}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
      />
      <main className="main" role="main">
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
