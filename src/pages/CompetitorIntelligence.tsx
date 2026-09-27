import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, MapPin, BarChart3, Building2, Sparkles } from 'lucide-react'

// Import existing page components as tab content
import CompetitorMonitoring from './CompetitorMonitoring'
import BranchAnalytics from './BranchAnalytics'
import WarehouseAnalytics from './WarehouseAnalytics'

const tabs = [
  { id: 'comparison', label: 'Competitor Comparison', icon: TrendingUp },
  { id: 'branches', label: 'Branch Performance', icon: Building2 },
  { id: 'locations', label: 'Location Analysis', icon: MapPin },
]

const CompetitorIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('comparison')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center border border-rose-500/20">
            <Target className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display">Competitor Intelligence</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">Market comparison, competition density, and location scoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium dark:text-slate-400 text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          AI-Powered Analysis
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
                layoutId="comp-tab-indicator"
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
        {activeTab === 'comparison' && <CompetitorMonitoring />}
        {activeTab === 'branches' && <BranchAnalytics />}
        {activeTab === 'locations' && <WarehouseAnalytics />}
      </motion.div>
    </div>
  )
}

export default CompetitorIntelligence
