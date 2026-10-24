import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a2332',
            color: '#fff',
            border: '1px solid rgba(197, 165, 90, 0.3)',
          },
          success: {
            iconTheme: { primary: '#D4AF37', secondary: '#1a2332' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1a2332' },
          },
        }}
      />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
