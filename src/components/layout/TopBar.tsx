import React from 'react'
import { Bell, Search, Sun, Moon, ChevronDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface TopBarProps {
  sidebarCollapsed: boolean
}

const TopBar: React.FC<TopBarProps> = ({ sidebarCollapsed }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 flex items-center px-6 gap-4
        transition-all duration-300
        ${sidebarCollapsed ? 'left-16' : 'left-64'}
        dark:bg-slate-900/80 bg-white/80 backdrop-blur-xl
        dark:border-b dark:border-white/5 border-b border-slate-200`}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-400 text-slate-400" />
          <input
            type="text"
            placeholder="Search analytics, branches, products…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm
              dark:bg-white/5 bg-slate-100
              dark:text-white text-slate-900
              dark:placeholder-slate-500 placeholder-slate-400
              border dark:border-white/5 border-slate-200
              focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl dark:bg-white/5 bg-slate-100 flex items-center justify-center
          dark:hover:bg-white/10 hover:bg-slate-200 transition-colors group">
          <Bell className="w-4 h-4 dark:text-slate-400 text-slate-600 group-hover:text-primary-400 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 dark:ring-slate-900 ring-white" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl dark:bg-white/5 bg-slate-100 flex items-center justify-center
            dark:hover:bg-white/10 hover:bg-slate-200 transition-colors group"
        >
          {isDark
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-primary-600" />
          }
        </button>

        {/* User */}
        <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
          dark:bg-white/5 bg-slate-100
          dark:hover:bg-white/10 hover:bg-slate-200 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">RR</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold dark:text-white text-slate-900 leading-none">Admin</p>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">Reliance Retail</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 dark:text-slate-400 text-slate-500" />
        </button>
      </div>
    </header>
  )
}

export default TopBar
