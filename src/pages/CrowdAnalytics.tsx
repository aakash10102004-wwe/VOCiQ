import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Users, MapPin, BarChart3, Video } from 'lucide-react'

// Import existing page components as tab content
import CrowdMonitoring from './CrowdMonitoring'
import StoreHeatmap from './StoreHeatmap'
import RealTimePanel from './RealTimePanel'

const tabs = [
  { id: 'live-feed', label: 'Live Feed & Monitoring', icon: Video },
  { id: 'heatmaps', label: 'Heatmaps', icon: MapPin },
  { id: 'footfall', label: 'Footfall Analytics', icon: BarChart3 },
]

const CrowdAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('live-feed')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center border border-emerald-500/20">
            <Eye className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display">Crowd Analytics</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">Monitor foot traffic, crowd density, and heatmaps across branches</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Monitoring
          </span>
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
                layoutId="crowd-tab-indicator"
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
        {activeTab === 'live-feed' && <CrowdMonitoring />}
        {activeTab === 'heatmaps' && <StoreHeatmap />}
        {activeTab === 'footfall' && <RealTimePanel />}
      </motion.div>
    </div>
  )
}

export default CrowdAnalytics
