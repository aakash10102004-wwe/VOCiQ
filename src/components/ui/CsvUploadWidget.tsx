import React, { useState, useCallback } from 'react'
import { Upload, CheckCircle, AlertCircle, FileText, X } from 'lucide-react'
import Badge from './Badge'
import { parseCSV, analyzeData, ParsedData, AnalysisResult } from '../../utils/csvParser'

interface CsvUploadWidgetProps {
  /** Label shown above the upload area */
  label: string
  /** Description text */
  description?: string
  /** Callback when CSV is parsed successfully */
  onDataLoaded: (parsed: ParsedData, analysis: AnalysisResult, fileName: string) => void
  /** Callback when data is cleared */
  onDataCleared?: () => void
  /** If data is already loaded, show the file info */
  loadedFileName?: string | null
  /** Compact mode for inline usage */
  compact?: boolean
  /** Accepted file hint */
  sampleColumns?: string[]
}

const CsvUploadWidget: React.FC<CsvUploadWidgetProps> = ({
  label,
  description,
  onDataLoaded,
  onDataCleared,
  loadedFileName,
  compact = false,
  sampleColumns,
}) => {
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fileName, setFileName] = useState<string | null>(loadedFileName || null)
  const [rowCount, setRowCount] = useState(0)
  const [colCount, setColCount] = useState(0)

  const processFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'csv') {
      setStatus('error')
      setErrorMsg('Only CSV files are supported')
      return
    }

    setStatus('parsing')
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        if (!text || text.trim().length === 0) throw new Error('File is empty')

        const parsedData = parseCSV(text)
        const analysis = analyzeData(parsedData)

        setStatus('done')
        setRowCount(parsedData.rowCount)
        setColCount(parsedData.headers.length)
        onDataLoaded(parsedData, analysis, file.name)
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.message || 'Failed to parse CSV')
      }
    }
    reader.onerror = () => {
      setStatus('error')
      setErrorMsg('Failed to read file')
    }
    reader.readAsText(file)
  }, [onDataLoaded])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const clearData = () => {
    setStatus('idle')
    setFileName(null)
    setRowCount(0)
    setColCount(0)
    setErrorMsg('')
    onDataCleared?.()
  }

  const inputId = `csv-upload-${label.replace(/\s+/g, '-').toLowerCase()}`

  // Already loaded state
  if ((status === 'done' || loadedFileName) && (fileName || loadedFileName)) {
    return (
      <div className={`rounded-xl border border-emerald-500/30 bg-emerald-500/5 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-slate-900">{fileName || loadedFileName}</p>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                {rowCount > 0 ? `${rowCount.toLocaleString('en-IN')} rows · ${colCount} columns · ` : ''}
                Data loaded ✓
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" dot>Active</Badge>
            <button onClick={clearData} className="p-1 dark:text-slate-500 text-slate-400 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Re-upload option */}
        <div className="mt-2 pt-2 border-t dark:border-white/5 border-slate-200">
          <label
            htmlFor={inputId}
            className="text-xs text-primary-400 cursor-pointer hover:text-primary-300 transition-colors"
          >
            ↻ Upload different file
          </label>
          <input id={inputId} type="file" accept=".csv" className="hidden" onChange={onFileInput} />
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className={`rounded-xl border border-red-500/30 bg-red-500/5 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">{errorMsg}</p>
            <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{fileName}</p>
          </div>
          <button onClick={clearData} className="text-xs text-primary-400 hover:text-primary-300">Try again</button>
        </div>
      </div>
    )
  }

  // Parsing state
  if (status === 'parsing') {
    return (
      <div className={`rounded-xl border dark:border-white/10 border-slate-200 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold dark:text-white text-slate-900">Parsing {fileName}…</p>
            <div className="mt-1.5 h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default upload area
  return (
    <div
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => document.getElementById(inputId)?.click()}
      className={`border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
        compact ? 'p-4' : 'p-6'
      } ${
        dragging
          ? 'border-primary-400 dark:bg-primary-500/10 bg-primary-50 scale-[1.01]'
          : 'dark:border-white/10 border-slate-300 dark:hover:border-primary-500/50 hover:border-primary-400 dark:hover:bg-white/3 hover:bg-slate-50'
      }`}
    >
      <input id={inputId} type="file" accept=".csv" className="hidden" onChange={onFileInput} />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          dragging ? 'bg-primary-500/20' : 'dark:bg-white/5 bg-slate-100'
        }`}>
          <Upload className={`w-5 h-5 ${dragging ? 'text-primary-400' : 'dark:text-slate-400 text-slate-500'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold dark:text-white text-slate-900">{label}</p>
          {description && <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{description}</p>}
          {sampleColumns && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {sampleColumns.map(col => (
                <code key={col} className="text-[10px] px-1.5 py-0.5 rounded dark:bg-white/10 bg-slate-200 dark:text-slate-400 text-slate-500 font-mono">
                  {col}
                </code>
              ))}
            </div>
          )}
        </div>
        <Badge variant="info">CSV</Badge>
      </div>
    </div>
  )
}

export default CsvUploadWidget
