import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
// Geist fonts: import the specific weights we use
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';
import '@fontsource/geist-sans/800.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import App from './App.tsx';
import './index.css';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);