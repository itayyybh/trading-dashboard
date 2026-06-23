import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TradingDashboard from './trading_dashboard.jsx' // Changed to Capital T

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TradingDashboard /> {/* Changed to Capital T */}
  </StrictMode>,
)
