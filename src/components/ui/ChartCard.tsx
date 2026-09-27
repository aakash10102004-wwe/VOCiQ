import React, { ReactNode, useState } from 'react'
import { MoreHorizontal, RefreshCw, Maximize2 } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  filters?: string[]
  onFilterChange?: (filter: string) => void
  className?: string
  actions?: ReactNode
}

const ChartCard: React.FC<ChartCardProps> = ({
  title, subtitle, children, filters, onFilterChange, className = '', actions
}) => {
  const [activeFilter, setActiveFilter] = useState(filters?.[0] ?? '')
  const [loading, setLoading] = useState(false)

  const handleFilter = (f: string) => {
    setActiveFilter(f)
    setLoading(true)
    setTimeout(() => setLoading(false), 600)
    onFilterChange?.(f)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className={`chart-container animate-fade-in ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold dark:text-white text-slate-900 font-display">{title}</h3>
          {subtitle && <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {filters && (
            <div className="flex rounded-lg overflow-hidden border dark:border-white/10 border-slate-200">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    activeFilter === f
                      ? 'bg-primary-500 text-white'
                      : 'dark:text-slate-400 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          {actions}
          <button onClick={handleRefresh} className="w-7 h-7 rounded-lg dark:bg-white/5 bg-slate-100 flex items-center justify-center dark:hover:bg-white/10 hover:bg-slate-200 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 dark:text-slate-400 text-slate-500 transition-all ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="w-7 h-7 rounded-lg dark:bg-white/5 bg-slate-100 flex items-center justify-center dark:hover:bg-white/10 hover:bg-slate-200 transition-colors">
            <Maximize2 className="w-3.5 h-3.5 dark:text-slate-400 text-slate-500" />
          </button>
        </div>
      </div>
      <div className={`transition-opacity duration-300 ${loading ? 'opacity-30' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  )
}

export default ChartCard
