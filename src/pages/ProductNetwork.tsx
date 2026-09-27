import React, { useState, useMemo } from 'react'
import { Globe, Link, Search, Zap, Target, BarChart3, ArrowUpRight, X, ShoppingCart, Sparkles, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { useData } from '../context/DataContext'
import { productRelationships as mockRelationships } from '../data/mockData'

// ─── Types ─────────────────────────────────────────────────────────────
interface Relationship {
  source: string
  target: string
  strength: number
  sourceCategory: string
  targetCategory: string
  coPurchaseCount: number
  avgBasketValue: number
  liftScore: number
}

// ─── Category Colors & Config ──────────────────────────────────────────
const CATEGORY_COLORS = [
  { color: '#6366f1', gradient: ['#6366f1', '#818cf8'] as [string, string] },
  { color: '#a855f7', gradient: ['#a855f7', '#c084fc'] as [string, string] },
  { color: '#10b981', gradient: ['#10b981', '#34d399'] as [string, string] },
  { color: '#ec4899', gradient: ['#ec4899', '#f472b6'] as [string, string] },
  { color: '#06b6d4', gradient: ['#06b6d4', '#22d3ee'] as [string, string] },
  { color: '#f59e0b', gradient: ['#f59e0b', '#fbbf24'] as [string, string] },
  { color: '#ef4444', gradient: ['#ef4444', '#f87171'] as [string, string] },
  { color: '#84cc16', gradient: ['#84cc16', '#a3e635'] as [string, string] },
]

const DEFAULT_CATEGORY_CONFIG: Record<string, { color: string; gradient: [string, string]; label: string }> = {
  Electronics: { color: '#6366f1', gradient: ['#6366f1', '#818cf8'], label: 'Electronics' },
  Fashion:     { color: '#a855f7', gradient: ['#a855f7', '#c084fc'], label: 'Fashion' },
  Grocery:     { color: '#10b981', gradient: ['#10b981', '#34d399'], label: 'Grocery' },
  Beauty:      { color: '#ec4899', gradient: ['#ec4899', '#f472b6'], label: 'Beauty' },
  Eyewear:     { color: '#06b6d4', gradient: ['#06b6d4', '#22d3ee'], label: 'Eyewear' },
}

const getStrengthTier = (s: number) => {
  if (s >= 0.85) return { label: 'Very Strong', color: '#6366f1', badge: 'info' as const }
  if (s >= 0.70) return { label: 'Strong', color: '#10b981', badge: 'success' as const }
  if (s >= 0.55) return { label: 'Moderate', color: '#f59e0b', badge: 'warning' as const }
  return { label: 'Weak', color: '#64748b', badge: 'default' as const }
}

// ─── Force-Directed Positioning ────────────────────────────────────────
const computeNodePositions = (
  nodes: string[],
  edges: Relationship[],
  categoryConfig: Record<string, { color: string; gradient: [string, string]; label: string }>,
  getNodeCat: (n: string) => string
) => {
  // Build category cluster centers dynamically
  const categories = Array.from(new Set(nodes.map(n => getNodeCat(n))))
  const catCenters: Record<string, { cx: number; cy: number }> = {}
  categories.forEach((cat, i) => {
    const angle = (i / Math.max(categories.length, 1)) * 2 * Math.PI - Math.PI / 2
    const radius = 22
    catCenters[cat] = {
      cx: 50 + radius * Math.cos(angle),
      cy: 50 + radius * Math.sin(angle),
    }
  })

  const positions: Record<string, { x: number; y: number }> = {}
  const categoryIndex: Record<string, number> = {}

  nodes.forEach((node) => {
    const cat = getNodeCat(node)
    if (!categoryIndex[cat]) categoryIndex[cat] = 0
    const idx = categoryIndex[cat]++
    const offset = catCenters[cat] || { cx: 50, cy: 50 }
    const angle = (idx / 4) * 2 * Math.PI + Math.random() * 0.5
    const spread = 10 + Math.random() * 5
    positions[node] = {
      x: Math.max(10, Math.min(90, offset.cx + spread * Math.cos(angle))),
      y: Math.max(10, Math.min(90, offset.cy + spread * Math.sin(angle))),
    }
  })

  // Simple force simulation (20 iterations)
  for (let iter = 0; iter < 20; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = positions[nodes[i]]
        const b = positions[nodes[j]]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const force = 15 / (dist * dist)
        a.x += (dx / dist) * force
        a.y += (dy / dist) * force
        b.x -= (dx / dist) * force
        b.y -= (dy / dist) * force
      }
    }
    edges.forEach(edge => {
      const a = positions[edge.source]
      const b = positions[edge.target]
      if (!a || !b) return
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const force = (dist - 18) * 0.02 * edge.strength
      a.x += (dx / dist) * force
      a.y += (dy / dist) * force
      b.x -= (dx / dist) * force
      b.y -= (dy / dist) * force
    })
    nodes.forEach(node => {
      positions[node].x = Math.max(8, Math.min(92, positions[node].x))
      positions[node].y = Math.max(8, Math.min(88, positions[node].y))
    })
  }

  return positions
}

// ─── Derive relationships from CSV data ────────────────────────────────
function deriveRelationshipsFromCSV(
  rows: Record<string, string>[],
  productCol: string,
  categoryCol: string | null,
  valueCol: string | null,
  groupCol: string | null
): Relationship[] {
  // Group rows by transaction/group key or treat each row as containing one product
  // If a group column exists (invoice, transaction_id, order_id), group products by it
  // Otherwise, try to find product co-occurrence patterns from category proximity

  const productCounts: Record<string, number> = {}
  const productCategories: Record<string, string> = {}
  const productValues: Record<string, number[]> = {}
  const pairCounts: Record<string, number> = {}
  const pairValues: Record<string, number[]> = {}

  // First pass: count products and assign categories
  rows.forEach(row => {
    const product = row[productCol]?.trim()
    if (!product) return
    productCounts[product] = (productCounts[product] || 0) + 1
    if (categoryCol && row[categoryCol]) {
      productCategories[product] = row[categoryCol].trim()
    }
    if (valueCol) {
      const val = parseFloat(row[valueCol])
      if (!isNaN(val)) {
        if (!productValues[product]) productValues[product] = []
        productValues[product].push(val)
      }
    }
  })

  if (groupCol) {
    // Group by transaction and find co-occurring products
    const groups: Record<string, { products: string[]; totalValue: number }> = {}
    rows.forEach(row => {
      const key = row[groupCol]?.trim()
      const product = row[productCol]?.trim()
      if (!key || !product) return
      if (!groups[key]) groups[key] = { products: [], totalValue: 0 }
      if (!groups[key].products.includes(product)) {
        groups[key].products.push(product)
      }
      if (valueCol) {
        const val = parseFloat(row[valueCol])
        if (!isNaN(val)) groups[key].totalValue += val
      }
    })

    // Count pairs from transaction groups
    Object.values(groups).forEach(({ products, totalValue }) => {
      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          const pairKey = [products[i], products[j]].sort().join('|||')
          pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1
          if (!pairValues[pairKey]) pairValues[pairKey] = []
          pairValues[pairKey].push(totalValue / products.length)
        }
      }
    })
  } else {
    // No group column: use category-based co-occurrence (products in same category likely bought together)
    const categoryProducts: Record<string, string[]> = {}
    Object.entries(productCategories).forEach(([product, cat]) => {
      if (!categoryProducts[cat]) categoryProducts[cat] = []
      if (!categoryProducts[cat].includes(product)) {
        categoryProducts[cat].push(product)
      }
    })

    Object.values(categoryProducts).forEach(products => {
      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          const pairKey = [products[i], products[j]].sort().join('|||')
          const countA = productCounts[products[i]] || 1
          const countB = productCounts[products[j]] || 1
          // Synthetic co-purchase count based on min of both counts
          pairCounts[pairKey] = Math.min(countA, countB)
          const avgValA = productValues[products[i]]
            ? productValues[products[i]].reduce((a, b) => a + b, 0) / productValues[products[i]].length
            : 0
          const avgValB = productValues[products[j]]
            ? productValues[products[j]].reduce((a, b) => a + b, 0) / productValues[products[j]].length
            : 0
          pairValues[pairKey] = [avgValA + avgValB]
        }
      }
    })
  }

  // Convert to Relationship array
  const allPairs = Object.entries(pairCounts)
  if (allPairs.length === 0) return []

  const maxCount = Math.max(...allPairs.map(([, c]) => c))
  const totalTransactions = groupCol
    ? new Set(rows.map(r => r[groupCol]?.trim()).filter(Boolean)).size
    : rows.length

  const relationships: Relationship[] = allPairs
    .sort(([, a], [, b]) => b - a)
    .slice(0, 25) // Top 25 pairs
    .map(([pairKey, count]) => {
      const [source, target] = pairKey.split('|||')
      const strength = Math.min(0.98, 0.4 + (count / maxCount) * 0.58)
      const avgBasketValue = pairValues[pairKey]
        ? Math.round(pairValues[pairKey].reduce((a, b) => a + b, 0) / pairValues[pairKey].length)
        : 0
      const supportA = (productCounts[source] || 1) / totalTransactions
      const supportB = (productCounts[target] || 1) / totalTransactions
      const supportAB = count / totalTransactions
      const lift = supportA > 0 && supportB > 0 ? Math.round((supportAB / (supportA * supportB)) * 10) / 10 : 1.0

      return {
        source,
        target,
        strength,
        sourceCategory: productCategories[source] || 'Other',
        targetCategory: productCategories[target] || 'Other',
        coPurchaseCount: count,
        avgBasketValue,
        liftScore: Math.max(1.0, lift),
      }
    })

  return relationships
}

// ─── Main Component ────────────────────────────────────────────────────
const ProductNetwork: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData

  const [selected, setSelected] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // ─── Derive relationships from CSV or use mock ─────────────────────
  const { relationships, categoryConfig } = useMemo(() => {
    if (!businessData) {
      return { relationships: mockRelationships as Relationship[], categoryConfig: DEFAULT_CATEGORY_CONFIG }
    }

    const { analysis, parsedData } = businessData
    const { summary } = analysis

    // Auto-detect product column
    const productCol = summary.categoricalColumns.find(c => /product|item|name|sku/i.test(c))
      || summary.categoricalColumns[0]
    // Auto-detect category column
    const categoryCol = summary.categoricalColumns.find(c => /category|cat|type|group|department/i.test(c))
      || (summary.categoricalColumns.length > 1 ? summary.categoricalColumns[1] : null)
    // Auto-detect value column
    const valueCol = summary.numericColumns.find(c => /sale|revenue|amount|price|total|quantity|value/i.test(c))
      || summary.numericColumns[0] || null
    // Auto-detect transaction/group column
    const groupCol = summary.categoricalColumns.find(c => /invoice|transaction|order|bill|receipt|id/i.test(c))
      || null

    if (!productCol) {
      return { relationships: mockRelationships as Relationship[], categoryConfig: DEFAULT_CATEGORY_CONFIG }
    }

    const derived = deriveRelationshipsFromCSV(parsedData.rows, productCol, categoryCol, valueCol, groupCol)

    if (derived.length === 0) {
      return { relationships: mockRelationships as Relationship[], categoryConfig: DEFAULT_CATEGORY_CONFIG }
    }

    // Build dynamic category config from the derived data
    const allCategories = Array.from(new Set(derived.flatMap(r => [r.sourceCategory, r.targetCategory])))
    const dynConfig: Record<string, { color: string; gradient: [string, string]; label: string }> = {}
    allCategories.forEach((cat, i) => {
      const preset = DEFAULT_CATEGORY_CONFIG[cat]
      if (preset) {
        dynConfig[cat] = preset
      } else {
        const c = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
        dynConfig[cat] = { color: c.color, gradient: c.gradient, label: cat }
      }
    })

    return { relationships: derived, categoryConfig: dynConfig }
  }, [businessData])

  // ─── Node category lookup (uses current relationships) ─────────────
  const getNodeCategory = (nodeName: string): string => {
    for (const rel of relationships) {
      if (rel.source === nodeName) return rel.sourceCategory
      if (rel.target === nodeName) return rel.targetCategory
    }
    return 'Other'
  }

  // Derive all unique nodes
  const allNodes = useMemo(() =>
    Array.from(new Set(relationships.flatMap(r => [r.source, r.target]))),
    [relationships]
  )

  // Compute the layout
  const nodePositions = useMemo(
    () => computeNodePositions(allNodes, relationships, categoryConfig, getNodeCategory),
    [allNodes, relationships, categoryConfig]
  )

  // ─── KPI calculations ─────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalAssociations = relationships.length
    const sorted = [...relationships].sort((a, b) => b.strength - a.strength)
    const strongest = sorted[0]
    const avgStrength = relationships.reduce((s, r) => s + r.strength, 0) / totalAssociations
    const totalRevenuePotential = relationships.reduce((s, r) => s + r.avgBasketValue * r.coPurchaseCount, 0)
    const totalCoPurchases = relationships.reduce((s, r) => s + r.coPurchaseCount, 0)
    return { totalAssociations, strongest, avgStrength, totalRevenuePotential, totalCoPurchases }
  }, [relationships])

  // ─── Filtered relationships ────────────────────────────────────────
  const filtered = relationships.filter(r =>
    !searchQuery ||
    r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.target.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const highlighted = selected
    ? relationships.filter(r => r.source === selected || r.target === selected)
    : filtered

  // ─── Node helpers ──────────────────────────────────────────────────
  const getConnections = (node: string) =>
    relationships.filter(r => r.source === node || r.target === node)

  const isNodeConnected = (node: string) => {
    if (!selected) return true
    if (node === selected) return true
    return relationships.some(
      r => (r.source === selected || r.target === selected) && (r.source === node || r.target === node)
    )
  }

  // ─── Selected node stats ──────────────────────────────────────────
  const selectedNodeStats = useMemo(() => {
    if (!selected) return null
    const connections = getConnections(selected)
    const category = getNodeCategory(selected)
    const totalCoPurchases = connections.reduce((s, r) => s + r.coPurchaseCount, 0)
    const avgStrength = connections.reduce((s, r) => s + r.strength, 0) / connections.length
    const totalRevenue = connections.reduce((s, r) => s + r.avgBasketValue * r.coPurchaseCount, 0)
    return { connections, category, totalCoPurchases, avgStrength, totalRevenue }
  }, [selected, relationships])

  // Format revenue value smartly
  const formatRevenue = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
    return `₹${val.toLocaleString('en-IN')}`
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Product Relationship Network"
        subtitle={hasData
          ? `Product associations from ${businessData.fileName} · ${businessData.analysis.summary.totalRows} records`
          : 'Visualize products frequently bought together and cross-sell opportunities'
        }
        icon={<Globe className="w-6 h-6 text-indigo-400" />}
        badge={hasData ? 'CSV Data' : 'Demo'}
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

      {/* Upload prompt */}
      {!hasData && (
        <div
          onClick={() => navigate('/upload')}
          className="p-3 rounded-xl bg-gradient-to-r from-indigo-600/10 to-primary-600/10 border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-all"
        >
          <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Upload a CSV to see product network from your real data · Currently showing demo
          </p>
        </div>
      )}

      {/* ─── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all duration-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Link className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Total Associations</span>
          </div>
          <p className="text-2xl font-bold dark:text-white text-slate-900">{kpis.totalAssociations}</p>
          <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">product pairs detected</p>
        </div>

        <div className="metric-card group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Strongest Pair</span>
          </div>
          <p className="text-lg font-bold dark:text-white text-slate-900">{kpis.strongest.source} + {kpis.strongest.target}</p>
          <p className="text-xs text-emerald-400 mt-1 font-semibold">{(kpis.strongest.strength * 100).toFixed(0)}% strength</p>
        </div>

        <div className="metric-card group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-all duration-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Avg Strength</span>
          </div>
          <p className="text-2xl font-bold dark:text-white text-slate-900">{(kpis.avgStrength * 100).toFixed(1)}%</p>
          <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">across all pairs</p>
        </div>

        <div className="metric-card group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs dark:text-slate-400 text-slate-500 font-medium">Cross-sell Potential</span>
          </div>
          <p className="text-2xl font-bold dark:text-white text-slate-900">
            {formatRevenue(kpis.totalRevenuePotential)}
          </p>
          <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">{kpis.totalCoPurchases.toLocaleString('en-IN')} co-purchases</p>
        </div>
      </div>

      {/* ─── Main Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── Network Graph ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <ChartCard title="Product Co-purchase Network" subtitle="Interactive force-directed graph · Click nodes to explore">
            <style>{`
              @keyframes dashFlow {
                to { stroke-dashoffset: -20; }
              }
              @keyframes nodePulse {
                0%, 100% { opacity: 0.4; r: inherit; }
                50% { opacity: 0.15; }
              }
              .edge-animated {
                animation: dashFlow 1.5s linear infinite;
              }
              .node-glow {
                animation: nodePulse 2.5s ease-in-out infinite;
              }
            `}</style>
            <div className="relative w-full" style={{ paddingBottom: '70%' }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 96">
                <defs>
                  {/* Category gradients */}
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <radialGradient key={key} id={`grad-${key}`} cx="30%" cy="30%">
                      <stop offset="0%" stopColor={cfg.gradient[1]} />
                      <stop offset="100%" stopColor={cfg.gradient[0]} />
                    </radialGradient>
                  ))}
                  {/* Glow filter */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Edges */}
                {highlighted.map((rel, i) => {
                  const from = nodePositions[rel.source]
                  const to = nodePositions[rel.target]
                  if (!from || !to) return null
                  const isActive = !selected || rel.source === selected || rel.target === selected
                  const mx = (from.x + to.x) / 2
                  const my = (from.y + to.y) / 2
                  const dx = to.x - from.x
                  const dy = to.y - from.y
                  const dist = Math.sqrt(dx * dx + dy * dy)
                  const curveOffset = Math.min(dist * 0.25, 8)
                  const cx = mx + (-dy / dist) * curveOffset
                  const cy = my + (dx / dist) * curveOffset
                  const tier = getStrengthTier(rel.strength)
                  return (
                    <path
                      key={i}
                      d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                      fill="none"
                      stroke={tier.color}
                      strokeWidth={0.3 + rel.strength * 0.7}
                      strokeOpacity={isActive ? 0.7 : 0.08}
                      strokeDasharray={isActive ? '3 2' : 'none'}
                      className={isActive ? 'edge-animated' : ''}
                      style={{ transition: 'stroke-opacity 0.4s ease' }}
                    />
                  )
                })}

                {/* Nodes */}
                {allNodes.map(node => {
                  const pos = nodePositions[node]
                  const connections = getConnections(node).length
                  const r = 2.2 + connections * 0.4
                  const isSelected = selected === node
                  const isHovered = hoveredNode === node
                  const connected = isNodeConnected(node)
                  const cat = getNodeCategory(node)
                  const catCfg = categoryConfig[cat] || { color: '#64748b', gradient: ['#64748b', '#94a3b8'] as [string, string], label: cat }
                  return (
                    <g
                      key={node}
                      className="cursor-pointer"
                      onClick={() => setSelected(isSelected ? null : node)}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ transition: 'opacity 0.4s ease' }}
                      opacity={connected ? 1 : 0.15}
                    >
                      {(isSelected || isHovered) && (
                        <circle
                          cx={pos.x} cy={pos.y} r={r + 3}
                          fill="none"
                          stroke={catCfg.color}
                          strokeWidth={0.3}
                          className="node-glow"
                        />
                      )}
                      <circle
                        cx={pos.x} cy={pos.y} r={r + 1}
                        fill={catCfg.color}
                        opacity={isSelected ? 0.35 : isHovered ? 0.2 : 0}
                        style={{ transition: 'opacity 0.3s ease' }}
                      />
                      <circle
                        cx={pos.x} cy={pos.y} r={r}
                        fill={`url(#grad-${cat})`}
                        stroke={isSelected ? '#fff' : catCfg.color}
                        strokeWidth={isSelected ? 0.6 : 0.3}
                        filter={isSelected || isHovered ? 'url(#glow)' : undefined}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                      <circle
                        cx={pos.x - r * 0.25} cy={pos.y - r * 0.25} r={r * 0.35}
                        fill="rgba(255,255,255,0.25)"
                      />
                      <text
                        x={pos.x} y={pos.y + r + 2.8}
                        textAnchor="middle"
                        fontSize="2.2"
                        fontWeight={isSelected ? '700' : '500'}
                        fill={isSelected ? '#fff' : connected ? '#94a3b8' : '#475569'}
                        style={{ transition: 'fill 0.3s ease', pointerEvents: 'none' }}
                      >
                        {node.length > 12 ? node.slice(0, 11) + '…' : node}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* ─── Legends ──────────────────────────────────────────── */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-xs dark:text-slate-400 text-slate-500">{cfg.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs dark:text-slate-500 text-slate-400">Weak</span>
                <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #64748b, #f59e0b, #10b981, #6366f1)' }} />
                <span className="text-xs dark:text-slate-500 text-slate-400">Strong</span>
              </div>
            </div>

            <p className="text-xs dark:text-slate-500 text-slate-400 text-center mt-3">
              {hasData ? 'Relationships derived from your CSV data · ' : ''}Click a node to explore its connections · Node size reflects connection count
            </p>
          </ChartCard>
        </div>

        {/* ─── Right Sidebar ────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* ── Selected Node Detail Panel ───────────────────────────── */}
          {selected && selectedNodeStats && (
            <ChartCard title={selected} subtitle={`${selectedNodeStats.category} Product`}
              actions={
                <button onClick={() => setSelected(null)} className="w-6 h-6 rounded-lg dark:bg-white/5 bg-slate-100 flex items-center justify-center dark:hover:bg-white/10 hover:bg-slate-200 transition-colors">
                  <X className="w-3 h-3 dark:text-slate-400 text-slate-500" />
                </button>
              }
            >
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2.5 rounded-xl dark:bg-white/5 bg-slate-50 text-center">
                  <p className="text-lg font-bold dark:text-white text-slate-900">{selectedNodeStats.connections.length}</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Links</p>
                </div>
                <div className="p-2.5 rounded-xl dark:bg-white/5 bg-slate-50 text-center">
                  <p className="text-lg font-bold text-emerald-400">{(selectedNodeStats.avgStrength * 100).toFixed(0)}%</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Avg Str.</p>
                </div>
                <div className="p-2.5 rounded-xl dark:bg-white/5 bg-slate-50 text-center">
                  <p className="text-sm font-bold dark:text-white text-slate-900">{selectedNodeStats.totalCoPurchases.toLocaleString('en-IN')}</p>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Co-buys</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r dark:from-indigo-500/10 dark:to-purple-500/10 from-indigo-50 to-purple-50 border dark:border-indigo-500/20 border-indigo-200 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-xs dark:text-slate-300 text-slate-700 font-medium">Cross-sell Revenue Potential</p>
                  <p className="text-sm font-bold text-indigo-400">{formatRevenue(selectedNodeStats.totalRevenue)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold dark:text-slate-300 text-slate-600 uppercase tracking-wider">Connected Products</h4>
                {selectedNodeStats.connections
                  .sort((a, b) => b.strength - a.strength)
                  .map((r, i) => {
                    const partner = r.source === selected ? r.target : r.source
                    const partnerCat = r.source === selected ? r.targetCategory : r.sourceCategory
                    const tier = getStrengthTier(r.strength)
                    const catCfg = categoryConfig[partnerCat] || { color: '#64748b', gradient: ['#64748b', '#94a3b8'] as [string, string], label: partnerCat }
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-xl dark:bg-white/5 bg-slate-50 dark:hover:bg-white/8 hover:bg-slate-100 transition-all cursor-pointer"
                        onClick={() => setSelected(partner)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${catCfg.color}15` }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: catCfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium dark:text-white text-slate-900 truncate">{partner}</p>
                            <ArrowUpRight className="w-3 h-3 dark:text-slate-500 text-slate-400 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${r.strength * 100}%`, backgroundColor: tier.color }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: tier.color }}>{(r.strength * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold dark:text-slate-300 text-slate-600">{r.liftScore}x</p>
                          <p className="text-xs dark:text-slate-500 text-slate-400">lift</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ChartCard>
          )}

          {/* ── Top Associations ─────────────────────────────────────── */}
          <ChartCard title="Top Associations" subtitle="Ranked by strength score"
            actions={
              <div className="flex items-center gap-1.5 text-xs dark:text-slate-400 text-slate-500">
                <ShoppingCart className="w-3.5 h-3.5" /> {kpis.totalCoPurchases.toLocaleString('en-IN')} pairs
              </div>
            }
          >
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 dark:text-slate-500 text-slate-400" />
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {[...filtered]
                .sort((a, b) => b.strength - a.strength)
                .map((rel, i) => {
                  const tier = getStrengthTier(rel.strength)
                  const isActive = selected === rel.source || selected === rel.target
                  const srcCfg = categoryConfig[rel.sourceCategory] || { color: '#64748b', gradient: ['#64748b', '#94a3b8'] as [string, string], label: rel.sourceCategory }
                  const tgtCfg = categoryConfig[rel.targetCategory] || { color: '#64748b', gradient: ['#64748b', '#94a3b8'] as [string, string], label: rel.targetCategory }
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-200
                        ${isActive
                          ? 'dark:bg-primary-500/10 bg-primary-50 border border-primary-500/20 shadow-sm'
                          : 'dark:hover:bg-white/5 hover:bg-slate-50 border border-transparent'
                        }`}
                      onClick={() => setSelected(selected === rel.source ? null : rel.source)}
                    >
                      <div className="w-5 h-5 rounded-md dark:bg-white/5 bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold dark:text-slate-400 text-slate-500">#{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: srcCfg.color }} />
                          <span className="text-xs font-medium dark:text-white text-slate-900 truncate">{rel.source}</span>
                          <span className="text-xs dark:text-slate-500 text-slate-400">↔</span>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tgtCfg.color }} />
                          <span className="text-xs font-medium dark:text-white text-slate-900 truncate">{rel.target}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${rel.strength * 100}%`, backgroundColor: tier.color }}
                            />
                          </div>
                          <span className="text-xs font-bold" style={{ color: tier.color }}>
                            {(rel.strength * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <p className="text-xs font-semibold dark:text-slate-300 text-slate-600">{rel.liftScore}x lift</p>
                        <p className="text-xs dark:text-slate-500 text-slate-400">{rel.coPurchaseCount} buys</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

export default ProductNetwork
