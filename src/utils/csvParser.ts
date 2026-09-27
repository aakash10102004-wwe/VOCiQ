// Browser-based CSV parser and data analyzer
// Parses CSV text, auto-detects column types, and generates analysis

export interface ParsedColumn {
  name: string
  type: 'number' | 'string' | 'date'
  uniqueValues: number
  nullCount: number
  sampleValues: string[]
}

export interface ParsedData {
  headers: string[]
  rows: Record<string, string>[]
  columns: ParsedColumn[]
  rowCount: number
}

export interface AnalysisResult {
  summary: {
    totalRows: number
    totalColumns: number
    numericColumns: string[]
    categoricalColumns: string[]
    dateColumns: string[]
  }
  numericStats: Record<string, {
    min: number
    max: number
    mean: number
    sum: number
    count: number
  }>
  categoricalDistribution: Record<string, Record<string, number>>
  topItems: Record<string, { value: string; count: number }[]>
  correlations: { colA: string; colB: string; data: { x: string; y: number }[] }[]
  timeSeries: { dateCol: string; valueCol: string; data: { date: string; value: number }[] }[]
}

// Parse CSV text into structured data
export function parseCSV(text: string): ParsedData {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error('CSV must have at least a header and one data row')

  // Handle quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, j) => {
      row[h] = (values[j] || '').replace(/^["']|["']$/g, '').trim()
    })
    rows.push(row)
  }

  // Detect column types
  const columns: ParsedColumn[] = headers.map(name => {
    const vals = rows.map(r => r[name]).filter(v => v !== '' && v !== undefined)
    const nonEmpty = vals.length
    const nullCount = rows.length - nonEmpty

    const numericCount = vals.filter(v => !isNaN(Number(v)) && v !== '').length
    const dateCount = vals.filter(v => {
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(v)) return true
      if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(v)) return true
      const d = new Date(v)
      return !isNaN(d.getTime()) && v.length > 4
    }).length

    let type: 'number' | 'string' | 'date' = 'string'
    if (nonEmpty > 0) {
      if (numericCount / nonEmpty > 0.8) type = 'number'
      else if (dateCount / nonEmpty > 0.7) type = 'date'
    }

    const unique = new Set(vals)
    return {
      name,
      type,
      uniqueValues: unique.size,
      nullCount,
      sampleValues: vals.slice(0, 5),
    }
  })

  return { headers, rows, columns, rowCount: rows.length }
}

// Analyze parsed data to generate insights
export function analyzeData(data: ParsedData): AnalysisResult {
  const numericCols = data.columns.filter(c => c.type === 'number').map(c => c.name)
  const categoricalCols = data.columns.filter(c => c.type === 'string' && c.uniqueValues <= 50).map(c => c.name)
  const dateCols = data.columns.filter(c => c.type === 'date').map(c => c.name)

  // Numeric stats
  const numericStats: AnalysisResult['numericStats'] = {}
  for (const col of numericCols) {
    const values = data.rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v))
    if (values.length === 0) continue
    numericStats[col] = {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      sum: values.reduce((a, b) => a + b, 0),
      count: values.length,
    }
  }

  // Categorical distributions (top 10 per column)
  const categoricalDistribution: Record<string, Record<string, number>> = {}
  const topItems: Record<string, { value: string; count: number }[]> = {}
  for (const col of categoricalCols) {
    const counts: Record<string, number> = {}
    data.rows.forEach(r => {
      const v = r[col]
      if (v) counts[v] = (counts[v] || 0) + 1
    })
    categoricalDistribution[col] = counts

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }))
    topItems[col] = sorted
  }

  // Correlations: for each categorical col × first 2 numeric cols
  const correlations: AnalysisResult['correlations'] = []
  const topNumericCols = numericCols.slice(0, 3)
  for (const catCol of categoricalCols.slice(0, 2)) {
    for (const numCol of topNumericCols) {
      const grouped: Record<string, number[]> = {}
      data.rows.forEach(r => {
        const key = r[catCol]
        const val = parseFloat(r[numCol])
        if (key && !isNaN(val)) {
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(val)
        }
      })
      const chartData = Object.entries(grouped)
        .map(([x, vals]) => ({ x, y: vals.reduce((a, b) => a + b, 0) }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 12)
      if (chartData.length >= 2) {
        correlations.push({ colA: catCol, colB: numCol, data: chartData })
      }
    }
  }

  // Time series: aggregate numeric cols by date
  const timeSeries: AnalysisResult['timeSeries'] = []
  if (dateCols.length > 0) {
    const dateCol = dateCols[0]
    for (const numCol of topNumericCols.slice(0, 2)) {
      const grouped: Record<string, number> = {}
      data.rows.forEach(r => {
        const d = r[dateCol]
        const v = parseFloat(r[numCol])
        if (d && !isNaN(v)) {
          // Normalize to YYYY-MM or date string
          const dateStr = d.length > 7 ? d.substring(0, 7) : d
          grouped[dateStr] = (grouped[dateStr] || 0) + v
        }
      })
      const chartData = Object.entries(grouped)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date))
      if (chartData.length >= 2) {
        timeSeries.push({ dateCol, valueCol: numCol, data: chartData })
      }
    }
  }

  return {
    summary: {
      totalRows: data.rowCount,
      totalColumns: data.headers.length,
      numericColumns: numericCols,
      categoricalColumns: categoricalCols,
      dateColumns: dateCols,
    },
    numericStats,
    categoricalDistribution,
    topItems,
    correlations,
    timeSeries,
  }
}
