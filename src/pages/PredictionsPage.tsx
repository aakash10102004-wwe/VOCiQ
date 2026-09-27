import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Users, Sparkles, LineChart, HeartPulse } from 'lucide-react'

// Import existing page components as tab content
import BranchPredictor from './BranchPredictor'
import FestivalDemand from './FestivalDemand'
import BusinessHealth from './BusinessHealth'
import StaffAnalytics from './StaffAnalytics'
import PremiumReports from './PremiumReports'

const tabs = [
  { id: 'sales-prediction', label: 'Sales Prediction', icon: TrendingUp },
  { id: 'crowd-prediction', label: 'Crowd & Staff Prediction', icon: Users },
  { id: 'recommendations', label: 'Smart Recommendations', icon: Sparkles },
  { id: 'forecasting', label: 'Trend Forecasting', icon: LineChart },
]

const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales-prediction')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 flex items-center justify-center border border-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display">Predictions & Recommendations</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">AI-powered forecasting, predictions, and smart business recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl dark:bg-purple-500/10 bg-purple-50 border border-purple-500/20">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">AI Powered</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="pred-tab-indicator"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'sales-prediction' && <BranchPredictor />}
        {activeTab === 'crowd-prediction' && <StaffAnalytics />}
        {activeTab === 'recommendations' && <BusinessHealth />}
        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            <FestivalDemand />
            <div className="mt-8">
              <PremiumReports />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PredictionsPage
