import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Package, Building2, Users, Warehouse, Sparkles
} from 'lucide-react'

const sections = [
  { id: 'overview', label: 'Overview', icon: Activity, color: 'text-primary-400' },
  { id: 'products', label: 'Products', icon: Package, color: 'text-blue-400' },
  { id: 'branches', label: 'Branches', icon: Building2, color: 'text-violet-400' },
  { id: 'crowd', label: 'Crowd', icon: Users, color: 'text-emerald-400' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, color: 'text-orange-400' },
  { id: 'insights', label: 'Insights', icon: Sparkles, color: 'text-amber-400' },
]

interface DashboardSectionNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const DashboardSectionNav: React.FC<DashboardSectionNavProps> = ({ activeSection, onSectionChange }) => {
  return (
    <div className="dashboard-section-nav glass-card rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto">
      {sections.map((section) => {
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            onClick={() => {
              onSectionChange(section.id)
              const el = document.getElementById(`section-${section.id}`)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 whitespace-nowrap flex-shrink-0
              ${isActive
                ? 'text-white'
                : 'dark:text-slate-400 text-slate-500 hover:dark:text-slate-200 hover:text-slate-700 hover:bg-white/5'
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeSection"
                className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 
                  border border-primary-500/30 rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <section.icon className={`w-4 h-4 relative z-10 ${isActive ? section.color : ''}`} />
            <span className="relative z-10">{section.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default DashboardSectionNav
