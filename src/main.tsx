import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
import App from './App.tsx';
import './index.css';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);