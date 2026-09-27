import React, { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, Database, Zap, BarChart3 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
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

const DataUpload: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [dragging, setDragging] = useState(false)
  const [activeDashboard, setActiveDashboard] = useState<string | null>(null)
  const { setBusinessData } = useData()

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'json'].includes(ext || '')) return

    const entry: FileEntry = { name: file.name, size: file.size, type: ext || '', status: 'parsing' }
    setFiles(prev => [...prev, entry])

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        if (!text || text.trim().length === 0) {
          throw new Error('File is empty')
        }

        const parsedData = parseCSV(text)
        const analysis = analyzeData(parsedData)

        setFiles(prev => prev.map(f => f.name === file.name
          ? {
              ...f,
              status: 'done' as const,
              columns: parsedData.headers,
              rows: parsedData.rowCount,
              parsedData,
              analysis,
            }
          : f
        ))

        // Store in global context so all pages can use it
        setBusinessData({
          fileName: file.name,
          parsedData,
          analysis,
          uploadedAt: new Date(),
        })
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

  return (
    <div className="space-y-7">
      <PageHeader
        title="Data Upload"
        subtitle="Upload your raw retail datasets — AI automatically parses, analyzes, and generates dashboards"
        icon={<Upload className="w-6 h-6 text-sky-400" />}
        badge="AI Parser"
        badgeColor="primary"
      />

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
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".csv,.xlsx,.json"
          className="hidden"
          onChange={onFileInput}
        />
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

        {/* Info: data flows to other pages */}
        <div className="mt-4 p-3 rounded-xl dark:bg-white/5 bg-slate-100 inline-block">
          <p className="text-xs dark:text-slate-400 text-slate-500">
            <Zap className="w-3 h-3 inline mr-1 text-primary-400" />
            Uploaded data automatically powers analytics across <strong className="text-primary-400">all pages</strong> — Dashboard, Products, Branches, and more
          </p>
        </div>
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
                    file.status === 'done' ? 'bg-emerald-500/10'
                    : file.status === 'error' ? 'bg-red-500/10'
                    : 'bg-primary-500/10'
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
                      {file.rows && ` · ${file.rows.toLocaleString('en-IN')} rows detected`}
                      {file.columns && ` · ${file.columns.length} columns`}
                    </p>
                    {file.status === 'error' && file.errorMessage && (
                      <p className="text-xs text-red-400 mt-1">{file.errorMessage}</p>
                    )}
                    {file.status === 'parsing' && (
                      <div className="mt-2 h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full animate-shimmer" style={{ width: '60%', backgroundSize: '200% 100%' }} />
                      </div>
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
                {/* Generate / View Dashboard Button */}
                {file.status === 'done' && file.parsedData && file.analysis && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setActiveDashboard(activeDashboard === file.name ? null : file.name)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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

      {/* GENERATED DASHBOARD */}
      {activeFile && activeFile.parsedData && activeFile.analysis && (
        <GeneratedDashboard
          data={activeFile.parsedData}
          analysis={activeFile.analysis}
          fileName={activeFile.name}
        />
      )}

      {/* Getting Started Guide */}
      {files.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Sales Data', columns: ['product_name', 'category', 'branch', 'price', 'quantity', 'timestamp'],
              icon: '📊', desc: 'Upload your sales data — AI generates product analytics, revenue reports, and forecasting dashboards automatically.'
            },
            {
              title: 'Inventory Data', columns: ['product_id', 'branch', 'stock_level', 'min_stock', 'last_restocked'],
              icon: '📦', desc: 'Upload inventory levels — AI detects low stock alerts, shows depletion trends, and predicts restock needs.'
            },
            {
              title: 'Crowd Data', columns: ['branch', 'timestamp', 'visitor_count', 'hour', 'day_of_week'],
              icon: '👥', desc: 'Upload visitor data — AI builds traffic heatmaps, peak hour analysis, and crowd monitoring dashboards.'
            },
          ].map(fmt => (
            <div key={fmt.title} className="metric-card">
              <div className="text-2xl mb-2">{fmt.icon}</div>
              <h4 className="font-semibold dark:text-white text-slate-900 mb-1">{fmt.title}</h4>
              <p className="text-xs dark:text-slate-400 text-slate-500 mb-3">{fmt.desc}</p>
              <div className="flex flex-wrap gap-1">
                {fmt.columns.map(col => (
                  <code key={col} className="text-xs px-1.5 py-0.5 rounded dark:bg-white/10 bg-slate-200 dark:text-slate-300 text-slate-600 font-mono">
                    {col}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataUpload
