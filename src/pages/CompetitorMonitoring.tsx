import React from 'react'
import { TrendingUp, DollarSign, AlertCircle, Lightbulb } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, LabelList
} from 'recharts'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { competitorData } from '../data/mockData'

const marketShareData = [
  { store: 'VOCiQ Stores', share: 28, color: '#6366f1' },
  { store: 'Amazon', share: 35, color: '#f97316' },
  { store: 'Flipkart', share: 22, color: '#eab308' },
  { store: 'Others', share: 15, color: '#64748b' },
]

const pricingTrendData = [
  { month: 'Jan', ours: 100, amazon: 97, flipkart: 98 },
  { month: 'Feb', ours: 100, amazon: 95, flipkart: 97 },
  { month: 'Mar', ours: 98, amazon: 94, flipkart: 96 },
  { month: 'Apr', ours: 97, amazon: 93, flipkart: 95 },
  { month: 'May', ours: 96, amazon: 93, flipkart: 95 },
  { month: 'Jun', ours: 95, amazon: 92, flipkart: 94 },
]

const CompetitorMonitoring: React.FC = () => {
  return (
    <div className="space-y-7">
      <PageHeader
        title="Competitor Monitoring"
        subtitle="Price benchmarking against Amazon, Flipkart, and other retailers"
        icon={<TrendingUp className="w-6 h-6 text-rose-400" />}
        badge="Live Data"
        badgeColor="red"
      />

      {/* Price Comparison Table */}
      <ChartCard title="Product Price Comparison" subtitle="Our prices vs Amazon and Flipkart">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Our Price</th>
                <th>Amazon</th>
                <th>Flipkart</th>
                <th>vs Amazon</th>
                <th>AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {competitorData.map(item => {
                const diffAmazon = item.ourPrice - item.amazon
                const pct = ((diffAmazon / item.amazon) * 100).toFixed(1)
                return (
                  <tr key={item.product}>
                    <td className="dark:text-white text-slate-900 font-medium">{item.product}</td>
                    <td className="dark:text-white text-slate-900 font-bold">₹{item.ourPrice.toLocaleString('en-IN')}</td>
                    <td className="dark:text-slate-300 text-slate-700">₹{item.amazon.toLocaleString('en-IN')}</td>
                    <td className="dark:text-slate-300 text-slate-700">₹{item.flipkart.toLocaleString('en-IN')}</td>
                    <td>
                      <Badge variant={diffAmazon > 0 ? 'danger' : 'success'}>
                        {diffAmazon > 0 ? '+' : ''}₹{Math.abs(diffAmazon).toLocaleString('en-IN')} ({pct}%)
                      </Badge>
                    </td>
                    <td className="dark:text-slate-400 text-slate-600 text-xs max-w-[200px]">{item.recommendation}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Price Index Trend" subtitle="Relative pricing (our store = 100 baseline)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pricingTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[88, 103]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="ours" name="VOCiQ" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="amazon" name="Amazon" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flipkart" name="Flipkart" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Market Share Analysis" subtitle="Estimated online + offline retail share">
          <div className="space-y-4 pt-4">
            {marketShareData.map(m => (
              <div key={m.store}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium dark:text-white text-slate-900">{m.store}</span>
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.share}%</span>
                </div>
                <div className="h-3 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.share}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 rounded-xl dark:bg-primary-500/5 bg-primary-50 border border-primary-500/20">
              <p className="text-xs dark:text-primary-300 text-primary-700">
                <Lightbulb className="w-3.5 h-3.5 inline mr-1" />
                <strong>AI Insight:</strong> Closing the 7% price gap on electronics with Amazon could increase our market share by an estimated 3-4%.
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

export default CompetitorMonitoring
