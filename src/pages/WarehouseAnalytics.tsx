import React from 'react'
import { Warehouse, AlertTriangle, Package, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, LineChart, Line
} from 'recharts'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { inventoryData } from '../data/mockData'

const stockTrendData = [
  { week: 'W1', iPhone: 120, Samsung: 85, Nike: 145, Levis: 60 },
  { week: 'W2', iPhone: 98, Samsung: 70, Nike: 128, Levis: 48 },
  { week: 'W3', iPhone: 80, Samsung: 52, Nike: 110, Levis: 32 },
  { week: 'W4', iPhone: 65, Samsung: 35, Nike: 90, Levis: 20 },
  { week: 'W5', iPhone: 45, Samsung: 18, Nike: 72, Levis: 12 },
  { week: 'W6', iPhone: 30, Samsung: 12, Nike: 58, Levis: 8 },
]

const demandForecastData = [
  { month: 'Apr', actual: 4200, forecast: 4100 },
  { month: 'May', actual: 3800, forecast: 3900 },
  { month: 'Jun', actual: 4500, forecast: 4400 },
  { month: 'Jul', actual: 5100, forecast: 4900 },
  { month: 'Aug', actual: 5600, forecast: 5400 },
  { month: 'Sep', actual: null, forecast: 5200 },
  { month: 'Oct', actual: null, forecast: 7800 },
  { month: 'Nov', actual: null, forecast: 9200 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name}:</span>
          <span className="text-white font-semibold">{e.value}</span>
        </div>
      ))}
    </div>
  )
}

const WarehouseAnalytics: React.FC = () => {
  const critical = inventoryData.filter(i => i.status === 'critical').length
  const low = inventoryData.filter(i => i.status === 'low').length
  const healthy = inventoryData.filter(i => i.status === 'healthy').length

  return (
    <div className="space-y-7">
      <PageHeader
        title="Warehouse Analytics"
        subtitle="Inventory levels, demand forecasting, and restock alerts across branches"
        icon={<Warehouse className="w-6 h-6 text-orange-400" />}
        badge={`${critical + low} Alerts`}
        badgeColor={critical > 0 ? 'red' : 'amber'}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total SKUs" value={248} icon={Package} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
        <StatCard title="Healthy Stock" value={healthy} icon={Package} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard title="Low Stock" value={low} icon={TrendingDown} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
        <StatCard title="Critical Alerts" value={critical} icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/10" />
      </div>

      {/* Inventory Alerts Table */}
      <ChartCard title="Inventory Status" subtitle="Stock levels across branches">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Branch</th>
                <th>Current Stock</th>
                <th>Min Required</th>
                <th>Stock Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map(item => {
                const pct = Math.min(100, (item.stock / item.minStock) * 100)
                return (
                  <tr key={`${item.product}-${item.branch}`}>
                    <td className="dark:text-white text-slate-900 font-medium">{item.product}</td>
                    <td className="dark:text-slate-300 text-slate-700">{item.branch}</td>
                    <td className={`font-bold ${item.status === 'critical' ? 'text-red-400' : item.status === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.stock}
                    </td>
                    <td className="dark:text-slate-400 text-slate-500">{item.minStock}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full dark:bg-white/10 bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct < 40 ? 'bg-red-500' : pct < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-xs dark:text-slate-400 text-slate-500 w-8">{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={item.status === 'critical' ? 'danger' : item.status === 'low' ? 'warning' : 'success'} dot>
                        {item.status === 'critical' ? 'Critical' : item.status === 'low' ? 'Low Stock' : 'Healthy'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Stock Depletion Trend" subtitle="Weekly inventory levels for key products" filters={['6W', '3M']}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="iPhone" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Samsung" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Nike" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Levis" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Demand Forecast" subtitle="Actual vs predicted (Oct–Nov peak season)" filters={['6M', '1Y']}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={demandForecastData}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#6366f1" fill="url(#actualGrad)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#10b981" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

export default WarehouseAnalytics
