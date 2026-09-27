import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Users, TrendingUp,
  ShoppingCart, ChevronLeft, ChevronRight, Brain, Settings, LogOut,
  Eye, Target, Building2, BarChart3, Database
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview Dashboard', color: 'text-primary-400' },
  { path: '/crowd-analytics', icon: Eye, label: 'Crowd Analytics', color: 'text-emerald-400' },
  { path: '/sales', icon: BarChart3, label: 'Sales & Insights', color: 'text-blue-400' },
  { path: '/competitors', icon: Target, label: 'Competitor Intel', color: 'text-rose-400' },
  { path: '/predictions', icon: Brain, label: 'Predictions', color: 'text-purple-400' },
  { path: '/dataset', icon: Database, label: 'Dataset & Analysis', color: 'text-sky-400' },
]

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings', color: 'text-slate-400' },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { business, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderNavItem = (item: typeof navItems[0]) => (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `sidebar-item group ${isActive ? 'active' : 'dark:text-slate-400 text-slate-600'} ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${location.pathname === item.path ? item.color : 'group-hover:' + item.color
        }`} />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
      {!collapsed && location.pathname === item.path && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
      )}
    </NavLink>
  )

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        dark:bg-slate-900/95 bg-white/95 backdrop-blur-xl
        dark:border-r dark:border-white/5 border-r border-slate-200
        shadow-2xl`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b dark:border-white/5 border-slate-200 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-sm font-bold font-display dark:text-white text-slate-900 tracking-tight">VOCiQ</p>
            <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Retail Intelligence</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest dark:text-slate-500 text-slate-400 px-3 mb-3">
            Main Menu
          </p>
        )}
        <div className="space-y-1">
          {navItems.map(renderNavItem)}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 border-t dark:border-white/5 border-slate-200" />

        {!collapsed && (
          <p className="text-xs font-semibold uppercase tracking-widest dark:text-slate-500 text-slate-400 px-3 mb-3">
            System
          </p>
        )}
        <div className="space-y-1">
          {bottomItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Business Info & Logout */}
      {!collapsed && (
        <div className="px-4 py-3 border-t dark:border-white/5 border-slate-200 space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-xl dark:bg-primary-500/10 bg-primary-50">
            <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold dark:text-white text-slate-900 truncate">{business?.name || 'My Business'}</p>
              <p className="text-xs dark:text-slate-400 text-slate-500 truncate">{business?.gstId || business?.licenseId || 'Retail Chain'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium dark:text-red-400 text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
          dark:bg-slate-700 bg-white border dark:border-white/10 border-slate-200
          flex items-center justify-center shadow-md
          transition-all hover:scale-110 dark:text-slate-300 text-slate-600"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>
    </aside>
  )
}

export default Sidebar
