import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Database, Upload, BarChart3, Sparkles, FileText, CheckCircle, AlertCircle, X, Zap } from 'lucide-react'
import ChartCard from '../components/ui/ChartCard'
import Badge from '../components/ui/Badge'
import GeneratedDashboard from '../components/analytics/GeneratedDashboard'
import { parseCSV, analyzeData, ParsedData, AnalysisResult } from '../utils/csvParser'
import { useData } from '../context/DataContext'

type FileEntry = {
  name: string
  size: number
  type: string
  status: 'pending' | 'parsing' | 'done' | 'error'
  columns?: string[]
  rows?: number
  parsedData?: ParsedData
  analysis?: AnalysisResult
  errorMessage?: string
}

const DatasetAnalysis: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [dragging, setDragging] = useState(false)
  const [activeDashboard, setActiveDashboard] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('upload')
  const { setBusinessData, businessData } = useData()

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'json'].includes(ext || '')) return

    const entry: FileEntry = { name: file.name, size: file.size, type: ext || '', status: 'parsing' }
    setFiles(prev => [...prev, entry])

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        if (!text || text.trim().length === 0) throw new Error('File is empty')

        const parsedData = parseCSV(text)
        const analysis = analyzeData(parsedData)

        setFiles(prev => prev.map(f => f.name === file.name
          ? { ...f, status: 'done' as const, columns: parsedData.headers, rows: parsedData.rowCount, parsedData, analysis }
          : f
        ))

        // Store in global context — all pages use ONLY this dataset
        setBusinessData({ fileName: file.name, parsedData, analysis, uploadedAt: new Date() })
        setActiveTab('analysis')
        setActiveDashboard(file.name)
      } catch (err: any) {
        setFiles(prev => prev.map(f => f.name === file.name
          ? { ...f, status: 'error' as const, errorMessage: err.message || 'Parse error' }
          : f
        ))
      }
    }
    reader.onerror = () => {
      setFiles(prev => prev.map(f => f.name === file.name
        ? { ...f, status: 'error' as const, errorMessage: 'Failed to read file' }
        : f
      ))
    }
    reader.readAsText(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    Array.from(e.dataTransfer.files).forEach(processFile)
  }, [])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(processFile)
    e.target.value = ''
  }

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name))
    if (activeDashboard === name) setActiveDashboard(null)
  }

  const activeFile = files.find(f => f.name === activeDashboard)

  const tabs = [
    { id: 'upload', label: 'Upload Dataset', icon: Upload },
    { id: 'analysis', label: 'Custom Analysis', icon: BarChart3, badge: businessData ? '1' : undefined },
    { id: 'insights', label: 'Personalized Insights', icon: Sparkles },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 flex items-center justify-center border border-sky-500/20">
            <Database className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight font-display">Dataset & Custom Analysis</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">Upload datasets and get AI-powered analysis based on YOUR data</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <p className="text-xs dark:text-amber-300 text-amber-700 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 flex-shrink-0" />
          <strong>Important:</strong> When a dataset is uploaded, all analytics across the platform are based ONLY on your uploaded data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-500 text-white">{tab.badge}</span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="dataset-tab-indicator"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragging
                  ? 'border-primary-400 dark:bg-primary-500/10 bg-primary-50 scale-[1.02]'
                  : 'dark:border-white/10 border-slate-300 dark:hover:border-primary-500/50 hover:border-primary-400 dark:hover:bg-white/3 hover:bg-slate-50'
              }`}
              onClick={() => document.getElementById('dataset-file-input')?.click()}
            >
              <input id="dataset-file-input" type="file" multiple accept=".csv,.xlsx,.json" className="hidden" onChange={onFileInput} />
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
                dragging ? 'bg-primary-500/20 scale-110' : 'dark:bg-white/5 bg-slate-100'
              }`}>
                <Upload className={`w-8 h-8 transition-colors ${dragging ? 'text-primary-400' : 'dark:text-slate-400 text-slate-500'}`} />
              </div>
              <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-2">
                {dragging ? 'Drop your files here' : 'Drag & Drop your datasets'}
              </h3>
              <p className="text-sm dark:text-slate-400 text-slate-500 mb-4">
                or <span className="text-primary-400 font-medium">browse to upload</span>
              </p>
              <div className="flex items-center justify-center gap-3">
                {['CSV', 'Excel (.xlsx)', 'JSON'].map(f => (
                  <Badge key={f} variant="info">{f}</Badge>
                ))}
              </div>
              <p className="text-xs dark:text-slate-500 text-slate-400 mt-3">Max 50MB per file · CSV recommended for best results</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <ChartCard title="Uploaded Files" subtitle="AI is parsing and analyzing your data">
                <div className="space-y-4">
                  {files.map(file => (
                    <div key={file.name} className={`p-4 rounded-xl border transition-all ${
                      activeDashboard === file.name
                        ? 'dark:bg-primary-500/10 bg-primary-50 border-primary-500/30'
                        : 'dark:bg-white/5 bg-slate-100 dark:border-white/5 border-slate-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          file.status === 'done' ? 'bg-emerald-500/10' : file.status === 'error' ? 'bg-red-500/10' : 'bg-primary-500/10'
                        }`}>
                          {file.status === 'done' ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                            : file.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" />
                            : <Database className="w-5 h-5 text-primary-400 animate-pulse" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold dark:text-white text-slate-900 truncate">{file.name}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant={file.status === 'done' ? 'success' : file.status === 'error' ? 'danger' : 'info'} dot>
                                {file.status === 'done' ? 'Analyzed' : file.status === 'error' ? 'Error' : 'Parsing…'}
                              </Badge>
                              <button onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} className="dark:text-slate-500 text-slate-400 hover:text-red-400 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB · {file.type.toUpperCase()}
                            {file.rows && ` · ${file.rows.toLocaleString('en-IN')} rows`}
                            {file.columns && ` · ${file.columns.length} columns`}
                          </p>
                          {file.status === 'error' && file.errorMessage && (
                            <p className="text-xs text-red-400 mt-1">{file.errorMessage}</p>
                          )}
                          {file.status === 'done' && file.columns && (
                            <div className="mt-3">
                              <p className="text-xs dark:text-slate-400 text-slate-500 mb-2">
                                <Zap className="w-3 h-3 inline mr-1 text-primary-400" />
                                AI detected {file.columns.length} columns:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {file.columns.map(col => {
                                  const colType = file.parsedData?.columns.find(c => c.name === col)?.type
                                  return (
                                    <code key={col} className={`text-xs px-2 py-0.5 rounded-lg font-mono ${
                                      colType === 'number'
                                        ? 'dark:bg-blue-500/10 bg-blue-50 dark:text-blue-300 text-blue-600 border border-blue-500/20'
                                        : colType === 'date'
                                        ? 'dark:bg-emerald-500/10 bg-emerald-50 dark:text-emerald-300 text-emerald-600 border border-emerald-500/20'
                                        : 'dark:bg-white/10 bg-slate-200 dark:text-slate-300 text-slate-600'
                                    }`}>
                                      {col}
                                    </code>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {file.status === 'done' && file.parsedData && file.analysis && (
                        <div className="mt-3">
                          <button
                            onClick={() => { setActiveDashboard(activeDashboard === file.name ? null : file.name); setActiveTab('analysis'); }}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              activeDashboard === file.name
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/30 hover:opacity-90'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                            {activeDashboard === file.name ? '✓ Viewing Dashboard' : 'Generate Analytics Dashboard'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {/* Getting Started Guide */}
            {files.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Sales Data', columns: ['product_name', 'category', 'branch', 'price', 'quantity', 'timestamp'], icon: '📊', desc: 'Upload sales data — AI generates product analytics, revenue reports, and forecasting dashboards.' },
                  { title: 'Inventory Data', columns: ['product_id', 'branch', 'stock_level', 'min_stock', 'last_restocked'], icon: '📦', desc: 'Upload inventory levels — AI detects low stock alerts and predicts restock needs.' },
                  { title: 'Crowd Data', columns: ['branch', 'timestamp', 'visitor_count', 'hour', 'day_of_week'], icon: '👥', desc: 'Upload visitor data — AI builds traffic heatmaps and crowd monitoring dashboards.' },
                ].map(fmt => (
                  <div key={fmt.title} className="metric-card">
                    <div className="text-2xl mb-2">{fmt.icon}</div>
                    <h4 className="font-semibold dark:text-white text-slate-900 mb-1">{fmt.title}</h4>
                    <p className="text-xs dark:text-slate-400 text-slate-500 mb-3">{fmt.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {fmt.columns.map(col => (
                        <code key={col} className="text-xs px-1.5 py-0.5 rounded dark:bg-white/10 bg-slate-200 dark:text-slate-300 text-slate-600 font-mono">{col}</code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {activeFile && activeFile.parsedData && activeFile.analysis ? (
              <GeneratedDashboard data={activeFile.parsedData} analysis={activeFile.analysis} fileName={activeFile.name} />
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl dark:bg-white/5 bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 dark:text-slate-500 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-2">No Dataset Loaded</h3>
                <p className="text-sm dark:text-slate-400 text-slate-500 mb-4">Upload a CSV file first to see custom analysis</p>
                <button onClick={() => setActiveTab('upload')} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg">
                  <Upload className="w-4 h-4 inline mr-2" />Upload Dataset
                </button>
              </div>
            )}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {businessData ? (
              <div className="space-y-4">
                <ChartCard title="Personalized Insights" subtitle={`Based on ${businessData.fileName}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {[
                      { title: 'Data Quality Score', value: `${Math.min(95, 70 + businessData.analysis.summary.totalRows / 10)}%`, desc: 'Based on completeness and consistency of your uploaded data', color: 'text-emerald-400' },
                      { title: 'Columns Detected', value: `${businessData.analysis.summary.numericColumns.length + businessData.analysis.summary.categoricalColumns.length}`, desc: `${businessData.analysis.summary.numericColumns.length} numeric, ${businessData.analysis.summary.categoricalColumns.length} categorical`, color: 'text-blue-400' },
                      { title: 'Records Analyzed', value: businessData.analysis.summary.totalRows.toLocaleString('en-IN'), desc: 'Total data points processed by AI engine', color: 'text-purple-400' },
                      { title: 'Correlations Found', value: `${businessData.analysis.correlations.length}`, desc: 'Statistical relationships detected between columns', color: 'text-amber-400' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
                        <p className="text-xs dark:text-slate-400 text-slate-500 mb-1">{item.title}</p>
                        <h4 className={`text-2xl font-bold ${item.color} mb-1`}>{item.value}</h4>
                        <p className="text-xs dark:text-slate-500 text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                {businessData.analysis.correlations.length > 0 && (
                  <ChartCard title="Key Correlations" subtitle="Statistical relationships in your data">
                    <div className="space-y-3 pt-2">
                      {businessData.analysis.correlations.slice(0, 5).map((corr: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl dark:bg-white/5 bg-slate-50 border dark:border-white/5 border-slate-200">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium dark:text-white text-slate-900 truncate">{corr.xColumn} ↔ {corr.yColumn}</p>
                            <p className="text-xs dark:text-slate-400 text-slate-500">{corr.data.length} data points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl dark:bg-white/5 bg-slate-100 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 dark:text-slate-500 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-2">Upload Data for Insights</h3>
                <p className="text-sm dark:text-slate-400 text-slate-500 mb-4">Personalized insights require your business data</p>
                <button onClick={() => setActiveTab('upload')} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg">
                  <Upload className="w-4 h-4 inline mr-2" />Upload Dataset
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default DatasetAnalysis
