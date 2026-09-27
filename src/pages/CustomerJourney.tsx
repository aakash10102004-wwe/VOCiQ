import React, { useState, useMemo } from 'react'
import { Navigation, ArrowRight, Users, Upload } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { customerJourneyData as mockJourneyData } from '../data/mockData'

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#ef4444']

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

// Default mock journey structure
const mockJourneySteps = [
  ['Entrance'],
  ['Electronics', 'Fashion', 'Groceries', 'Home & Living'],
  ['Accessories', 'FMCG', 'Beauty'],
  ['Billing'],
]

const mockTopPaths = [
  { path: 'Entrance → Electronics → Accessories → Billing', count: 280, pct: '22%' },
  { path: 'Entrance → Fashion → Accessories → Billing', count: 220, pct: '17%' },
  { path: 'Entrance → Groceries → FMCG → Billing', count: 200, pct: '16%' },
  { path: 'Entrance → Fashion → Beauty → Billing', count: 100, pct: '8%' },
  { path: 'Entrance → Electronics → Billing', count: 170, pct: '13%' },
  { path: 'Entrance → Home & Living → Billing', count: 130, pct: '10%' },
]

const CustomerJourney: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData

  // Try to derive journey data from CSV
  const derived = useMemo(() => {
    if (!businessData) return null
    const { analysis, parsedData } = businessData
    const { summary, topItems, categoricalDistribution } = analysis

    // Look for journey-related columns (from_zone, to_zone, stage, step, zone, path, etc.)
    const fromCol = summary.categoricalColumns.find(c => /from|source|start|origin/i.test(c))
    const toCol = summary.categoricalColumns.find(c => /to|dest|target|end|next/i.test(c))
    const stageCol = summary.categoricalColumns.find(c => /stage|step|zone|section|area|department/i.test(c))
    const valueCol = summary.numericColumns.find(c => /count|value|visitors|traffic|flow/i.test(c)) || summary.numericColumns[0]

    // If we have from/to columns, build flow data
    if (fromCol && toCol) {
      const flowMap: Record<string, Record<string, number>> = {}
      parsedData.rows.forEach(row => {
        const from = row[fromCol]
        const to = row[toCol]
        const val = valueCol ? parseFloat(row[valueCol]) || 1 : 1
        if (from && to) {
          if (!flowMap[from]) flowMap[from] = {}
          flowMap[from][to] = (flowMap[from][to] || 0) + val
        }
      })

      const paths = Object.entries(flowMap).flatMap(([from, tos]) =>
        Object.entries(tos).map(([to, value]) => ({ from, to, value: Math.round(value) }))
      ).sort((a, b) => b.value - a.value)

      // Build unique nodes
      const allNodes = new Set<string>()
      paths.forEach(p => { allNodes.add(p.from); allNodes.add(p.to) })

      return { paths, nodes: Array.from(allNodes), type: 'flow' as const }
    }

    // If we have a stage/zone column, build distribution
    if (stageCol) {
      const items = topItems[stageCol] || []
      const total = items.reduce((a, b) => a + b.count, 0)
      const stageData = items.map((item, i) => ({
        name: item.value,
        count: item.count,
        pct: total > 0 ? `${Math.round(item.count / total * 100)}%` : '0%',
        color: COLORS[i % COLORS.length],
      }))
      return { stageData, type: 'distribution' as const }
    }

    // If we have at least 2 categorical columns, create a category-to-category flow
    if (summary.categoricalColumns.length >= 2) {
      const catA = summary.categoricalColumns[0]
      const catB = summary.categoricalColumns[1]
      const flowMap: Record<string, Record<string, number>> = {}
      parsedData.rows.forEach(row => {
        const a = row[catA]
        const b = row[catB]
        if (a && b) {
          if (!flowMap[a]) flowMap[a] = {}
          flowMap[a][b] = (flowMap[a][b] || 0) + 1
        }
      })
      const paths = Object.entries(flowMap).flatMap(([from, tos]) =>
        Object.entries(tos).map(([to, value]) => ({ from, to, value }))
      ).sort((a, b) => b.value - a.value).slice(0, 20)

      return { paths, nodes: [], type: 'derived-flow' as const, catA, catB }
    }

    return null
  }, [businessData])

  // Determine what to show
  const showMock = !derived
  const journeyPaths = derived?.type === 'flow' || derived?.type === 'derived-flow'
    ? (derived as any).paths
    : mockJourneyData.paths

  return (
    <div className="space-y-7">
      <PageHeader
        title="Customer Journey Analytics"
        subtitle={hasData && derived
          ? `Journey patterns from ${businessData.fileName}`
          : 'Track how customers move through your store from entrance to billing'
        }
        icon={<Navigation className="w-6 h-6 text-pink-400" />}
        badge={hasData && derived ? 'CSV Data' : 'Demo'}
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

      {!hasData && (
        <div
          onClick={() => navigate('/upload')}
          className="p-3 rounded-xl bg-gradient-to-r from-pink-600/10 to-primary-600/10 border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-all"
        >
          <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Upload CSV with columns like <code className="px-1 py-0.5 rounded dark:bg-white/10 bg-slate-200">from_zone, to_zone, count</code> for real journey analysis
          </p>
        </div>
      )}

      {/* === CSV DISTRIBUTION VIEW === */}
      {derived?.type === 'distribution' && (
        <>
          <ChartCard title="Zone/Stage Distribution" subtitle="From uploaded CSV data">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={(derived as any).stageData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="count">
                    {(derived as any).stageData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [value, 'Count']}
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {(derived as any).stageData.map((item: any, i: number) => (
                  <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl dark:bg-white/5 bg-slate-100">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white text-slate-900">{item.name}</p>
                      <div className="h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div className="h-full rounded-full" style={{ width: item.pct, backgroundColor: item.color }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold dark:text-white text-slate-900">{item.count}</p>
                      <p className="text-xs dark:text-slate-400 text-slate-500">{item.pct}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </>
      )}

      {/* === FLOW VIEW (CSV or Mock) === */}
      {(derived?.type === 'flow' || derived?.type === 'derived-flow' || showMock) && (
        <>
          {/* Visual Journey Flow (mock only) */}
          {showMock && (
            <ChartCard title="Customer Movement Flow" subtitle="Visitor paths from entrance to billing">
              <div className="overflow-x-auto py-4">
                <div className="flex items-center gap-2 min-w-[700px] justify-between">
                  {mockJourneySteps.map((step, si) => (
                    <React.Fragment key={si}>
                      <div className="flex flex-col gap-3">
                        {step.map((node, ni) => {
                          const incomingFlow = mockJourneyData.paths
                            .filter(p => p.to === node)
                            .reduce((a, b) => a + b.value, 0)
                          const outgoingFlow = mockJourneyData.paths
                            .filter(p => p.from === node)
                            .reduce((a, b) => a + b.value, 0)
                          const total = Math.max(incomingFlow, outgoingFlow, 100)
                          return (
                            <div
                              key={node}
                              className="rounded-xl p-3 text-center cursor-pointer transition-all hover:scale-105 border"
                              style={{
                                minWidth: 110,
                                backgroundColor: `${COLORS[ni % COLORS.length]}20`,
                                borderColor: `${COLORS[ni % COLORS.length]}40`,
                              }}
                            >
                              <p className="text-xs font-semibold dark:text-white text-slate-900">{node}</p>
                              <p className="text-xs mt-0.5" style={{ color: COLORS[ni % COLORS.length] }}>
                                {total} visitors
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      {si < mockJourneySteps.length - 1 && (
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-5 h-5 dark:text-slate-500 text-slate-400" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </ChartCard>
          )}

          {/* Flow connections — bar chart for CSV data */}
          {(derived?.type === 'flow' || derived?.type === 'derived-flow') && (
            <ChartCard
              title="Journey Flow Paths"
              subtitle={`${(derived as any).catA ? `${(derived as any).catA} → ${(derived as any).catB}` : 'Source → Destination'} transitions`}
            >
              <div className="space-y-3">
                {journeyPaths.slice(0, 12).map((path: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl dark:bg-white/5 bg-slate-100 group hover:dark:bg-white/8 hover:bg-slate-200 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium dark:text-white text-slate-900 min-w-[100px]">{path.from}</span>
                    <ArrowRight className="w-4 h-4 dark:text-slate-500 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium dark:text-white text-slate-900 min-w-[100px]">{path.to}</span>
                    <div className="flex-1 h-2 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden mx-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                        style={{ width: `${Math.min(100, (path.value / journeyPaths[0].value) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold dark:text-white text-slate-900 flex-shrink-0">{path.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {/* Top Customer Paths (mock) */}
          {showMock && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCard title="Most Common Customer Paths" subtitle="Ranked by frequency">
                <div className="space-y-3">
                  {mockTopPaths.map((p, i) => (
                    <div key={i} className="p-3 rounded-xl dark:bg-white/5 bg-slate-100 group hover:dark:bg-white/8 hover:bg-slate-200 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs font-medium dark:text-white text-slate-900 leading-relaxed">{p.path}</p>
                        <span className="text-xs font-bold dark:text-white text-slate-900 flex-shrink-0">{p.pct}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: p.pct, backgroundColor: COLORS[i % COLORS.length] }}
                          />
                        </div>
                        <span className="text-xs dark:text-slate-400 text-slate-500">{p.count} visitors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="Zone Transition Analysis" subtitle="How traffic flows between zones">
                <div className="space-y-3 pt-2">
                  {[
                    { from: 'Entrance', to: 'Electronics', value: 450, width: '90%' },
                    { from: 'Entrance', to: 'Fashion', value: 380, width: '76%' },
                    { from: 'Entrance', to: 'Groceries', value: 320, width: '64%' },
                    { from: 'Electronics', to: 'Accessories', value: 280, width: '56%' },
                    { from: 'Fashion', to: 'Accessories', value: 220, width: '44%' },
                    { from: 'Accessories', to: 'Billing', value: 420, width: '84%' },
                  ].map((t, i) => (
                    <div key={i} className="grid grid-cols-5 items-center gap-2">
                      <p className="text-xs dark:text-slate-400 text-slate-500 text-right col-span-1 truncate">{t.from}</p>
                      <ArrowRight className="w-3 h-3 dark:text-slate-600 text-slate-400" />
                      <p className="text-xs dark:text-white text-slate-900 font-medium col-span-1 truncate">{t.to}</p>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <div className="flex-1 h-2 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500" style={{ width: t.width }} />
                        </div>
                        <span className="text-xs dark:text-slate-400 text-slate-500 w-8">{t.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CustomerJourney
