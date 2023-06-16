import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { ErrorBoundary } from './ErrorBoundary'
import { Routes } from './Routes'
import { NextUIProvider, createTheme } from '@nextui-org/react'
import Web3UI from './components/Web3UI'

const container = document.getElementById('app');
const rooot = createRoot(container);
rooot.render(
  <React.StrictMode >
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <NextUIProvider theme={createTheme({
        type: 'dark'
      })} />

      <Web3UI >
        <Routes />
      </Web3UI>
    </ErrorBoundary>
  </React.StrictMode >
);

