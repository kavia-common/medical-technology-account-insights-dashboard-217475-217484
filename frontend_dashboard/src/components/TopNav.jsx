import React from 'react';

/**
 * TopNav component - Ocean Professional
 * - Displays brand, global search placeholder, and action buttons
 * - Provides controls to toggle theme and collapse/expand the sidebar
 */

// PUBLIC_INTERFACE
export default function TopNav({
  theme = 'light',
  onToggleTheme = () => {},
  sidebarCollapsed = false,
  onToggleSidebar = () => {},
}) {
  /**
   * Accessible labels and aria attributes ensure screen reader clarity.
   * Keyboard users get clear focus indicators via index.css focus styles.
   */
  return (
    <header className="topnav" role="banner">
      <div className="topnav__left">
        <button
          className="icon-btn"
          aria-label={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar`}
          onClick={onToggleSidebar}
        >
          {/* burger icon */}
          <span className="icon-bars" aria-hidden="true" />
        </button>

        <div className="brand" aria-label="Application Name">
          <span className="brand__dot" aria-hidden="true" />
          <strong>MedTech Account Insights</strong>
        </div>
      </div>

      <div className="topnav__center" role="search">
        <div className="search">
          <span className="search__icon" aria-hidden="true">🔎</span>
          <input
            className="search__input"
            type="text"
            placeholder="Search accounts, reports, insights…"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="topnav__right">
        <button
          className="btn-primary"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <span className="icon-bell" aria-hidden="true" />
        </button>
        <button className="avatar" aria-label="User menu">
          <span className="avatar__circle" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
