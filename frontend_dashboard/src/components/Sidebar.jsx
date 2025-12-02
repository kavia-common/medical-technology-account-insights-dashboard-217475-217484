import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar component - Ocean Professional
 * - Collapsible navigation rail with labeled links
 * - Uses NavLink to highlight the active route
 */

// PUBLIC_INTERFACE
export default function Sidebar({
  collapsed = false,
  onNavigate = () => {},
}) {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/accounts', label: 'Accounts', icon: '📁' },
    { to: '/insights', label: 'Insights', icon: '💡' },
    { to: '/reports', label: 'Reports', icon: '📄' },
  ];

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Primary"
    >
      <nav className="sidebar__nav" role="navigation" aria-label="Primary navigation">
        <ul className="sidebar__list">
          {items.map((it) => (
            <li key={it.to} className="sidebar__item">
              <NavLink
                to={it.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'is-active' : ''}`
                }
                onClick={onNavigate}
              >
                <span className="sidebar__icon" aria-hidden="true">{it.icon}</span>
                <span className="sidebar__label">{it.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar__footer">
        <div className="sidebar__status">
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">Online</span>
        </div>
      </div>
    </aside>
  );
}
