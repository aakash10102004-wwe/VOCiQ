import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Package, Users, ShoppingBag, TrendingUp } from 'lucide-react'

// Import existing page components as tab content
import ProductAnalytics from './ProductAnalytics'
import CustomerJourney from './CustomerJourney'
import ProductNetwork from './ProductNetwork'
import LayoutOptimizer from './LayoutOptimizer'

const tabs = [
  { id: 'products', label: 'Product Performance', icon: Package },
  { id: 'customers', label: 'Customer Behavior', icon: Users },
  { id: 'basket', label: 'Basket Analysis', icon: ShoppingBag },
  { id: 'peak-hours', label: 'Peak Hours & Layout', icon: TrendingUp },
]

const SalesInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center border border-blue-500/20">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display">Sales & Customer Insights</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">Product performance, customer behavior, and basket analysis</p>
          </div>
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
                layoutId="sales-tab-indicator"
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
        {activeTab === 'products' && <ProductAnalytics />}
        {activeTab === 'customers' && <CustomerJourney />}
        {activeTab === 'basket' && <ProductNetwork />}
        {activeTab === 'peak-hours' && <LayoutOptimizer />}
      </motion.div>
    </div>
  )
}

export default SalesInsights
