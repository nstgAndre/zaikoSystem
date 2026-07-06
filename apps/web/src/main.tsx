import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root 要素が index.html に存在しない');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
