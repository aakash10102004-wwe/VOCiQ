import React, { useState, useMemo } from 'react'
import {
  Star, FileText, Download, TrendingUp, BarChart2, Calendar,
  Upload, PieChart as PieIcon, Table, FileBarChart, Zap
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import { useData } from '../context/DataContext'
import { monthlyRevenueData } from '../data/mockData'
import { generatePDFReport } from '../utils/pdfReportGenerator'

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const formatINR = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${value.toFixed(0)}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name}:</span>
          <span className="text-white font-semibold">
            {typeof e.value === 'number' ? e.value.toLocaleString('en-IN') : e.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const PremiumReports: React.FC = () => {
  const { businessData, staffData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData
  const [tab, setTab] = useState<'summary' | 'detailed' | 'forecast'>('summary')
  const [downloading, setDownloading] = useState(false)

  // Derive comprehensive report data from CSV
  const report = useMemo(() => {
    if (!businessData) return null
    const { analysis, parsedData } = businessData
    const { summary, numericStats, topItems, correlations, timeSeries } = analysis

    // Identify key columns
    const valueCol = summary.numericColumns.find(c => /sale|revenue|amount|total|price/i.test(c)) || summary.numericColumns[0]
    const quantityCol = summary.numericColumns.find(c => /qty|quantity|count|units/i.test(c))
    const categoryCol = summary.categoricalColumns.find(c => /category|cat|type|group/i.test(c)) || summary.categoricalColumns[0]
    const productCol = summary.categoricalColumns.find(c => /product|item|name|sku/i.test(c)) || summary.categoricalColumns[1] || summary.categoricalColumns[0]
    const branchCol = summary.categoricalColumns.find(c => /branch|location|store|city/i.test(c))

    // Overall KPIs
    const stats = valueCol ? numericStats[valueCol] : null
    const totalRevenue = stats?.sum || 0
    const avgTransaction = stats?.mean || 0
    const maxTransaction = stats?.max || 0
    const minTransaction = stats?.min || 0
    const transactionCount = summary.totalRows

    // Quantity stats
    const qtyStats = quantityCol ? numericStats[quantityCol] : null
    const totalQuantity = qtyStats?.sum || 0

    // Category breakdown
    const catBreakdown = categoryCol && topItems[categoryCol]
      ? topItems[categoryCol].map((item, i) => {
          // Calculate revenue per category
          let catRevenue = 0
          parsedData.rows.forEach(row => {
            if (row[categoryCol] === item.value && valueCol) {
              catRevenue += parseFloat(row[valueCol]) || 0
            }
          })
          return {
            name: item.value,
            count: item.count,
            revenue: Math.round(catRevenue),
            share: Math.round(catRevenue / (totalRevenue || 1) * 100),
            color: COLORS[i % COLORS.length],
          }
        })
      : []

    // Top products by revenue
    const productAgg: Record<string, { revenue: number, qty: number, count: number, category: string }> = {}
    parsedData.rows.forEach(row => {
      const name = productCol ? row[productCol] : ''
      const val = valueCol ? parseFloat(row[valueCol]) || 0 : 0
      const qty = quantityCol ? parseFloat(row[quantityCol]) || 0 : 0
      const cat = categoryCol ? row[categoryCol] || '-' : '-'
      if (name) {
        if (!productAgg[name]) productAgg[name] = { revenue: 0, qty: 0, count: 0, category: cat }
        productAgg[name].revenue += val
        productAgg[name].qty += qty
        productAgg[name].count++
      }
    })
    const topProducts = Object.entries(productAgg)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 15)
      .map(([name, data]) => ({
        name,
        category: data.category,
        revenue: Math.round(data.revenue),
        quantity: Math.round(data.qty),
        transactions: data.count,
        avgPrice: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
      }))

    // Branch breakdown
    const branchBreakdown = branchCol && topItems[branchCol]
      ? topItems[branchCol].map((item, i) => {
          let branchRev = 0
          parsedData.rows.forEach(row => {
            if (row[branchCol] === item.value && valueCol) {
              branchRev += parseFloat(row[valueCol]) || 0
            }
          })
          return {
            name: item.value,
            transactions: item.count,
            revenue: Math.round(branchRev),
            avgTransaction: item.count > 0 ? Math.round(branchRev / item.count) : 0,
            color: COLORS[i % COLORS.length],
          }
        })
      : []

    // Time series data
    const tsData = timeSeries.length > 0
      ? timeSeries[0].data.map(d => ({ period: d.date, value: Math.round(d.value) }))
      : []

    // Numeric column summaries for detailed report
    const numericSummaries = summary.numericColumns.map(col => ({
      column: col,
      min: numericStats[col]?.min || 0,
      max: numericStats[col]?.max || 0,
      mean: Math.round((numericStats[col]?.mean || 0) * 100) / 100,
      sum: Math.round(numericStats[col]?.sum || 0),
    }))

    // Data for table export
    const tableHeaders = parsedData.headers
    const tableRows = parsedData.rows.slice(0, 100) // First 100 rows for report

    return {
      totalRevenue, avgTransaction, maxTransaction, minTransaction,
      transactionCount, totalQuantity,
      catBreakdown, topProducts, branchBreakdown, tsData,
      numericSummaries, tableHeaders, tableRows,
      fileName: businessData.fileName,
      uploadedAt: businessData.uploadedAt,
      columnCount: summary.totalColumns,
      valueCol, categoryCol, productCol, branchCol,
    }
  }, [businessData])

  // REAL PDF DOWNLOAD using static import utility
  const handleDownload = () => {
    setDownloading(true)
    try {
      generatePDFReport(businessData, staffData)
    } catch (err: any) {
      console.error('PDF generation error:', err)
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'))
    } finally {
      setDownloading(false)
    }
  }

  // Mock data for when no CSV uploaded
  const mockYearlyData = [
    { year: '2021', revenue: 32000000, branches: 4 },
    { year: '2022', revenue: 48000000, branches: 6 },
    { year: '2023', revenue: 68000000, branches: 8 },
    { year: '2024', revenue: 86000000, branches: 10 },
    { year: '2025', revenue: 112000000, branches: 12 },
    { year: '2026 (F)', revenue: 145000000, branches: 15 },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        title="Premium Reports"
        subtitle={hasData
          ? `Comprehensive report from ${report?.fileName} · ${report?.transactionCount.toLocaleString('en-IN')} records`
          : 'Deep analytics, multi-year forecasts, and downloadable PDF reports'
        }
        icon={<Star className="w-6 h-6 text-amber-400" />}
        badge={hasData ? 'CSV Data' : 'Demo'}
        badgeColor="amber"
        actions={
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-amber-500/30"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
            {downloading ? 'Generating PDF…' : 'Download PDF Report'}
          </button>
        }
      />

      {/* Upload prompt */}
      {!hasData && (
        <div
          onClick={() => navigate('/upload')}
          className="p-4 rounded-xl bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-primary-600/10 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-slate-900">Upload your data for real PDF reports</p>
              <p className="text-xs dark:text-slate-400 text-slate-500">Currently showing demo data · Upload CSV to generate downloadable reports from your actual business data</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex gap-2">
        {([
          { key: 'summary' as const, label: 'Summary', icon: FileBarChart },
          { key: 'detailed' as const, label: 'Detailed', icon: Table },
          { key: 'forecast' as const, label: hasData ? 'Trends' : 'Forecast', icon: TrendingUp },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/30'
                : 'dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:bg-white/10 hover:bg-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* === SUMMARY TAB === */}
      {tab === 'summary' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Revenue"
              value={report?.totalRevenue || 86000000}
              prefix="₹"
              icon={TrendingUp}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10"
            />
            <StatCard
              title="Transactions"
              value={report?.transactionCount || 12450}
              icon={FileText}
              iconColor="text-blue-400"
              iconBg="bg-blue-500/10"
            />
            <StatCard
              title="Avg Transaction"
              value={Math.round(report?.avgTransaction || 6907)}
              prefix="₹"
              icon={BarChart2}
              iconColor="text-primary-400"
              iconBg="bg-primary-500/10"
            />
            <StatCard
              title="Max Transaction"
              value={Math.round(report?.maxTransaction || 185000)}
              prefix="₹"
              icon={Star}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10"
            />
          </div>

          {/* Category + Time chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Time Series or Revenue Chart */}
            <div className="lg:col-span-2">
              <ChartCard
                title={hasData && report?.tsData?.length ? 'Revenue Trend Over Time' : 'Monthly Revenue, Expenses & Profit'}
                subtitle={hasData ? `From ${report?.fileName}` : 'Full fiscal year (demo)'}
              >
                <ResponsiveContainer width="100%" height={280}>
                  {hasData && report?.tsData && report.tsData.length > 0 ? (
                    <AreaChart data={report.tsData}>
                      <defs>
                        <linearGradient id="reportRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" name="Revenue" stroke="#6366f1" fill="url(#reportRevGrad)" strokeWidth={2.5} dot={false} />
                    </AreaChart>
                  ) : (
                    <AreaChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/100000}L`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revG)" strokeWidth={2.5} dot={false} />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                      <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" fill="url(#profG)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Category Pie */}
            <ChartCard
              title={hasData ? 'Category Revenue Share' : 'Revenue by Category'}
              subtitle={hasData ? 'From uploaded data' : 'Demo breakdown'}
            >
              {hasData && report?.catBreakdown && report.catBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={report.catBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="revenue">
                        {report.catBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [formatINR(value), 'Revenue']}
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {report.catBreakdown.slice(0, 6).map(c => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="dark:text-slate-400 text-slate-500 truncate max-w-[100px]">{c.name}</span>
                        </div>
                        <span className="dark:text-white text-slate-900 font-semibold">{c.share}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-sm dark:text-slate-400 text-slate-500">
                  Upload CSV to see category breakdown
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}

      {/* === DETAILED TAB === */}
      {tab === 'detailed' && (
        <>
          {/* Top Products Table */}
          {hasData && report?.topProducts && report.topProducts.length > 0 ? (
            <>
              <ChartCard
                title="Top Products / Items by Revenue"
                subtitle={`From ${report.fileName}`}
                actions={<Badge variant="success">{report.topProducts.length} items</Badge>}
              >
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Transactions</th>
                        <th>Revenue</th>
                        <th>Avg Price</th>
                        <th>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topProducts.map((p, i) => (
                        <tr key={p.name}>
                          <td className="dark:text-slate-500 text-slate-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                          <td className="dark:text-white text-slate-900 font-medium">{p.name}</td>
                          <td><Badge variant={i % 3 === 0 ? 'info' : i % 3 === 1 ? 'purple' : 'success'}>{p.category}</Badge></td>
                          <td className="dark:text-slate-300 text-slate-700">{p.transactions.toLocaleString('en-IN')}</td>
                          <td className="dark:text-white text-slate-900 font-semibold">{formatINR(p.revenue)}</td>
                          <td className="dark:text-slate-300 text-slate-700">{formatINR(p.avgPrice)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full dark:bg-white/10 bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                                  style={{ width: `${Math.min(100, (p.revenue / (report.topProducts[0]?.revenue || 1)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs dark:text-slate-400 text-slate-500 w-8">
                                {Math.round((p.revenue / (report.totalRevenue || 1)) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>

              {/* Branch performance */}
              {report.branchBreakdown.length > 0 && (
                <ChartCard title="Branch Performance" subtitle="Revenue by branch">
                  <ResponsiveContainer width="100%" height={Math.max(200, report.branchBreakdown.length * 38)}>
                    <BarChart data={report.branchBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={v => formatINR(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                        {report.branchBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Numeric Stats */}
              <ChartCard title="Numeric Column Statistics" subtitle="Min, max, mean, and totals for all numeric columns">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Mean</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.numericSummaries.map(s => (
                        <tr key={s.column}>
                          <td className="dark:text-white text-slate-900 font-medium font-mono text-xs">{s.column}</td>
                          <td className="dark:text-slate-300 text-slate-700">{s.min.toLocaleString('en-IN')}</td>
                          <td className="dark:text-slate-300 text-slate-700">{s.max.toLocaleString('en-IN')}</td>
                          <td className="dark:text-slate-300 text-slate-700">{s.mean.toLocaleString('en-IN')}</td>
                          <td className="dark:text-white text-slate-900 font-semibold">{s.sum.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </>
          ) : (
            <div className="text-center py-16 metric-card">
              <FileText className="w-12 h-12 dark:text-slate-600 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold dark:text-white text-slate-900 mb-2">No data for detailed report</p>
              <p className="text-sm dark:text-slate-400 text-slate-500 mb-4">Upload a CSV to see product breakdown, branch analysis, and full statistics</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload CSV
              </button>
            </div>
          )}
        </>
      )}

      {/* === FORECAST/TRENDS TAB === */}
      {tab === 'forecast' && (
        <div className="space-y-5">
          {hasData && report?.catBreakdown && report.catBreakdown.length > 0 ? (
            <>
              {/* Category Revenue Bar Chart */}
              <ChartCard title="Category Revenue Comparison" subtitle="From uploaded data">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={report.catBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                      {report.catBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Data Insights */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 to-purple-600/10 border border-primary-500/20">
                <p className="text-sm font-semibold dark:text-white text-slate-900 mb-2">📊 AI Data Insights</p>
                <div className="space-y-2 text-sm dark:text-slate-300 text-slate-700">
                  <p>• <strong>{report.catBreakdown[0]?.name}</strong> is the top category, contributing <strong>{report.catBreakdown[0]?.share}%</strong> of total revenue ({formatINR(report.catBreakdown[0]?.revenue || 0)}).</p>
                  {report.topProducts[0] && (
                    <p>• <strong>{report.topProducts[0].name}</strong> is the highest revenue item with <strong>{formatINR(report.topProducts[0].revenue)}</strong> across {report.topProducts[0].transactions} transactions.</p>
                  )}
                  <p>• Average transaction value is <strong>{formatINR(report.avgTransaction)}</strong> across {report.transactionCount.toLocaleString('en-IN')} total records.</p>
                  {report.branchBreakdown.length > 0 && (
                    <p>• <strong>{report.branchBreakdown[0]?.name}</strong> is the top-performing branch with {formatINR(report.branchBreakdown[0]?.revenue || 0)} in revenue.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <ChartCard title="5-Year Revenue & Expansion Trend" subtitle="Historical growth + 2026 forecast (demo)">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockYearlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/10000000}Cr`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="branches" name="Branches" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500/10 to-purple-600/10 border border-primary-500/20">
                <p className="text-sm font-semibold dark:text-white text-slate-900 mb-1">📈 2026 Forecast Summary (Demo)</p>
                <p className="text-sm dark:text-slate-300 text-slate-700">
                  At current growth trajectory of <strong>+29.6% YoY</strong>, VOCiQ is projected to reach <strong>₹14.5 Crore</strong> in revenue by end-2026.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Download reminder footer */}
      <div className="flex items-center justify-between p-4 rounded-2xl dark:bg-white/3 bg-slate-50 border dark:border-white/5 border-slate-200">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-sm font-semibold dark:text-white text-slate-900">
              {hasData ? 'Your report is ready to download' : 'Upload data for real reports'}
            </p>
            <p className="text-xs dark:text-slate-400 text-slate-500">
              {hasData
                ? `PDF includes executive summary, category breakdown, top products, branch performance, and raw data from ${report?.fileName}`
                : 'The PDF report will include all analytics derived from your uploaded CSV data'
              }
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex-shrink-0"
        >
          <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          {downloading ? 'Generating…' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}

export default PremiumReports
