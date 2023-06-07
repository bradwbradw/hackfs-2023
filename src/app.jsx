import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { ErrorBoundary } from './ErrorBoundary'
import { Routes } from './Routes'
import Navigation from './components/Navigation'

const container = document.getElementById('app');
const rooot = createRoot(container);
rooot.render(
  <React.StrictMode >
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Navigation />
      <Routes />
    </ErrorBoundary>
  </React.StrictMode >
);

