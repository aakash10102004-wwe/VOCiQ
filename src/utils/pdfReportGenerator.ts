import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { UploadedDataset } from '../context/DataContext'

const formatINR = (value: number) => {
  if (value >= 10000000) return `Rs.${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `Rs.${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `Rs.${(value / 1000).toFixed(1)}K`
  return `Rs.${value.toFixed(0)}`
}

export function generatePDFReport(
  businessData: UploadedDataset | null,
  staffData: UploadedDataset | null
): void {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 15

  const addTitle = (text: string) => {
    doc.setFontSize(13)
    doc.setTextColor(99, 102, 241)
    doc.setFont('helvetica', 'bold')
    doc.text(text, 14, y)
    y += 8
  }

  const addSubtext = (text: string) => {
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 140)
    doc.setFont('helvetica', 'normal')
    doc.text(text, 14, y)
    y += 5
  }

  const addLine = () => {
    doc.setDrawColor(220, 220, 230)
    doc.line(14, y, pageWidth - 14, y)
    y += 5
  }

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage()
      y = 15
    }
  }

  // ==================== HEADER ====================
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, pageWidth, 32, 'F')

  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('VOCiQ', 14, 14)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Premium Analytics Report', 14, 21)

  doc.setFontSize(8)
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  doc.text(`Generated: ${dateStr}`, 14, 27)

  if (businessData) {
    doc.text(`Source: ${businessData.fileName}`, pageWidth - 14, 21, { align: 'right' })
    doc.text(
      `${businessData.parsedData.rowCount.toLocaleString()} records | ${businessData.analysis.summary.totalColumns} columns`,
      pageWidth - 14, 27, { align: 'right' }
    )
  }
  y = 40

  // ==================== BUSINESS DATA REPORT ====================
  if (businessData) {
    const { analysis, parsedData } = businessData
    const { summary, numericStats, topItems, timeSeries, correlations } = analysis

    // Identify columns
    const valueCol = summary.numericColumns.find(c => /sale|revenue|amount|total|price/i.test(c)) || summary.numericColumns[0]
    const categoryCol = summary.categoricalColumns.find(c => /category|cat|type|group/i.test(c)) || summary.categoricalColumns[0]
    const productCol = summary.categoricalColumns.find(c => /product|item|name|sku/i.test(c)) || summary.categoricalColumns[1] || summary.categoricalColumns[0]
    const branchCol = summary.categoricalColumns.find(c => /branch|location|store|city/i.test(c))

    const stats = valueCol ? numericStats[valueCol] : null
    const totalRevenue = stats?.sum || 0
    const avgTransaction = stats?.mean || 0
    const maxTransaction = stats?.max || 0
    const minTransaction = stats?.min || 0

    // ---- EXECUTIVE SUMMARY ----
    addTitle('1. Executive Summary')

    const kpis = [
      ['Total Revenue', formatINR(totalRevenue)],
      ['Total Records', summary.totalRows.toLocaleString()],
      ['Avg. Value', formatINR(avgTransaction)],
      ['Max Value', formatINR(maxTransaction)],
      ['Min Value', formatINR(minTransaction)],
      ['Columns', String(summary.totalColumns)],
      ['Numeric Cols', String(summary.numericColumns.length)],
      ['Category Cols', String(summary.categoricalColumns.length)],
    ]

    const kpiBoxW = (pageWidth - 28 - 15) / 4
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = row * 4 + col
        if (idx >= kpis.length) break
        const bx = 14 + col * (kpiBoxW + 5)
        const by = y + row * 20

        doc.setFillColor(245, 245, 255)
        doc.roundedRect(bx, by, kpiBoxW, 16, 2, 2, 'F')

        doc.setFontSize(6.5)
        doc.setTextColor(130, 130, 150)
        doc.setFont('helvetica', 'normal')
        doc.text(kpis[idx][0], bx + kpiBoxW / 2, by + 5.5, { align: 'center' })

        doc.setFontSize(10)
        doc.setTextColor(40, 40, 60)
        doc.setFont('helvetica', 'bold')
        doc.text(kpis[idx][1], bx + kpiBoxW / 2, by + 12.5, { align: 'center' })
      }
    }
    y += 48
    addLine()

    // ---- CATEGORY BREAKDOWN ----
    if (categoryCol && topItems[categoryCol] && topItems[categoryCol].length > 0) {
      checkPage(60)
      addTitle('2. Category Performance')

      const catRows = topItems[categoryCol].map((item, i) => {
        let catRevenue = 0
        parsedData.rows.forEach(row => {
          if (row[categoryCol] === item.value && valueCol) {
            catRevenue += parseFloat(row[valueCol]) || 0
          }
        })
        const share = totalRevenue > 0 ? Math.round(catRevenue / totalRevenue * 100) : 0
        return [String(i + 1), item.value, item.count.toLocaleString(), formatINR(catRevenue), `${share}%`]
      })

      autoTable(doc, {
        startY: y,
        head: [['#', 'Category', 'Count', 'Revenue', 'Share %']],
        body: catRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: { 0: { cellWidth: 10 }, 4: { cellWidth: 18, halign: 'right' as const } },
      })
      y = (doc as any).lastAutoTable.finalY + 10
      addLine()
    }

    // ---- TOP PRODUCTS ----
    if (productCol && topItems[productCol] && topItems[productCol].length > 0) {
      checkPage(60)
      addTitle('3. Top Products / Items')

      const prodAgg: Record<string, { revenue: number; count: number; category: string }> = {}
      parsedData.rows.forEach(row => {
        const name = row[productCol]
        const val = valueCol ? parseFloat(row[valueCol]) || 0 : 0
        const cat = categoryCol ? row[categoryCol] || '-' : '-'
        if (name) {
          if (!prodAgg[name]) prodAgg[name] = { revenue: 0, count: 0, category: cat }
          prodAgg[name].revenue += val
          prodAgg[name].count++
        }
      })

      const topProds = Object.entries(prodAgg)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 15)

      const prodRows = topProds.map(([name, data], i) => [
        String(i + 1),
        name.substring(0, 28),
        data.category.substring(0, 15),
        data.count.toLocaleString(),
        formatINR(data.revenue),
        formatINR(data.count > 0 ? data.revenue / data.count : 0),
      ])

      autoTable(doc, {
        startY: y,
        head: [['#', 'Product', 'Category', 'Txns', 'Revenue', 'Avg Price']],
        body: prodRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5 },
        margin: { left: 14, right: 14 },
        columnStyles: { 0: { cellWidth: 8 } },
      })
      y = (doc as any).lastAutoTable.finalY + 10
      addLine()
    }

    // ---- BRANCH PERFORMANCE ----
    if (branchCol && topItems[branchCol] && topItems[branchCol].length > 0) {
      checkPage(50)
      addTitle('4. Branch / Location Performance')

      const branchRows = topItems[branchCol].map((item, i) => {
        let brRev = 0
        parsedData.rows.forEach(row => {
          if (row[branchCol] === item.value && valueCol) {
            brRev += parseFloat(row[valueCol]) || 0
          }
        })
        return [
          String(i + 1),
          item.value.substring(0, 25),
          item.count.toLocaleString(),
          formatINR(brRev),
          formatINR(item.count > 0 ? brRev / item.count : 0),
        ]
      })

      autoTable(doc, {
        startY: y,
        head: [['#', 'Branch', 'Transactions', 'Revenue', 'Avg Txn']],
        body: branchRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: { 0: { cellWidth: 10 } },
      })
      y = (doc as any).lastAutoTable.finalY + 10
      addLine()
    }

    // ---- NUMERIC STATS ----
    checkPage(50)
    addTitle('5. Numeric Column Statistics')

    const statsRows = summary.numericColumns.map(col => [
      col,
      (numericStats[col]?.min || 0).toLocaleString(),
      (numericStats[col]?.max || 0).toLocaleString(),
      Math.round((numericStats[col]?.mean || 0) * 100 / 100).toLocaleString(),
      Math.round(numericStats[col]?.sum || 0).toLocaleString(),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Column Name', 'Min', 'Max', 'Mean', 'Total (Sum)']],
      body: statsRows,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 10
    addLine()

    // ---- AI INSIGHTS ----
    checkPage(50)
    addTitle('6. AI-Generated Insights')

    const insights: string[] = []
    if (valueCol && stats) {
      insights.push(`Total revenue across all records: ${formatINR(totalRevenue)} with an average transaction value of ${formatINR(avgTransaction)}.`)
    }
    if (categoryCol && topItems[categoryCol]?.length > 0) {
      const topCat = topItems[categoryCol][0]
      insights.push(`"${topCat.value}" is the dominant category with ${topCat.count} transactions (${Math.round(topCat.count / summary.totalRows * 100)}% of all records).`)
    }
    if (branchCol && topItems[branchCol]?.length > 0) {
      insights.push(`Top performing location: "${topItems[branchCol][0].value}" with ${topItems[branchCol][0].count} transactions.`)
    }
    if (summary.dateColumns.length > 0) {
      insights.push(`Date/time data detected in column "${summary.dateColumns[0]}" — time-series forecasting is available.`)
    }
    if (productCol && topItems[productCol]?.length > 0) {
      insights.push(`"${topItems[productCol][0].value}" is the top-selling product/item by frequency.`)
    }
    insights.push(`Data quality: ${summary.totalColumns} columns detected (${summary.numericColumns.length} numeric, ${summary.categoricalColumns.length} categorical, ${summary.dateColumns.length} date).`)
    insights.push(`Recommendation: ${summary.totalRows < 100 ? 'Upload more records (500+) for statistically significant patterns.' : 'Dataset is sufficiently large for reliable analytics.'}`)

    doc.setFontSize(8.5)
    doc.setTextColor(50, 50, 70)
    doc.setFont('helvetica', 'normal')
    insights.forEach((insight, i) => {
      checkPage(8)
      const lines = doc.splitTextToSize(`${i + 1}. ${insight}`, pageWidth - 32)
      doc.text(lines, 16, y)
      y += lines.length * 4.5 + 2
    })
    y += 5
    addLine()

    // ---- RAW DATA SAMPLE ----
    checkPage(40)
    addTitle('7. Raw Data Sample (first 30 rows)')

    const rawHeaders = parsedData.headers.slice(0, 7)
    const rawRows = parsedData.rows.slice(0, 30).map(row =>
      rawHeaders.map(h => {
        const val = String(row[h] || '')
        return val.length > 18 ? val.substring(0, 16) + '..' : val
      })
    )

    autoTable(doc, {
      startY: y,
      head: [rawHeaders.map(h => h.length > 12 ? h.substring(0, 10) + '..' : h)],
      body: rawRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
      bodyStyles: { fontSize: 6 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 10

  } else {
    // No business data
    addTitle('No Data Uploaded')
    addSubtext('Upload a CSV on the Data Upload page to generate a full analytics report.')
    y += 10
  }

  // ==================== STAFF DATA ====================
  if (staffData) {
    doc.addPage()
    y = 15

    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, pageWidth, 12, 'F')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(`Staff Report — ${staffData.fileName}`, 14, 8)
    y = 20

    addTitle('Staff Database Overview')
    addSubtext(`${staffData.parsedData.rowCount} staff records | ${staffData.analysis.summary.totalColumns} columns`)
    y += 3

    const staffHeaders = staffData.parsedData.headers.slice(0, 8)
    const staffRows = staffData.parsedData.rows.slice(0, 50).map(row =>
      staffHeaders.map(h => {
        const val = String(row[h] || '')
        return val.length > 18 ? val.substring(0, 16) + '..' : val
      })
    )

    autoTable(doc, {
      startY: y,
      head: [staffHeaders.map(h => h.length > 12 ? h.substring(0, 10) + '..' : h)],
      body: staffRows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
      bodyStyles: { fontSize: 6 },
      margin: { left: 14, right: 14 },
    })
  }

  // ==================== FOOTER ON ALL PAGES ====================
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(160, 160, 170)
    doc.setFont('helvetica', 'normal')
    doc.text(`VOCiQ Premium Report — Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' })
    doc.text('Confidential — For internal use only', pageWidth / 2, 294, { align: 'center' })
  }

  // ==================== SAVE ====================
  const date = new Date().toISOString().slice(0, 10)
  const name = businessData
    ? `VOCiQ_Report_${businessData.fileName.replace(/\.[^.]+$/, '')}_${date}.pdf`
    : `VOCiQ_Demo_Report_${date}.pdf`

  doc.save(name)
}
