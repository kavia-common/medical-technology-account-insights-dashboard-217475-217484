import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AppRouter from './router.jsx';
import { FeatureFlagsProvider } from './featureFlags';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FeatureFlagsProvider>
      <App>
        <AppRouter />
      </App>
    </FeatureFlagsProvider>
  </React.StrictMode>
);
