import React from 'react'
import { Sparkles, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import { festivalData, festivalTrendData } from '../data/mockData'

const upcomingFestivals = [
  { name: 'Eid al-Fitr', date: 'Mar 31, 2025', daysLeft: 17, category: 'Fashion', growth: '+18%', color: 'text-emerald-400' },
  { name: 'Navratri', date: 'Oct 2, 2025', daysLeft: 202, category: 'Fashion & Beauty', growth: '+20%', color: 'text-violet-400' },
  { name: 'Diwali', date: 'Oct 20, 2025', daysLeft: 220, category: 'Electronics', growth: '+28%', color: 'text-amber-400' },
  { name: 'Christmas', date: 'Dec 25, 2025', daysLeft: 286, category: 'Gifts', growth: '+22%', color: 'text-red-400' },
]

const productSeasonData = [
  { festival: 'Diwali', electronics: 320, fashion: 180, gifts: 250, jewelry: 190 },
  { festival: 'Eid', electronics: 80, fashion: 320, gifts: 140, jewelry: 260 },
  { festival: 'Christmas', electronics: 280, fashion: 150, gifts: 380, jewelry: 120 },
  { festival: 'Holi', electronics: 40, fashion: 120, gifts: 90, jewelry: 60 },
  { festival: 'Navratri', electronics: 60, fashion: 280, gifts: 80, jewelry: 210 },
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
          <span className="text-white font-semibold">₹{(e.value / 10).toFixed(1)}L</span>
        </div>
      ))}
    </div>
  )
}

const FestivalDemand: React.FC = () => {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Festival Demand Prediction"
        subtitle="AI-powered sales forecasting for major Indian festivals"
        icon={<Sparkles className="w-6 h-6 text-amber-400" />}
        badge="Predictive AI"
        badgeColor="amber"
      />

      {/* Upcoming Festivals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {upcomingFestivals.map(f => (
          <div key={f.name} className="metric-card">
            <div className="flex items-start justify-between mb-3">
              <Calendar className="w-5 h-5 dark:text-slate-400 text-slate-500" />
              <Badge variant="info" size="sm">{f.daysLeft}d away</Badge>
            </div>
            <h3 className="font-bold dark:text-white text-slate-900 text-base">{f.name}</h3>
            <p className="text-xs dark:text-slate-400 text-slate-500 mb-2">{f.date}</p>
            <p className="text-xs dark:text-slate-400 text-slate-500">Top category: <span className="dark:text-white text-slate-900 font-medium">{f.category}</span></p>
            <p className={`text-sm font-bold mt-1 ${f.color}`}>Expected: {f.growth} growth</p>
          </div>
        ))}
      </div>

      {/* Festival Revenue Trend */}
      <ChartCard title="Festival Revenue Trend (Historical + Forecast)" subtitle="Multi-year sales during major festivals" filters={['All', 'Diwali', 'Eid', 'Christmas']}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={festivalTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/100000}L`} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              formatter={(v: any) => [`₹${(v / 100000).toFixed(1)}L`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            <Line type="monotone" dataKey="diwali" name="Diwali" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} strokeDasharray={festivalTrendData.findIndex(d => d.year === '2026 (P)') > -1 ? undefined : undefined} />
            <Line type="monotone" dataKey="eid" name="Eid al-Fitr" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
            <Line type="monotone" dataKey="christmas" name="Christmas" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
            <Line type="monotone" dataKey="holi" name="Holi" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 p-3 rounded-xl dark:bg-amber-500/5 bg-amber-50 border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
            <strong>2026 Forecast:</strong> Diwali projected at ₹62L (+21.6%), Christmas at ₹38L (+18.8%) based on 4-year trend analysis.
          </p>
        </div>
      </ChartCard>

      {/* Product Demand by Festival */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Product Category Demand by Festival" subtitle="Which categories peak during each festival">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productSeasonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="festival" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="electronics" name="Electronics" fill="#6366f1" stackId="a" />
              <Bar dataKey="fashion" name="Fashion" fill="#a855f7" stackId="a" />
              <Bar dataKey="gifts" name="Gifts" fill="#f59e0b" stackId="a" />
              <Bar dataKey="jewelry" name="Jewelry" fill="#ec4899" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Festival Demand Multipliers" subtitle="How much sales increase during festivals">
          <div className="space-y-4 pt-2">
            {festivalData.map(f => (
              <div key={f.festival}>
                <div className="flex justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-semibold dark:text-white text-slate-900">{f.festival}</span>
                    <span className="text-xs dark:text-slate-400 text-slate-500 ml-2">{f.month}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-400">{f.salesMultiplier}x</span>
                    <span className="text-xs dark:text-slate-400 text-slate-500 ml-1">multiplier</span>
                  </div>
                </div>
                <div className="h-3 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${(f.salesMultiplier / 3.5) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs dark:text-slate-500 text-slate-400">Top: {f.topCategory}</span>
                  <span className="text-xs text-emerald-400">+{f.predictedGrowth}% predicted</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

export default FestivalDemand
