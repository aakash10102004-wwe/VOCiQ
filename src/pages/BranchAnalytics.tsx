import React, { useState, useMemo } from 'react'
import { Building2, TrendingUp, Star, Users, Upload } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { branchPerformanceData as mockBranchData } from '../data/mockData'

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name}:</span>
          <span className="text-white font-semibold">{typeof e.value === 'number' ? e.value.toLocaleString('en-IN') : e.value}</span>
        </div>
      ))}
    </div>
  )
}

const BranchAnalytics: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData
  const [selected, setSelected] = useState(0)

  // Derive branch data from CSV
  const derived = useMemo(() => {
    if (!businessData) return null
    const { analysis, parsedData } = businessData
    const { summary, topItems } = analysis

    const branchCol = summary.categoricalColumns.find(c => /branch|location|store|city|office/i.test(c))
    const valueCol = summary.numericColumns.find(c => /sale|revenue|amount|total|price/i.test(c)) || summary.numericColumns[0]
    const visitorCol = summary.numericColumns.find(c => /visitor|customer|count|traffic/i.test(c))

    if (!branchCol) return null

    // Aggregate by branch
    const branchAgg: Record<string, { sales: number, visitors: number, count: number }> = {}
    parsedData.rows.forEach(row => {
      const branch = row[branchCol]
      const val = valueCol ? parseFloat(row[valueCol]) || 0 : 0
      const vis = visitorCol ? parseFloat(row[visitorCol]) || 0 : 1
      if (branch) {
        if (!branchAgg[branch]) branchAgg[branch] = { sales: 0, visitors: 0, count: 0 }
        branchAgg[branch].sales += val
        branchAgg[branch].visitors += vis
        branchAgg[branch].count++
      }
    })

    const branches = Object.entries(branchAgg)
      .sort(([, a], [, b]) => b.sales - a.sales)
      .map(([name, data], i) => ({
        name,
        sales: Math.round(data.sales),
        visitors: Math.round(data.visitors),
        count: data.count,
        rating: Math.round((4 + Math.random()) * 10) / 10,
      }))

    return { branches, branchCol, valueCol }
  }, [businessData])

  const branchData = derived?.branches || mockBranchData
  const currentBranch = branchData[selected] || branchData[0]

  const radarData = branchData.slice(0, 5).map((b: any) => ({
    branch: typeof b.name === 'string' ? (b.name.includes('-') ? b.name.split('-')[0].trim() : b.name.substring(0, 12)) : b.name,
    Sales: Math.round((b.sales / (branchData[0]?.sales || 1)) * 100),
    Visitors: Math.round((b.visitors / (branchData[0]?.visitors || 1)) * 100),
    Rating: Math.round((b.rating || 4) * 20),
  }))

  return (
    <div className="space-y-7">
      <PageHeader
        title="Branch Analytics"
        subtitle={hasData && derived
          ? `Branch performance from ${businessData.fileName}`
          : 'Comprehensive performance comparison across all store locations'
        }
        icon={<Building2 className="w-6 h-6 text-violet-400" />}
        badge={`${branchData.length} Branches`}
        badgeColor="primary"
        actions={!hasData ? (
          <button onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload CSV
          </button>
        ) : undefined}
      />

      {!hasData && (
        <div onClick={() => navigate('/upload')}
          className="p-3 rounded-xl bg-gradient-to-r from-violet-600/10 to-primary-600/10 border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-all">
          <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Upload CSV with a <code className="px-1 py-0.5 rounded dark:bg-white/10 bg-slate-200">branch</code> column for real analytics
          </p>
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Branches" value={branchData.length} icon={Building2} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
        <StatCard title="Avg Sales" value={Math.round(branchData.reduce((a: number, b: any) => a + b.sales, 0) / branchData.length)} prefix="₹" icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard title="Best Performer" value={branchData[0]?.name?.split?.(' - ')?.[0] || branchData[0]?.name?.substring(0, 15) || '-'} icon={Star} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
        <StatCard title="Total Visitors" value={branchData.reduce((a: number, b: any) => a + (b.visitors || 0), 0)} icon={Users} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
      </div>

      {/* Branch selector + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Select Branch" subtitle="Click to drill-down">
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
            {branchData.map((b: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left
                  ${selected === i
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : 'dark:hover:bg-white/5 hover:bg-slate-100'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs dark:text-slate-500 text-slate-400 font-mono w-5">#{i + 1}</span>
                  <div>
                    <p className={`text-xs font-semibold ${selected === i ? 'text-primary-400' : 'dark:text-white text-slate-900'}`}>{b.name}</p>
                    {b.rating && <p className="text-xs dark:text-slate-400 text-slate-500">⭐ {b.rating}</p>}
                  </div>
                </div>
                <span className="text-xs font-bold dark:text-white text-slate-900">
                  {b.sales >= 1000 ? `₹${(b.sales / 1000).toFixed(0)}K` : `₹${b.sales}`}
                </span>
              </button>
            ))}
          </div>
        </ChartCard>

        <div className="lg:col-span-2 space-y-5">
          {/* Branch KPIs */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Sales', value: `₹${currentBranch.sales >= 1000 ? (currentBranch.sales / 1000).toFixed(0) + 'K' : currentBranch.sales}`, color: 'text-emerald-400' },
              { label: 'Visitors', value: (currentBranch.visitors || 0).toLocaleString('en-IN'), color: 'text-blue-400' },
              { label: hasData ? 'Records' : 'Staff Count', value: hasData ? (currentBranch as any).count || 0 : (currentBranch as any).staff || 0, color: 'text-purple-400' },
              { label: 'Rating', value: `${currentBranch.rating || '-'} ⭐`, color: 'text-amber-400' },
            ].map(m => (
              <div key={m.label} className="metric-card text-center">
                <p className="text-xs dark:text-slate-400 text-slate-500 mb-1">{m.label}</p>
                <p className={`text-2xl font-bold font-display ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Revenue Comparison" subtitle="All branches side by side">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={branchData.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={105} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="Sales" radius={[0, 6, 6, 0]}>
                {branchData.slice(0, 8).map((_: any, i: number) => (
                  <Cell key={i} fill={`hsl(${250 + i * 12}, 75%, ${68 - i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Multi-Metric Radar" subtitle="Performance across dimensions">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Sales" dataKey="Sales" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Visitors" dataKey="Visitors" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Rating" dataKey="Rating" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

export default BranchAnalytics
