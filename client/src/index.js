/////////////
// IMPORTS //
/////////////
// React
import React from 'react';
import ReactDOM from 'react-dom/client';
// Style
import './style/index.css';
// Performance
import reportWebVitals from './reportWebVitals';
// Pass
import App from './App';
// Translation
import './utils/translationInit';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
