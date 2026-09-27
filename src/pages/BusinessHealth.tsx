import React, { useEffect, useState, useMemo } from 'react'
import { Zap, TrendingUp, TrendingDown, ChevronUp, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { businessHealthData as mockHealthData } from '../data/mockData'

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    let start = 0
    const step = () => {
      start += 1
      setDisplayed(start)
      if (start < score) requestAnimationFrame(step)
    }
    const t = setTimeout(() => requestAnimationFrame(step), 300)
    return () => clearTimeout(t)
  }, [score])

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const data = [{ value: displayed, fill: color }]

  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cy="80%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={14}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.05)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '20%' }}>
        <p className="text-5xl font-black font-display" style={{ color }}>{displayed}</p>
        <p className="text-sm dark:text-slate-400 text-slate-500 font-medium">/ 100</p>
        <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'} size="md" className="mt-1">
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
        </Badge>
      </div>
    </div>
  )
}

const BusinessHealth: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData

  // Derive a health score from CSV data quality
  const derivedHealth = useMemo(() => {
    if (!businessData) return null
    const { analysis } = businessData
    const { summary, numericStats } = analysis

    // Calculate scores based on data quality and completeness
    const dataCompleteness = Math.min(100, Math.round((summary.totalRows / 100) * 20 + 60))
    const columnDiversity = Math.min(100, Math.round(summary.totalColumns * 8))
    const numericCoverage = Math.min(100, summary.numericColumns.length > 0 ? 85 : 40)
    const dateCoverage = summary.dateColumns.length > 0 ? 90 : 50
    const categoricalRichness = Math.min(100, summary.categoricalColumns.length > 0 ? 80 : 35)

    const overall = Math.round(
      dataCompleteness * 0.3 +
      columnDiversity * 0.2 +
      numericCoverage * 0.2 +
      dateCoverage * 0.15 +
      categoricalRichness * 0.15
    )

    const factors = [
      { name: 'Data Volume', score: dataCompleteness, weight: 30, trend: summary.totalRows > 50 ? 'up' : 'down' },
      { name: 'Column Diversity', score: columnDiversity, weight: 20, trend: summary.totalColumns > 5 ? 'up' : 'stable' },
      { name: 'Numeric Coverage', score: numericCoverage, weight: 20, trend: 'up' },
      { name: 'Date Columns', score: dateCoverage, weight: 15, trend: summary.dateColumns.length > 0 ? 'up' : 'down' },
      { name: 'Category Richness', score: categoricalRichness, weight: 15, trend: 'up' },
    ]

    const suggestions = [
      summary.totalRows < 100 ? 'Upload more records (ideally 500+) for better statistical insights' : 'Good data volume — sufficient for reliable analytics',
      summary.dateColumns.length === 0 ? 'Add a date/timestamp column to enable time-series analysis and forecasting' : 'Date columns detected — time-series analytics enabled',
      summary.numericColumns.length < 2 ? 'Add more numeric columns (price, quantity, etc.) for deeper analytics' : 'Multiple numeric columns available for cross-analysis',
      summary.categoricalColumns.length < 2 ? 'Add categorical columns (category, branch, etc.) for segmentation' : 'Good categorical coverage for grouping and segmentation',
      `Upload staff data separately in the Staff Analytics page for employee performance insights`,
    ]

    return { overall, factors, suggestions }
  }, [businessData])

  const healthData = derivedHealth || mockHealthData

  return (
    <div className="space-y-7">
      <PageHeader
        title="Business Health Score"
        subtitle={hasData ? `Health analysis from ${businessData.fileName}` : 'AI-calculated overall business performance out of 100'}
        icon={<Zap className="w-6 h-6 text-amber-400" />}
        badge={hasData ? 'CSV Analysis' : 'AI Scored'}
        badgeColor="amber"
        actions={!hasData ? (
          <button onClick={() => navigate('/upload')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload CSV
          </button>
        ) : undefined}
      />

      {!hasData && (
        <div onClick={() => navigate('/upload')}
          className="p-3 rounded-xl bg-gradient-to-r from-amber-600/10 to-primary-600/10 border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-all">
          <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Upload your data to get a personalized business health score
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Score */}
        <ChartCard title="Overall Health Score" subtitle={hasData ? 'Based on uploaded data quality' : 'Composite score across all metrics'} className="lg:col-span-1">
          <ScoreGauge score={(healthData as any).overallScore || (healthData as any).overall} />
          <p className="text-center text-sm dark:text-slate-400 text-slate-500 mt-4">
            {((healthData as any).overallScore || (healthData as any).overall) >= 80
              ? <>Your {hasData ? 'data quality' : 'business'} is performing <strong className="text-emerald-400">excellently</strong>.</>
              : <>Your {hasData ? 'data' : 'business'} has <strong className="text-amber-400">room for improvement</strong>.</>
            }
          </p>
        </ChartCard>

        {/* Factor Breakdown */}
        <ChartCard title="Score Breakdown by Factor" subtitle="Weighted contribution to overall score" className="lg:col-span-2">
          <div className="space-y-5 pt-2">
            {healthData.factors.map((factor: any) => (
              <div key={factor.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      factor.score >= 85 ? 'bg-emerald-500/10' : factor.score >= 70 ? 'bg-amber-500/10' : 'bg-red-500/10'
                    }`}>
                      {factor.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                        : factor.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-400" />
                        : <ChevronUp className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold dark:text-white text-slate-900">{factor.name}</p>
                      <p className="text-xs dark:text-slate-400 text-slate-500">Weight: {factor.weight}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold font-display ${
                      factor.score >= 85 ? 'text-emerald-400' : factor.score >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>{factor.score}</p>
                    <p className="text-xs dark:text-slate-400 text-slate-500">/ 100</p>
                  </div>
                </div>
                <div className="h-3 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      factor.score >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : factor.score >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-red-500 to-orange-400'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* AI Suggestions */}
      <ChartCard
        title={hasData ? 'Data Quality Recommendations' : 'AI Improvement Suggestions'}
        subtitle={hasData ? 'Improve your data for better analytics' : 'Personalized recommendations to boost your health score'}
        actions={<Zap className="w-4 h-4 text-amber-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData.suggestions.map((suggestion: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200 hover:border-emerald-500/30 transition-all group">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed">{suggestion}</p>
            </div>
          ))}
          {!hasData && (
            <div className="flex items-start gap-3 p-4 rounded-xl dark:bg-amber-500/5 bg-amber-50 border border-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-500 mb-1">Priority Action</p>
                <p className="text-sm dark:text-amber-300/80 text-amber-700">Fixing inventory inefficiency (+4 pts) would bring your score to 88/100</p>
              </div>
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  )
}

export default BusinessHealth
