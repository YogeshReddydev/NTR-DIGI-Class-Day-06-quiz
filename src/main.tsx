import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NetworkProvider>
        <App />
      </NetworkProvider>
    </AuthProvider>
  </StrictMode>,
);
