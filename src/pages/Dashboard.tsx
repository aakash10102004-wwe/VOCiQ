import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ShoppingBag, Building2, Package, Settings,
  TrendingUp, Activity, Upload, Video, Eye,
  Sparkles, ChevronUp, ChevronDown, HeartPulse, Bell,
  Lightbulb, UserCheck, Clock, MapPin, Wifi, Monitor,
  BarChart3, LineChart as LineChartIcon, Link2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import {
  dashboardKPIs as mockKPIs, visitorTrendData as mockVisitorTrend,
  branchPerformanceData as mockBranchPerf, productCategoryData as mockCategoryData,
  weeklyGrowthData as mockWeeklyGrowth, topProducts as mockTopProducts,
  crowdData, productRelationships
} from '../data/mockData'

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16']

const formatINR = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

/* ─── CountUp Component ─── */
const CountUp = ({ value, prefix = '', suffix = '', decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1500
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(eased * value)
      if (progress < 1) requestAnimationFrame(step)
      else setDisplayValue(value)
    }
    requestAnimationFrame(step)
  }, [value])
  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString('en-IN')
  return <span>{prefix}{formatted}{suffix}</span>
}

/* ─── Enhanced Tooltip ─── */
const CustomTooltip = ({ active, payload, label, explanation }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-3 border border-white/10 shadow-xl max-w-xs z-50 backdrop-blur-xl bg-slate-900/90"
      >
        <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="text-white font-semibold tabular-nums">
                {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
              </span>
            </div>
          ))}
        </div>
        {explanation && (
          <p className="text-[11px] text-primary-300/80 mt-2.5 pt-2.5 border-t border-white/5 leading-relaxed">
            💡 {explanation}
          </p>
        )}
      </motion.div>
    )
  }
  return null
}

/* ─── Card ─── */
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`glass-card rounded-3xl p-6 border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-xl transition-shadow duration-300 ${className}`}>
    {children}
  </div>
)

/* ─── Collapsible Section ─── */
const SectionContainer = ({ id, title, icon: Icon, badge, children, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <motion.div
      id={id}
      className="scroll-mt-28 space-y-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/5 flex items-center justify-center border border-primary-500/10 group-hover:border-primary-500/30 transition-colors">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold dark:text-white text-slate-900 tracking-tight font-display">{title}</h2>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">{badge}</span>
          )}
        </div>
        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-6 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const Dashboard: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData

  const [activeNav, setActiveNav] = useState('overview')
  const [showNotification, setShowNotification] = useState(false)
  const [branchSelector, setBranchSelector] = useState('All')

  useEffect(() => {
    const t = setTimeout(() => setShowNotification(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const handleScrollTo = (id: string) => {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Derive Data from CSV
  const derived = useMemo(() => {
    if (!businessData) return null
    const { analysis, parsedData } = businessData
    const { numericStats, topItems, correlations, timeSeries, summary } = analysis
    const numCols = summary.numericColumns
    const totalSales = numericStats[numCols.find(c => /sale|revenue|amount|total|price/i.test(c)) || numCols[0]]?.sum || 0
    const totalRows = summary.totalRows

    const catCol = summary.categoricalColumns[0]
    const categoryData = catCol && topItems[catCol]
      ? topItems[catCol].slice(0, 5).map((item, i) => ({ name: item.value, value: item.count, color: COLORS[i % COLORS.length] }))
      : undefined

    const barData = correlations.length > 0
      ? correlations[0].data.slice(0, 6).map(d => ({ name: d.x, sales: d.y }))
      : undefined

    const tsData = timeSeries.length > 0
      ? timeSeries[0].data.map(d => ({ time: d.date, value: d.value }))
      : undefined

    return { totalSales, totalRows, categoryData, barData, tsData, fileName: businessData.fileName }
  }, [businessData])

  const kpis = hasData && derived ? {
    sales: derived.totalSales,
    visitors: derived.totalRows,
    transactions: derived.totalRows,
    branch: derived.barData?.[0]?.name || 'Unknown',
    health: 89
  } : {
    sales: mockKPIs.totalSales,
    visitors: mockKPIs.totalVisitors,
    transactions: 5842,
    branch: mockKPIs.topBranch,
    health: 92
  }

  // Branch filter for branch performance
  const filteredBranchPerf = useMemo(() => {
    if (branchSelector === 'All') return (hasData ? derived?.barData : mockBranchPerf) || mockBranchPerf
    return ((hasData ? derived?.barData : mockBranchPerf) || mockBranchPerf).filter((b: any) => b.name?.includes(branchSelector))
  }, [branchSelector, hasData, derived])

  // Top product associations
  const topAssociations = productRelationships.slice(0, 4)

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'crowd', label: 'Crowd', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="relative min-h-screen pb-20">

      {/* ── Sticky Nav ── */}
      <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 max-w-full">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeNav === link.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transform scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty State / Header ── */}
      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-3xl p-8 mb-10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight mb-2">Welcome to your Retail Intelligence</h1>
            <p className="text-sm dark:text-slate-400 text-slate-600 max-w-xl leading-relaxed">
              You are currently viewing a live demonstration with rich mock data.
              Upload your own CSV store data to see magic happen.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <Upload className="w-4 h-4" />
            Upload Dataset
          </button>
        </motion.div>
      ) : (
        <div className="mb-10">
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight">Real-time Analytics</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-emerald-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Analyzing {derived?.fileName}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 1: BUSINESS OVERVIEW               */}
      {/* ════════════════════════════════════════════ */}
      <SectionContainer id="overview" title="Business Overview" icon={Activity} badge={`${hasData ? 'Live' : 'Demo'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            { label: 'Total Sales', val: kpis.sales, prefix: '₹', icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500/20 to-teal-500/5' },
            { label: 'Visitors Today', val: kpis.visitors, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', gradient: 'from-blue-500/20 to-cyan-500/5' },
            { label: 'Transactions', val: kpis.transactions, icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500/20 to-violet-500/5' },
            { label: 'Top Branch', strVal: kpis.branch, icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/10', gradient: 'from-violet-500/20 to-purple-500/5' },
            { label: 'Health Score', val: kpis.health, suffix: '/100', icon: HeartPulse, color: 'text-rose-400', bg: 'bg-rose-500/10', gradient: 'from-rose-500/20 to-pink-500/5' },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`glass-card rounded-3xl p-5 relative group overflow-hidden border border-white/5 shadow-sm dark:shadow-none hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${s.gradient}`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-30 transition-transform group-hover:scale-110 group-hover:opacity-50 duration-500">
                <s.icon className={`w-14 h-14 ${s.color} opacity-20`} />
              </div>
              <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xs font-medium dark:text-slate-400 text-slate-500 mb-1">{s.label}</p>
              <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display tabular-nums">
                {s.strVal ? <span className="text-base">{s.strVal}</span> : <CountUp value={s.val || 0} prefix={s.prefix} suffix={s.suffix} />}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Main Trend Chart */}
        <Card className="mt-6 border border-slate-200 dark:border-white/5">
          <div className="mb-6">
            <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Live Demand Trend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visitor and sales distribution over time</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hasData ? derived?.tsData : mockVisitorTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--chart-grid)" opacity={0.3} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                <Tooltip content={<CustomTooltip explanation="Track the ebb and flow of your daily or historical data metrics." />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                {!hasData && <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />}
                {!hasData && <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={3} fill="url(#gradientVisitors)" />}
                <Area type="monotone" dataKey={hasData ? 'value' : 'sales'} stroke="#10b981" strokeWidth={3} fill={hasData ? 'url(#gradientVisitors)' : 'url(#gradientSales)'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </SectionContainer>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 2: CROWD INTELLIGENCE               */}
      {/* ════════════════════════════════════════════ */}
      <div className="mt-12">
        <SectionContainer id="crowd" title="Crowd Intelligence" icon={Users} badge="Live Monitor">
          {/* Quick Action: Demo Cameras */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/crowd')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" /> Open CCTV Monitoring
            </button>
            <span className="text-xs dark:text-slate-500 text-slate-400">View live demo cameras, crowd density, and branch traffic</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Heatmap */}
            <Card className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Weekly Footfall Heatmap</h3>
                <p className="text-xs text-slate-500">Darker squares indicate higher visitor traffic</p>
              </div>
              <div className="flex flex-col gap-1.5 h-[240px] justify-center">
                {crowdData.hourlyData.slice(3, 13).map((row, rI) => (
                  <div key={rI} className="flex gap-1.5 items-center">
                    <span className="w-10 text-[10px] text-slate-500 font-medium text-right pr-2">{row.hour}</span>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day, dI) => {
                      const val = (row as any)[day];
                      const intensity = Math.min(val / 650, 1);
                      return (
                        <div key={dI} className="flex-1 rounded-sm h-5 group relative cursor-pointer" style={{ backgroundColor: `rgba(99, 102, 241, ${intensity * 0.9 + 0.1})` }}>
                          <div className="absolute inset-x-0 bottom-full mb-1 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center whitespace-nowrap">
                            {val} visitors
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div className="flex gap-1.5 mt-1 border-t dark:border-white/10 pt-2">
                  <span className="w-10" />
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="flex-1 text-center text-[10px] font-medium text-slate-500">{d}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Crowd Summary */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-20">
                  <Activity className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <p className="text-indigo-100 text-sm font-medium mb-1">Busiest Day</p>
                  <p className="text-3xl font-bold tracking-tight mb-4">{crowdData.busiestDay}</p>
                  <div className="flex items-center gap-2 text-sm bg-white/20 rounded-lg px-3 py-2 w-max backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Peak: {crowdData.peakHours.join(', ')}</span>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-4 h-4 text-emerald-500" /></div>
                  <p className="text-sm font-semibold dark:text-white text-slate-900">Avg Daily Visitors</p>
                </div>
                <h4 className="text-3xl font-bold dark:text-white text-slate-900 mt-2 font-display">
                  <CountUp value={crowdData.avgDailyVisitors} />
                </h4>
              </Card>
            </div>
          </div>
        </SectionContainer>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 3: PRODUCT INTELLIGENCE             */}
      {/* ════════════════════════════════════════════ */}
      <div className="mt-12">
        <SectionContainer id="products" title="Product Intelligence" icon={Package}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products Table */}
            <Card className="lg:col-span-2 overflow-hidden flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Top Performing Products</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Best sellers by volume</p>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-white/10 border-slate-200">
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Volume</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-white/5 divide-slate-100">
                    {(hasData ? [] : mockTopProducts).slice(0, 6).map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 text-sm font-medium dark:text-white text-slate-900">{p.name}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-medium dark:text-slate-300 text-slate-700 text-right tabular-nums">
                          {p.sales.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-xs font-bold ${p.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {p.trend > 0 ? '+' : ''}{p.trend}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Category Distribution */}
            <Card className="flex flex-col relative group">
              <div className="absolute top-4 right-4 animate-spin-slow opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="w-24 h-24 text-indigo-400" />
              </div>
              <div className="mb-4 relative z-10">
                <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Category Mix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Share by category</p>
              </div>
              <div className="flex-1 w-full flex items-center justify-center min-h-[200px] relative z-10">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={hasData ? derived?.categoryData : mockCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                      {(hasData ? derived?.categoryData ?? [] : mockCategoryData).map((e: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={e.color || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip explanation="Share of units sold or value by category." />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Product Associations */}
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Frequently Bought Together</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topAssociations.map((rel, i) => (
                <div key={i} className="p-4 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold dark:text-white text-slate-900">{rel.source}</span>
                    <span className="text-xs dark:text-slate-500 text-slate-400">+</span>
                    <span className="text-sm font-bold text-purple-400">{rel.target}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="dark:text-slate-400 text-slate-500">Strength</span>
                    <span className="font-bold text-emerald-400">{(rel.strength * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 dark:bg-white/10 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400" style={{ width: `${rel.strength * 100}%` }} />
                  </div>
                  <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-2">{rel.coPurchaseCount} co-purchases</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl dark:bg-purple-500/5 bg-purple-50 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs dark:text-purple-300 text-purple-700 leading-relaxed">
                  <strong>AI Suggestion:</strong> Customers buying <span className="font-bold">Shirts</span> often buy <span className="font-bold">Belts</span>. Consider placing belts closer to the shirt section to increase cross-selling by an estimated 15%.
                </p>
              </div>
            </div>
          </Card>
        </SectionContainer>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 4: BRANCH PERFORMANCE               */}
      {/* ════════════════════════════════════════════ */}
      <div className="mt-12">
        <SectionContainer id="branches" title="Branch Performance" icon={Building2} defaultOpen={false}>
          {/* Branch Selector */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'].map(b => (
              <button key={b} onClick={() => setBranchSelector(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${branchSelector === b
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:bg-white/10 hover:bg-slate-200'
                }`}>
                {b}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Revenue by Branch</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={filteredBranchPerf} layout="vertical" margin={{ left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" opacity={0.3} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={formatINR} />
                  <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip explanation="Compare performance across your top locations." />} />
                  <Bar dataKey="sales" radius={[0, 6, 6, 0]} maxBarSize={30}>
                    {filteredBranchPerf?.map((_: any, i: number) => (
                      <Cell key={i} fill={`hsl(${250 + i * 15}, 80%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight">Weekly Growth vs Target</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={mockWeeklyGrowth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--chart-grid)" opacity={0.3} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `₹${v/100000}L`} />
                  <Tooltip content={<CustomTooltip explanation="Actual revenue vs projected target across weeks." />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#gradientRev)" />
                  <Area type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Branch Rankings */}
          <Card>
            <h3 className="text-lg font-bold dark:text-white text-slate-900 tracking-tight mb-4">Branch Rankings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockBranchPerf.slice(0, 4).map((branch, i) => (
                <div key={branch.name} className="p-4 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200 hover:border-primary-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold dark:text-slate-400 text-slate-500">#{i + 1}</span>
                    <span className="text-xs font-bold text-amber-400">★ {branch.rating}</span>
                  </div>
                  <h4 className="text-sm font-bold dark:text-white text-slate-900 mb-1">{branch.name}</h4>
                  <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-500">
                    <span>{formatINR(branch.sales)}</span>
                    <span>{branch.visitors.toLocaleString()} visitors</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </SectionContainer>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 5: AI BUSINESS INSIGHTS             */}
      {/* ════════════════════════════════════════════ */}
      <div className="mt-12">
        <SectionContainer id="insights" title="AI Business Insights" icon={Sparkles}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Peak Shopping Hours', desc: 'Customer traffic spikes 40% between 5-8 PM. Consider adding 2 more staff members during these hours for faster checkout.', tag: 'Staffing', icon: Clock, border: 'border-l-4 border-blue-500', iconColor: 'text-blue-400' },
              { title: 'Product Bundle Opportunity', desc: 'Customers buying "Tea" frequently also buy "Biscuits". Create a combo pack to boost sales by an estimated 15%.', tag: 'Products', icon: Package, border: 'border-l-4 border-purple-500', iconColor: 'text-purple-400' },
              { title: 'Store Layout Optimization', desc: 'Heatmap analysis shows dairy aisle gets 60% less traffic. Move closer to entrance for maximum visibility.', tag: 'Layout', icon: MapPin, border: 'border-l-4 border-emerald-500', iconColor: 'text-emerald-400' },
              { title: 'Branch Expansion Suggestion', desc: 'Ahmedabad shows high demand with low competition. AI score: 92/100. Consider opening a new branch there.', tag: 'Expansion', icon: Building2, border: 'border-l-4 border-amber-500', iconColor: 'text-amber-400' },
              { title: 'Staff Schedule Optimization', desc: 'Weekday mornings are overstaffed by 15%. Reallocate 3 staff to evening shifts for better customer coverage.', tag: 'Efficiency', icon: UserCheck, border: 'border-l-4 border-cyan-500', iconColor: 'text-cyan-400' },
              { title: 'Seasonal Demand Alert', desc: 'Diwali is 45 days away. Based on last year, electronics sales spike 3.2x. Pre-stock iPhone, Samsung, and MacBook.', tag: 'Forecast', icon: TrendingUp, border: 'border-l-4 border-rose-500', iconColor: 'text-rose-400' },
            ].map((insight, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card rounded-2xl p-6 ${insight.border} bg-white dark:bg-[#151c2f] shadow-sm hover:shadow-xl transition-all duration-300 cursor-default`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <insight.icon className={`w-4 h-4 ${insight.iconColor}`} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {insight.tag}
                  </span>
                </div>
                <h4 className="text-base font-bold dark:text-white text-slate-900 mb-2 leading-tight">{insight.title}</h4>
                <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">{insight.desc}</p>
              </motion.div>
            ))}
          </div>
        </SectionContainer>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 6: DATA & SYSTEM MANAGEMENT         */}
      {/* ════════════════════════════════════════════ */}
      <div className="mt-12">
        <SectionContainer id="settings" title="Data & System Management" icon={Settings} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Upload Business Dataset', desc: 'Upload CSV with sales, products, and transaction data', icon: Upload, route: '/upload', color: 'from-indigo-500 to-violet-500', iconBg: 'bg-indigo-500/10' },
              { title: 'CCTV Camera Monitoring', desc: 'View live camera feeds or use demo cameras', icon: Video, route: '/crowd', color: 'from-emerald-500 to-teal-500', iconBg: 'bg-emerald-500/10' },
              { title: 'Branch Management', desc: 'Manage store branches, locations, and performance', icon: Building2, route: '/branches', color: 'from-purple-500 to-fuchsia-500', iconBg: 'bg-purple-500/10' },
              { title: 'Staff Analytics', desc: 'Upload staff data for HR and productivity insights', icon: UserCheck, route: '/staff', color: 'from-cyan-500 to-sky-500', iconBg: 'bg-cyan-500/10' },
              { title: 'Store Heatmap', desc: 'Analyze in-store traffic zones and layout optimization', icon: MapPin, route: '/heatmap', color: 'from-rose-500 to-pink-500', iconBg: 'bg-rose-500/10' },
              { title: 'System Settings', desc: 'Configure preferences, theme, and language', icon: Settings, route: '/settings', color: 'from-slate-500 to-gray-500', iconBg: 'bg-slate-500/10' },
            ].map((item, i) => (
              <motion.div key={i}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass-card rounded-2xl p-5 border dark:border-white/5 border-slate-200 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => navigate(item.route)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 dark:text-white text-slate-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold dark:text-white text-slate-900 mb-1 group-hover:text-primary-400 transition-colors">{item.title}</h4>
                    <p className="text-xs dark:text-slate-400 text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionContainer>
      </div>

      {/* ── Floating AI Notification Bubble ── */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-slate-900 dark:bg-primary-600 text-white p-4 rounded-2xl shadow-2xl border border-white/10 cursor-pointer"
            onClick={() => setShowNotification(false)}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
              <Bell className="relative w-4 h-4 text-white" />
            </div>
            <div className="pr-2">
              <p className="text-sm font-bold">New Insight Detected!</p>
              <p className="text-xs text-slate-300/90 font-medium">Click to view staffing optimization</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Dashboard
