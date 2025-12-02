import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lightweight placeholder pages
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
export const Dashboard = () => (
  <PageContainer title="Dashboard">Overview KPIs and quick insights.</PageContainer>
);

// PUBLIC_INTERFACE
export const Accounts = () => (
  <PageContainer title="Accounts">Browse and search accounts.</PageContainer>
);

// PUBLIC_INTERFACE
export const AccountDetail = () => (
  <PageContainer title="Account Detail">Deep dive into a specific account.</PageContainer>
);

// PUBLIC_INTERFACE
export const Insights = () => (
  <PageContainer title="Insights">Generated insights and opportunities.</PageContainer>
);

// PUBLIC_INTERFACE
export const Reports = () => (
  <PageContainer title="Reports">Create and export reports.</PageContainer>
);

/**
 * PUBLIC_INTERFACE
 * AppRouter sets up the hash-based router and all primary routes.
 */
export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:accountId" element={<AccountDetail />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;
