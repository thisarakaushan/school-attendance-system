// File: src/index.js
// Process: Entry point, renders the App component into the DOM.
// Flow: Mounts the React app to #root in index.html.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);