import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Accounts from './pages/Accounts.jsx';
import Insights from './pages/Insights.jsx';

// Lightweight placeholder pages (keep others simple for now)
function PageContainer({ title, children }) {
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
      <div className="card">
        <h1>{title}</h1>
        <p className="text-muted">{children}</p>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export const AccountDetail = () => (
  <PageContainer title="Account Detail">Deep dive into a specific account.</PageContainer>
);

// PUBLIC_INTERFACE
export const Reports = () => (
  <PageContainer title="Reports">Create and export reports.</PageContainer>
);

/**
 * PUBLIC_INTERFACE
 * AppRouter defines all primary routes. The application root must provide a Router.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/accounts/:accountId" element={<AccountDetail />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
