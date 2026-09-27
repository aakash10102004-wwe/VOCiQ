import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  prefix?: string
  suffix?: string
  delay?: number
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeLabel, icon: Icon,
  iconColor = 'text-primary-400', iconBg = 'bg-primary-500/10',
  prefix = '', suffix = '', delay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const duration = 1200
      const step = (timestamp: number) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.floor(eased * numericValue))
        if (progress < 1) requestAnimationFrame(step)
        else setDisplayValue(numericValue)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timer)
  }, [numericValue, delay])

  const formatted = typeof value === 'string'
    ? value
    : displayValue.toLocaleString('en-IN')

  const isPositive = (change ?? 0) > 0
  const isNegative = (change ?? 0) < 0

  return (
    <div className="metric-card animate-slide-up group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400'
            : isNegative ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-500/10 text-slate-400'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" />
              : isNegative ? <TrendingDown className="w-3 h-3" />
              : <Minus className="w-3 h-3" />
            }
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm dark:text-slate-400 text-slate-500 mb-1 font-medium">{title}</p>
        <p className="stat-value dark:text-white text-slate-900">
          {prefix}{formatted}{suffix}
        </p>
        {changeLabel && (
          <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  )
}

export default StatCard
