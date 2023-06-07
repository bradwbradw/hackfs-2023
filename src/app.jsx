import React from 'react'
import { createRoot } from 'react-dom/client'
import { Link, Route } from 'wouter'
import './index.css'
import './App.css'
import { ErrorBoundary } from './ErrorBoundary'
import { Routes } from './Routes'

const container = document.getElementById('app');
const rooot = createRoot(container);
rooot.render(
  <React.StrictMode >
    <ErrorBoundary fallback={<p>Something went wrong</p>}>

      <div style={{ position: 'absolute', top: 0, left: 0 }} >
        <Link to="/"> home </Link>
        <Link to="about"> about </Link>
      </div>
      <Routes />
    </ErrorBoundary>
  </React.StrictMode >
);

