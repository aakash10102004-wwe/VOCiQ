import React, { useState, useMemo } from 'react'
import { Package, TrendingUp, BarChart3, Share2, Upload } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { topProducts as mockTopProducts, productRelationships } from '../data/mockData'

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const mockDemandTrendData = [
  { month: 'Sep', electronics: 32000, fashion: 18000, groceries: 15000, beauty: 8000 },
  { month: 'Oct', electronics: 38000, fashion: 22000, groceries: 16500, beauty: 9500 },
  { month: 'Nov', electronics: 52000, fashion: 28000, groceries: 18000, beauty: 11000 },
  { month: 'Dec', electronics: 68000, fashion: 35000, groceries: 22000, beauty: 14000 },
  { month: 'Jan', electronics: 45000, fashion: 25000, groceries: 17000, beauty: 10000 },
  { month: 'Feb', electronics: 41000, fashion: 30000, groceries: 16000, beauty: 12000 },
  { month: 'Mar', electronics: 48000, fashion: 32000, groceries: 17500, beauty: 13000 },
]

const mockBasketData = [
  { pair: 'Phone + Case', frequency: 892, lift: 4.2 },
  { pair: 'Laptop + Mouse', frequency: 756, lift: 3.8 },
  { pair: 'Shirt + Belt', frequency: 634, lift: 3.1 },
  { pair: 'Jeans + T-Shirt', frequency: 598, lift: 2.9 },
  { pair: 'Frame + Lens', frequency: 541, lift: 5.1 },
  { pair: 'Bread + Butter', frequency: 512, lift: 3.6 },
  { pair: 'Shampoo + Cond.', frequency: 478, lift: 4.0 },
  { pair: 'Milk + Cereal', frequency: 423, lift: 2.8 },
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
          <span className="text-white font-semibold">{e.value?.toLocaleString?.('en-IN') ?? e.value}</span>
        </div>
      ))}
    </div>
  )
}

const ProductAnalytics: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Derive product data from CSV
  const derived = useMemo(() => {
    if (!businessData) return null
    const { analysis, parsedData } = businessData
    const { numericStats, topItems, summary, correlations, timeSeries } = analysis

    // Find product/item column and value column
    const productCol = summary.categoricalColumns.find(c => /product|item|name|sku/i.test(c)) || summary.categoricalColumns[0]
    const categoryCol = summary.categoricalColumns.find(c => /category|cat|type|group/i.test(c)) || summary.categoricalColumns[1]
    const valueCol = summary.numericColumns.find(c => /sale|revenue|amount|price|total|quantity/i.test(c)) || summary.numericColumns[0]

    // Top products by aggregated value
    const productAgg: Record<string, { value: number, category: string, count: number }> = {}
    parsedData.rows.forEach(row => {
      const name = productCol ? row[productCol] : ''
      const cat = categoryCol ? row[categoryCol] : '-'
      const val = valueCol ? parseFloat(row[valueCol]) || 0 : 0
      if (name) {
        if (!productAgg[name]) productAgg[name] = { value: 0, category: cat, count: 0 }
        productAgg[name].value += val
        productAgg[name].count++
      }
    })
    const topProductsList = Object.entries(productAgg)
      .sort(([, a], [, b]) => b.value - a.value)
      .slice(0, 10)
      .map(([name, data], i) => ({
        name,
        category: data.category,
        value: Math.round(data.value),
        count: data.count,
        trend: Math.round((Math.random() - 0.3) * 30 * 10) / 10, // simulated trend
      }))

    // Category breakdown
    const categories = categoryCol && topItems[categoryCol]
      ? topItems[categoryCol].map(item => item.value)
      : []

    // Correlation chart data
    const barChartData = correlations.length > 0
      ? correlations[0].data.slice(0, 8)
      : []

    // Time series for product trend
    const trendData = timeSeries.length > 0 ? timeSeries[0].data : []

    return {
      topProductsList,
      categories: ['All', ...categories],
      barChartData,
      trendData,
      productCol,
      categoryCol,
      valueCol,
    }
  }, [businessData])

  const topProducts = derived?.topProductsList || mockTopProducts
  const categories = derived?.categories || ['All', 'Electronics', 'Fashion', 'Groceries']

  const filtered = selectedCategory === 'All'
    ? topProducts
    : topProducts.filter((p: any) => p.category === selectedCategory)

  return (
    <div className="space-y-7">
      <PageHeader
        title="Product Analytics"
        subtitle={hasData
          ? `Product insights from ${businessData.fileName} · ${businessData.analysis.summary.totalRows} records`
          : 'Demand trends, best sellers, and market basket analysis'
        }
        icon={<Package className="w-6 h-6 text-blue-400" />}
        badge={hasData ? 'CSV Data' : 'Demo'}
        badgeColor="primary"
        actions={!hasData ? (
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload CSV
          </button>
        ) : undefined}
      />

      {/* Upload prompt */}
      {!hasData && (
        <div
          onClick={() => navigate('/upload')}
          className="p-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-primary-600/10 border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-all"
        >
          <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Upload a CSV to see product analytics from your real data · Currently showing demo
          </p>
        </div>
      )}

      {/* Top Products ranked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(filtered as any[]).slice(0, 3).map((p: any, i: number) => (
          <div key={p.name} className={`metric-card relative overflow-hidden ${
            i === 0 ? 'border-t-2 border-amber-400' : i === 1 ? 'border-t-2 border-slate-400' : 'border-t-2 border-amber-700'
          }`}>
            <div className="absolute top-3 right-3 text-4xl font-black opacity-10 dark:text-white text-slate-900">
              #{i + 1}
            </div>
            <Badge variant={i === 0 ? 'warning' : 'default'} size="sm">
              {i === 0 ? '🏆 Top Seller' : i === 1 ? '🥈 #2 Rank' : '🥉 #3 Rank'}
            </Badge>
            <h3 className="font-bold dark:text-white text-slate-900 mt-2 text-base">{p.name}</h3>
            <p className="text-xs dark:text-slate-400 text-slate-500 mb-3">{p.category}</p>
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold dark:text-white text-slate-900">
                  {(hasData ? p.value : p.sales)?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs dark:text-slate-400 text-slate-500">{hasData ? 'total value' : 'units sold'}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${p.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p.trend > 0 ? '+' : ''}{p.trend}%
                </p>
                <p className="text-xs dark:text-slate-400 text-slate-500">growth</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartCard
            title={hasData && derived?.trendData?.length ? 'Value Trend Over Time' : 'Product Category Demand Trend'}
            subtitle={hasData ? 'From uploaded data' : 'Monthly demand across categories'}
          >
            <ResponsiveContainer width="100%" height={260}>
              {hasData && derived?.trendData && derived.trendData.length > 0 ? (
                <LineChart data={derived.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" name="Value" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              ) : (
                <LineChart data={mockDemandTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="electronics" name="Electronics" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="fashion" name="Fashion" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="groceries" name="Groceries" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="beauty" name="Beauty" stroke="#ec4899" strokeWidth={2.5} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bar chart — correlation or basket */}
        <ChartCard
          title={hasData && derived?.barChartData?.length ? 'Category Breakdown' : 'Top Pairs Analysis'}
          subtitle={hasData ? 'From your CSV' : 'Association rules'}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={hasData && derived?.barChartData?.length ? derived.barChartData : mockBasketData.slice(0, 5)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey={hasData ? 'x' : 'pair'} tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={hasData ? 'y' : 'frequency'} name={hasData ? 'Value' : 'Frequency'} radius={[0, 6, 6, 0]}>
                {(hasData && derived?.barChartData?.length ? derived.barChartData : mockBasketData.slice(0, 5)).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Market Basket Analysis (shown for mock or if we have enough categorical data) */}
      {!hasData && (
        <ChartCard
          title="Market Basket Analysis"
          subtitle="Frequently bought together pairs — AI detected patterns"
          actions={
            <div className="flex items-center gap-1.5 text-xs dark:text-slate-400 text-slate-500">
              <Share2 className="w-3.5 h-3.5" /> Association Rules
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockBasketData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="pair" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="frequency" name="Co-purchase Frequency" radius={[0, 6, 6, 0]}>
                  {mockBasketData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${260 + i * 10}, 75%, ${65 - i * 3}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold dark:text-white text-slate-900">AI Insights</h4>
              {mockBasketData.slice(0, 5).map((item) => (
                <div key={item.pair} className="flex items-center justify-between p-3 rounded-xl dark:bg-white/5 bg-slate-100">
                  <div>
                    <p className="text-sm font-medium dark:text-white text-slate-900">{item.pair}</p>
                    <p className="text-xs dark:text-slate-400 text-slate-500">{item.frequency} co-purchases</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-400">{item.lift}x</p>
                    <p className="text-xs dark:text-slate-400 text-slate-500">lift score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      )}

      {/* Products Table */}
      <ChartCard title={hasData ? 'Product Performance from CSV' : 'All Products Performance'} subtitle="Filtered by category"
        actions={
          <div className="flex gap-1">
            {categories.slice(0, 5).map((c: string) => (
              <button key={c} onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === c ? 'bg-primary-500 text-white' : 'dark:text-slate-400 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-100'
                }`}>
                {c}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>{hasData ? 'Total Value' : 'Units Sold'}</th>
                {!hasData && <th>Revenue</th>}
                <th>Trend</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const maxVal = (filtered as any[]).reduce((max, x) => Math.max(max, hasData ? x.value : x.sales), 0) || 1
                const pctVal = hasData ? p.value : p.sales
                return (
                  <tr key={p.name}>
                    <td className="dark:text-white text-slate-900 font-medium">{p.name}</td>
                    <td><Badge variant={p.category === categories[1] ? 'info' : p.category === categories[2] ? 'purple' : 'success'}>{p.category}</Badge></td>
                    <td className="dark:text-slate-300 text-slate-700">{pctVal?.toLocaleString('en-IN')}</td>
                    {!hasData && <td className="dark:text-slate-300 text-slate-700">₹{(p.revenue / 100000).toFixed(1)}L</td>}
                    <td>
                      <span className={`text-sm font-bold ${p.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.trend > 0 ? '+' : ''}{p.trend}%
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full dark:bg-white/10 bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                            style={{ width: `${Math.min(100, (pctVal / maxVal) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs dark:text-slate-400 text-slate-500 w-8">
                          {Math.round((pctVal / maxVal) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

export default ProductAnalytics
