import React, { useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { BarChart3, TrendingUp, Hash, Layers, Clock, Database, Sparkles } from 'lucide-react'
import ChartCard from '../ui/ChartCard'
import Badge from '../ui/Badge'
import type { ParsedData, AnalysisResult } from '../../utils/csvParser'

interface Props {
  data: ParsedData
  analysis: AnalysisResult
  fileName: string
}

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-xs text-slate-400 mb-2 max-w-[200px] truncate">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name}:</span>
          <span className="text-white font-semibold">{typeof e.value === 'number' ? e.value.toLocaleString('en-IN') : e.value}</span>
        </div>
      ))}
    </div>
  )
}

const formatLargeNumber = (v: number) => {
  if (Math.abs(v) >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`
  if (Math.abs(v) >= 100000) return `${(v / 100000).toFixed(1)}L`
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toFixed(v % 1 === 0 ? 0 : 1)
}

const GeneratedDashboard: React.FC<Props> = ({ data, analysis, fileName }) => {
  const { summary, numericStats, topItems, correlations, timeSeries } = analysis

  // Determine the primary categorical and numeric columns
  const primaryCategorical = summary.categoricalColumns[0]
  const primaryNumeric = summary.numericColumns[0]
  const secondaryNumeric = summary.numericColumns[1]

  // Pie chart data from first categorical column
  const pieData = useMemo(() => {
    if (!primaryCategorical || !topItems[primaryCategorical]) return null
    return topItems[primaryCategorical].slice(0, 8).map((item, i) => ({
      name: item.value,
      value: item.count,
      color: COLORS[i % COLORS.length],
    }))
  }, [primaryCategorical, topItems])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-600/20 via-purple-600/20 to-pink-600/20 border border-primary-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display dark:text-white text-slate-900">AI-Generated Analytics Dashboard</h2>
            <p className="text-xs dark:text-slate-400 text-slate-500">
              Auto-analyzed from <strong>{fileName}</strong> · {summary.totalRows.toLocaleString('en-IN')} rows × {summary.totalColumns} columns
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" dot>{summary.numericColumns.length} numeric</Badge>
          <Badge variant="purple" dot>{summary.categoricalColumns.length} categorical</Badge>
          {summary.dateColumns.length > 0 && <Badge variant="success" dot>{summary.dateColumns.length} date</Badge>}
          <Badge variant="default">{summary.totalRows} rows</Badge>
        </div>
      </div>

      {/* Numeric KPI Cards */}
      {Object.keys(numericStats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Object.entries(numericStats).slice(0, 5).map(([col, stats], i) => (
            <div key={col} className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS[i % COLORS.length] + '20' }}>
                  {i === 0 ? <TrendingUp className="w-4 h-4" style={{ color: COLORS[i % COLORS.length] }} /> :
                   i === 1 ? <Hash className="w-4 h-4" style={{ color: COLORS[i % COLORS.length] }} /> :
                   <BarChart3 className="w-4 h-4" style={{ color: COLORS[i % COLORS.length] }} />}
                </div>
                <span className="text-xs dark:text-slate-400 text-slate-500 font-medium truncate flex-1">{col}</span>
              </div>
              <p className="text-xl font-bold font-display dark:text-white text-slate-900">{formatLargeNumber(stats.sum)}</p>
              <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">
                avg: {formatLargeNumber(stats.mean)} · range: {formatLargeNumber(stats.min)}–{formatLargeNumber(stats.max)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Correlations: Categorical × Numeric as Bar Charts */}
        {correlations.slice(0, 4).map((corr, ci) => (
          <ChartCard
            key={`corr-${ci}`}
            title={`${corr.colB} by ${corr.colA}`}
            subtitle={`Sum of ${corr.colB} grouped by ${corr.colA}`}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={corr.data} layout={corr.data.length > 6 ? 'vertical' : 'horizontal'}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                {corr.data.length > 6 ? (
                  <>
                    <YAxis type="category" dataKey="x" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatLargeNumber(v)} />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="x" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatLargeNumber(v)} />
                  </>
                )}
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="y"
                  name={corr.colB}
                  radius={corr.data.length > 6 ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                >
                  {corr.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ))}
      </div>

      {/* Pie Chart + Data Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pie chart from first categorical */}
        {pieData && (
          <ChartCard title={`Distribution: ${primaryCategorical}`} subtitle="Category frequency breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [value, 'Count']}
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-1 text-xs dark:text-slate-400 text-slate-500">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[80px]">{item.name}</span>
                  <span className="dark:text-white text-slate-900 font-medium">({item.value})</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Additional categorical distributions */}
        {summary.categoricalColumns.slice(1, 3).map(col => {
          const items = topItems[col]
          if (!items || items.length === 0) return null
          const max = items[0]?.count || 1
          return (
            <ChartCard key={col} title={`Top: ${col}`} subtitle="Ranked by frequency">
              <div className="space-y-2">
                {items.slice(0, 8).map((item, i) => (
                  <div key={item.value} className="flex items-center gap-2">
                    <span className="text-xs font-mono dark:text-slate-500 text-slate-400 w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs dark:text-white text-slate-900 font-medium truncate">{item.value}</span>
                        <span className="text-xs font-bold dark:text-white text-slate-900 flex-shrink-0">{item.count}</span>
                      </div>
                      <div className="h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(item.count / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )
        })}
      </div>

      {/* Time Series Charts */}
      {timeSeries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {timeSeries.map((ts, i) => (
            <ChartCard
              key={`ts-${i}`}
              title={`${ts.valueCol} Over Time`}
              subtitle={`Grouped by ${ts.dateCol}`}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ts.data}>
                  <defs>
                    <linearGradient id={`tsGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatLargeNumber(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={ts.valueCol}
                    stroke={COLORS[i % COLORS.length]}
                    fill={`url(#tsGrad${i})`}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          ))}
        </div>
      )}

      {/* Data Preview Table */}
      <ChartCard title="Data Preview" subtitle={`First 15 rows of ${data.rowCount.toLocaleString('en-IN')} total`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-8">#</th>
                {data.headers.map(h => (
                  <th key={h}>
                    <div className="flex items-center gap-1">
                      {h}
                      <Badge
                        variant={
                          data.columns.find(c => c.name === h)?.type === 'number' ? 'info' :
                          data.columns.find(c => c.name === h)?.type === 'date' ? 'success' : 'default'
                        }
                      >
                        {data.columns.find(c => c.name === h)?.type || '?'}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, 15).map((row, i) => (
                <tr key={i}>
                  <td className="dark:text-slate-500 text-slate-400 font-mono text-xs">{i + 1}</td>
                  {data.headers.map(h => (
                    <td key={h} className="dark:text-slate-300 text-slate-700 max-w-[200px] truncate text-xs">
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Column Analysis */}
      <ChartCard title="Column Analysis" subtitle="Auto-detected types and statistics"
        actions={<Database className="w-4 h-4 dark:text-slate-400 text-slate-500" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.columns.map((col, i) => {
            const stats = numericStats[col.name]
            return (
              <div key={col.name} className="p-3 rounded-xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold dark:text-white text-slate-900 truncate">{col.name}</span>
                  <Badge variant={col.type === 'number' ? 'info' : col.type === 'date' ? 'success' : 'purple'}>
                    {col.type}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs dark:text-slate-400 text-slate-500">
                  <div className="flex justify-between">
                    <span>Unique values</span>
                    <span className="dark:text-white text-slate-900 font-medium">{col.uniqueValues}</span>
                  </div>
                  {col.nullCount > 0 && (
                    <div className="flex justify-between">
                      <span>Missing values</span>
                      <span className="text-amber-400 font-medium">{col.nullCount}</span>
                    </div>
                  )}
                  {stats && (
                    <>
                      <div className="flex justify-between"><span>Sum</span><span className="dark:text-white text-slate-900 font-medium">{formatLargeNumber(stats.sum)}</span></div>
                      <div className="flex justify-between"><span>Average</span><span className="dark:text-white text-slate-900 font-medium">{formatLargeNumber(stats.mean)}</span></div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}

export default GeneratedDashboard
