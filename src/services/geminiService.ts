import {
  dashboardKPIs,
  branchPerformanceData,
  productCategoryData,
  topProducts,
  inventoryData,
  crowdData,
  staffData as mockStaffData,
  festivalData,
  competitorData,
  expansionRecommendations,
  businessHealthData,
} from '../data/mockData'
import type { UploadedDataset } from '../context/DataContext'

export interface ChatMessage {
  id: number
  text: string
  isBot: boolean
  navigateTo?: string
  label?: string
  timestamp?: Date
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Models to try in order of preference
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest']

/**
 * Builds the comprehensive retail data context for Gemini
 */
export function buildRetailContext(
  businessInfo?: { name: string; city: string; storeType: string; gstId: string } | null,
  businessData?: UploadedDataset | null,
  uploadedStaffData?: UploadedDataset | null
): string {
  let context = `=== VOCIQ PLATFORM RETAIL CONTEXT ===\n`

  if (businessInfo) {
    context += `Active Business: ${businessInfo.name} | City: ${businessInfo.city} | Store Type: ${businessInfo.storeType} | GSTIN: ${businessInfo.gstId}\n\n`
  }

  context += `--- CURRENT STORE METRICS & KPIS ---
• Total Sales: ₹${dashboardKPIs.totalSales.toLocaleString('en-IN')} (+${dashboardKPIs.salesChange}%)
• Total Footfall/Visitors: ${dashboardKPIs.totalVisitors.toLocaleString('en-IN')} (+${dashboardKPIs.visitorsChange}%)
• Average Order Value (AOV): ₹${dashboardKPIs.avgOrderValue} (+${dashboardKPIs.avgOrderChange}%)
• Store Conversion Rate: ${dashboardKPIs.conversionRate}% (+${dashboardKPIs.conversionChange}%)
• Inventory Alerts: ${dashboardKPIs.inventoryAlerts} low-stock items
• Staff Alerts: ${dashboardKPIs.staffAlerts} understaffed shifts
• Top Performing Branch: ${dashboardKPIs.topBranch} (Sales: ₹${dashboardKPIs.topBranchSales.toLocaleString('en-IN')})
• Peak Hours: ${crowdData.peakHours.join(', ')} | Busiest Day: ${crowdData.busiestDay}\n\n`

  context += `--- BRANCH PERFORMANCE (8 CITIES) ---
${branchPerformanceData
  .map(
    b =>
      `• ${b.name}: Sales ₹${b.sales.toLocaleString('en-IN')}, Visitors: ${b.visitors.toLocaleString(
        'en-IN'
      )}, Staff: ${b.staff}, Customer Rating: ${b.rating}★`
  )
  .join('\n')}\n\n`

  context += `--- TOP SELLING PRODUCTS ---
${topProducts
  .map(
    p =>
      `• ${p.name} (${p.category}): Units Sold ${p.sales.toLocaleString('en-IN')}, Revenue ₹${p.revenue.toLocaleString(
        'en-IN'
      )}, Trend +${p.trend}%`
  )
  .join('\n')}\n\n`

  context += `--- CATEGORY SALES SHARE ---
${productCategoryData.map(c => `• ${c.name}: ${c.value}%`).join(', ')}\n\n`

  context += `--- INVENTORY HEALTH ALERTS ---
${inventoryData
  .filter(i => i.status !== 'healthy')
  .map(i => `• ${i.product} at ${i.branch}: Stock ${i.stock} (Min: ${i.minStock}) — ${i.status.toUpperCase()} ALERT`)
  .join('\n')}\n\n`

  context += `--- AI EXPANSION RECOMMENDATIONS (BRANCH PREDICTOR) ---
${expansionRecommendations
  .map(
    e =>
      `• ${e.city}: Expansion Score ${e.score}/100 | Demand: ${e.demand} | Competition: ${e.competition} | Population: ${e.population} | Reason: ${e.reason}`
  )
  .join('\n')}\n\n`

  context += `--- UPCOMING FESTIVAL DEMAND FORECAST ---
${festivalData
  .map(
    f =>
      `• ${f.festival} (${f.month}): Expected Growth +${f.predictedGrowth}%, Multiplier: ${f.salesMultiplier}x, Top Category: ${f.topCategory}`
  )
  .join('\n')}\n\n`

  context += `--- COMPETITOR BENCHMARK PRICING ---
${competitorData
  .map(
    c =>
      `• ${c.product}: Our Price ₹${c.ourPrice.toLocaleString('en-IN')} vs Amazon ₹${c.amazon.toLocaleString(
        'en-IN'
      )} / Flipkart ₹${c.flipkart.toLocaleString('en-IN')} (Strategy: ${c.recommendation})`
  )
  .join('\n')}\n\n`

  context += `--- BUSINESS HEALTH SCORE ---
• Overall Score: ${businessHealthData.overallScore}/100
${businessHealthData.factors.map(f => `• ${f.name}: Score ${f.score}/100 (${f.trend})`).join('\n')}
AI Suggestions: ${businessHealthData.suggestions.join('; ')}\n\n`

  context += `--- STAFFING OPTIMIZATION ---
${mockStaffData
  .map(
    s =>
      `• ${s.branch}: Current Staff ${s.currentStaff} vs Recommended ${s.recommended} (Efficiency: ${s.efficiency}%, Rate: ${s.customersPerHour} cust/hr)`
  )
  .join('\n')}\n\n`

  // Include uploaded business CSV analysis if present
  if (businessData) {
    context += `--- USER UPLOADED DATASET: "${businessData.fileName}" ---
Total Rows: ${businessData.parsedData.rowCount} rows across ${businessData.parsedData.columns.length} columns.
Columns: ${businessData.parsedData.headers.join(', ')}\n`

    if (businessData.analysis?.numericStats) {
      context += `Numeric Column Stats:\n`
      for (const [col, stats] of Object.entries(businessData.analysis.numericStats)) {
        context += `  • ${col}: Total Sum = ${stats.sum.toLocaleString('en-IN')}, Mean = ${Math.round(
          stats.mean
        )}, Min = ${stats.min}, Max = ${stats.max}\n`
      }
    }

    if (businessData.analysis?.topItems) {
      context += `Top Categorical Items:\n`
      for (const [col, items] of Object.entries(businessData.analysis.topItems)) {
        const top3 = items.slice(0, 3).map(i => `${i.value} (${i.count})`).join(', ')
        context += `  • ${col}: ${top3}\n`
      }
    }
    context += '\n'
  }

  // Include uploaded staff CSV analysis if present
  if (uploadedStaffData) {
    context += `--- USER UPLOADED STAFF DATA: "${uploadedStaffData.fileName}" ---
Total Staff Records: ${uploadedStaffData.parsedData.rowCount}
Columns: ${uploadedStaffData.parsedData.headers.join(', ')}\n\n`
  }

  return context
}

/**
 * Sends conversation to Gemini and returns parsed response with optional navigation
 */
export async function askGeminiAssistant(
  userQuery: string,
  history: ChatMessage[],
  businessInfo?: { name: string; city: string; storeType: string; gstId: string } | null,
  businessData?: UploadedDataset | null,
  staffData?: UploadedDataset | null
): Promise<{ text: string; navigateTo?: string; label?: string }> {
  if (!GEMINI_API_KEY) {
    return {
      text: 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.',
    }
  }

  const retailData = buildRetailContext(businessInfo, businessData, staffData)

  const systemPrompt = `You are VOCiQ AI Copilot, an elite retail intelligence analyst and strategic advisor for Indian retail stores and multi-branch businesses.
You have real-time access to the business's actual retail data, metrics, KPIs, competitor intel, branch scores, festival forecasts, and any uploaded datasets provided below:

${retailData}

GUIDELINES:
1. Always base your answers on the provided data whenever relevant. Cite real numbers, percentages, branch names, and product categories.
2. Format financial figures in Indian Rupee format (e.g. ₹8,47,520, ₹2.34 Lakhs).
3. Be concise, sharp, and business-focused (use bullet points or bold text where appropriate for scannability).
4. If the user asks about navigating, viewing, or opening a specific section, or if your answer heavily refers to a section, append exactly one navigation tag at the very end of your response:
   - Overview Dashboard: [NAVIGATE: /]
   - Crowd / CCTV / Footfall / Heatmaps: [NAVIGATE: /crowd-analytics]
   - Sales / Customer Insights / Journey / Products: [NAVIGATE: /sales]
   - Competitor Intelligence: [NAVIGATE: /competitors]
   - Predictions & Recommendations / Branch Predictor: [NAVIGATE: /predictions]
   - Upload Dataset / Custom CSV Analysis: [NAVIGATE: /dataset]
   - Settings: [NAVIGATE: /settings]
   Only add [NAVIGATE: /path] if relevant. Do not include brackets if no navigation is appropriate.`

  // Prepare recent conversation contents (last 6 turns for speed & context)
  const recentHistory = history.slice(-6)
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `${systemPrompt}\n\nUser Question: ${userQuery}`,
        },
      ],
    },
  ]

  // Add conversation turns if multi-turn
  if (recentHistory.length > 0) {
    const chatTurns: { role: string; parts: { text: string }[] }[] = []
    chatTurns.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nPlease acknowledge your role as VOCiQ AI Copilot.` }],
    })
    chatTurns.push({
      role: 'model',
      parts: [{ text: `I am ready as your VOCiQ AI Copilot. Ask me anything about your retail data!` }],
    })

    for (const msg of recentHistory) {
      if (msg.id === 0) continue // Skip initial greeting
      chatTurns.push({
        role: msg.isBot ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })
    }

    chatTurns.push({
      role: 'user',
      parts: [{ text: userQuery }],
    })

    contents.splice(0, contents.length, ...chatTurns)
  }

  let lastError = ''

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        lastError = errJson?.error?.message || `HTTP ${res.status}`
        continue
      }

      const data = await res.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!rawText) {
        continue
      }

      // Check for [NAVIGATE: /path] tag
      const navMatch = rawText.match(/\[NAVIGATE:\s*(\/[a-zA-Z0-9\-_/]*)\]/)
      let cleanedText = rawText.replace(/\[NAVIGATE:\s*\/[a-zA-Z0-9\-_/]*\]/g, '').trim()
      let navigateTo: string | undefined = undefined
      let label: string | undefined = undefined

      if (navMatch && navMatch[1]) {
        const route = navMatch[1]
        navigateTo = route
        const routeLabels: Record<string, string> = {
          '/': 'Overview Dashboard',
          '/crowd-analytics': 'Crowd Analytics',
          '/sales': 'Sales & Customer Insights',
          '/competitors': 'Competitor Intelligence',
          '/predictions': 'Predictions & Recommendations',
          '/dataset': 'Dataset Analysis',
          '/settings': 'Settings',
        }
        label = routeLabels[route] || 'Requested Page'
      }

      return {
        text: cleanedText,
        navigateTo,
        label,
      }
    } catch (err: any) {
      lastError = err?.message || String(err)
    }
  }

  return {
    text: `Sorry, I encountered an issue connecting to Gemini AI (${lastError}). Please verify your network and Gemini API key.`,
  }
}
