/**
 * Main entry point for the React application
 * Initializes sample data and renders the App component
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { initializeSampleData } from './utils/sampleData.js';

// Initialize sample data on first load
initializeSampleData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

