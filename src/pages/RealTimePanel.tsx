import React, { useEffect, useState } from 'react'
import { Activity, ShoppingBag, Users, AlertTriangle, Package, TrendingUp } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import ChartCard from '../components/ui/ChartCard'
import Badge from '../components/ui/Badge'

const generateLiveData = () => ({
  visitors: Math.floor(1150 + Math.random() * 200),
  sales: Math.floor(420000 + Math.random() * 50000),
  transactions: Math.floor(280 + Math.random() * 50),
  avgTime: Math.floor(14 + Math.random() * 6),
})

const liveAlerts = [
  { type: 'warning', message: 'Samsung Galaxy S24 stock critically low at Delhi branch', time: '2m ago', icon: Package },
  { type: 'info', message: 'Mumbai Andheri just reached ₹2.5L sales milestone', time: '5m ago', icon: TrendingUp },
  { type: 'danger', message: 'Staff shortage at Bangalore MG Road — 5 PM peak approaching', time: '8m ago', icon: Users },
  { type: 'success', message: 'Diwali campaign live — 18% traffic increase detected', time: '12m ago', icon: Activity },
  { type: 'warning', message: 'Organic Ghee out of stock at Pune branch', time: '15m ago', icon: AlertTriangle },
]

const RealTimePanel: React.FC = () => {
  const [data, setData] = useState(generateLiveData())
  const [sparkData, setSparkData] = useState<number[]>([800, 920, 1050, 980, 1100, 1200, 1150, 1300, 1250, 1400])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateLiveData())
      setSparkData(prev => [...prev.slice(1), Math.floor(1000 + Math.random() * 500)])
      setTick(t => t + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const maxSpark = Math.max(...sparkData)
  const minSpark = Math.min(...sparkData)

  return (
    <div className="space-y-7">
      <PageHeader
        title="Live Intelligence Panel"
        subtitle="Real-time store data updated every 3 seconds"
        icon={<Activity className="w-6 h-6 text-red-400" />}
        badge="LIVE"
        badgeColor="red"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Auto-refreshing
          </div>
        }
      />

      {/* Live KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'In-Store Now', value: data.visitors.toLocaleString('en-IN'), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Sales Today', value: `₹${(data.sales / 1000).toFixed(0)}K`, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Transactions', value: data.transactions, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Avg Time (min)', value: data.avgTime, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(card => (
          <div key={card.label} className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
            </div>
            <p className="text-xs dark:text-slate-400 text-slate-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-black font-display dark:text-white text-slate-900`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Live Visitor Sparkline */}
      <ChartCard title="Live Visitor Count" subtitle="Updating every 3 seconds">
        <div className="flex items-end gap-1 h-24">
          {sparkData.map((v, i) => {
            const height = ((v - minSpark) / (maxSpark - minSpark + 1)) * 100
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${Math.max(8, height)}%`,
                  backgroundColor: i === sparkData.length - 1
                    ? '#6366f1'
                    : `rgba(99, 102, 241, ${0.3 + (i / sparkData.length) * 0.4})`,
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs dark:text-slate-500 text-slate-400">
          <span>30s ago</span>
          <span className="font-medium dark:text-white text-slate-900">{sparkData[sparkData.length - 1]} now</span>
          <span>Live</span>
        </div>
      </ChartCard>

      {/* Live Branch Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Branch Live Status" subtitle="Real-time visitor counts by branch">
          <div className="space-y-3">
            {[
              { name: 'Mumbai - Andheri', visitors: 312 + Math.floor(tick), status: 'busy', capacity: 88 },
              { name: 'Delhi - CP', visitors: 278 + Math.floor(tick * 0.8), status: 'busy', capacity: 82 },
              { name: 'Bangalore - MG Road', visitors: 245 + Math.floor(tick * 0.7), status: 'normal', capacity: 68 },
              { name: 'Chennai - T Nagar', visitors: 198 + Math.floor(tick * 0.6), status: 'normal', capacity: 58 },
              { name: 'Hyderabad - Banjara', visitors: 156 + Math.floor(tick * 0.5), status: 'quiet', capacity: 42 },
              { name: 'Pune - FC Road', visitors: 134 + Math.floor(tick * 0.4), status: 'quiet', capacity: 35 },
            ].map(b => (
              <div key={b.name} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  b.status === 'busy' ? 'bg-red-400 animate-pulse' : b.status === 'normal' ? 'bg-amber-400 animate-pulse-soft' : 'bg-emerald-400'
                }`} />
                <span className="text-xs dark:text-white text-slate-900 flex-1 truncate">{b.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.status === 'busy' ? 'bg-red-500' : b.status === 'normal' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${b.capacity}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold dark:text-white text-slate-900 w-8">{b.visitors}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Live Alerts */}
        <ChartCard title="Live Alerts" subtitle="Auto-updating system notifications">
          <div className="space-y-3">
            {liveAlerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                alert.type === 'danger' ? 'dark:bg-red-500/5 bg-red-50 border-red-500/20'
                : alert.type === 'warning' ? 'dark:bg-amber-500/5 bg-amber-50 border-amber-500/20'
                : alert.type === 'success' ? 'dark:bg-emerald-500/5 bg-emerald-50 border-emerald-500/20'
                : 'dark:bg-blue-500/5 bg-blue-50 border-blue-500/20'
              }`}>
                <alert.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  alert.type === 'danger' ? 'text-red-400' : alert.type === 'warning' ? 'text-amber-400'
                  : alert.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs dark:text-slate-300 text-slate-700">{alert.message}</p>
                  <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

export default RealTimePanel
