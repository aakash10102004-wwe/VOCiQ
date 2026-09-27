import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CrowdAnalytics from './pages/CrowdAnalytics'
import SalesInsights from './pages/SalesInsights'
import CompetitorIntelligence from './pages/CompetitorIntelligence'
import PredictionsPage from './pages/PredictionsPage'
import DatasetAnalysis from './pages/DatasetAnalysis'
import Settings from './pages/Settings'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected app routes — 6 main sections */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crowd-analytics" element={<CrowdAnalytics />} />
        <Route path="/sales" element={<SalesInsights />} />
        <Route path="/competitors" element={<CompetitorIntelligence />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/dataset" element={<DatasetAnalysis />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
