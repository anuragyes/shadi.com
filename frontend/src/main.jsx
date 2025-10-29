import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from '../src/Context/Authcontext.js';
import { Toaster } from 'react-hot-toast';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <AuthProvider>
      <App />
      {/* Toaster should be mounted once in your app */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000, // 2 seconds
        }}
      />
    </AuthProvider>
  </StrictMode>
);
