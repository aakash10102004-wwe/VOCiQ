import React from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  default: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
  default: 'bg-slate-400',
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', dot, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${variants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse-soft`} />}
      {children}
    </span>
  )
}

export default Badge

export type { BadgeVariant }
