import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  badge?: string
  badgeColor?: 'primary' | 'emerald' | 'amber' | 'red'
}

const badgeColors = {
  primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title, subtitle, icon, actions, badge, badgeColor = 'primary'
}) => {
  return (
    <div className="flex items-start justify-between mb-7 animate-fade-in">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-600/20 flex items-center justify-center border border-primary-500/20">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display dark:text-white text-slate-900">{title}</h1>
            {badge && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm dark:text-slate-400 text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

export default PageHeader
