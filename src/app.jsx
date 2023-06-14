import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { ErrorBoundary } from './ErrorBoundary'
import { Routes } from './Routes'
import Navigation from './components/Navigation'
import { NextUIProvider, createTheme } from '@nextui-org/react'
import Web3UI from './components/Web3UI'

const container = document.getElementById('app');
const rooot = createRoot(container);
rooot.render(
  <React.StrictMode >
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Web3UI />
      <NextUIProvider theme={createTheme({
        type: 'dark'
      })} />
      <Navigation />
      <Routes />
    </ErrorBoundary>
  </React.StrictMode >
);

