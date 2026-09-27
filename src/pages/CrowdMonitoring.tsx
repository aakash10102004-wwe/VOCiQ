import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Users, Clock, TrendingUp, MapPin, Upload, Video, Wifi, WifiOff, Eye, AlertTriangle, Monitor, Play, ChevronDown } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area, Legend, LineChart, Line
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ui/ChartCard'
import StatCard from '../components/ui/StatCard'
import PageHeader from '../components/ui/PageHeader'
import { useData } from '../context/DataContext'
import { crowdData as mockCrowdData} from '../data/mockData'

/* ─── Demo Camera Data ─── */
interface DemoCamera {
  id: string
  branch: string
  cameraName: string
  description: string
  baseVisitors: number
  densityLevel: 'Low' | 'Medium' | 'High'
  color: string
  noiseIntensity: number
}

const demoCameras: DemoCamera[] = [
  { id: 'andheri-entrance', branch: 'Andheri Store', cameraName: 'Entrance Camera', description: 'Store entrance crowd footage', baseVisitors: 32, densityLevel: 'Medium', color: '#6366f1', noiseIntensity: 0.15 },
  { id: 'andheri-billing', branch: 'Andheri Store', cameraName: 'Billing Counter Camera', description: 'Billing counter activity', baseVisitors: 18, densityLevel: 'Low', color: '#10b981', noiseIntensity: 0.2 },
  { id: 'andheri-aisle', branch: 'Andheri Store', cameraName: 'Aisle Camera', description: 'Main aisle foot traffic', baseVisitors: 24, densityLevel: 'Medium', color: '#a855f7', noiseIntensity: 0.18 },
  { id: 'bandra-entrance', branch: 'Bandra Store', cameraName: 'Entrance Camera', description: 'Shopping mall entrance footage', baseVisitors: 27, densityLevel: 'Medium', color: '#f59e0b', noiseIntensity: 0.12 },
  { id: 'bandra-floor', branch: 'Bandra Store', cameraName: 'Floor Camera', description: 'Main floor overview', baseVisitors: 35, densityLevel: 'High', color: '#ec4899', noiseIntensity: 0.16 },
  { id: 'pune-aisle', branch: 'Pune Store', cameraName: 'Aisle Camera', description: 'Store aisle walking footage', baseVisitors: 15, densityLevel: 'Low', color: '#06b6d4', noiseIntensity: 0.22 },
  { id: 'pune-entrance', branch: 'Pune Store', cameraName: 'Entrance Camera', description: 'Store entrance monitoring', baseVisitors: 21, densityLevel: 'Medium', color: '#84cc16', noiseIntensity: 0.14 },
  { id: 'pune-parking', branch: 'Pune Store', cameraName: 'Parking Camera', description: 'Parking lot overview', baseVisitors: 8, densityLevel: 'Low', color: '#64748b', noiseIntensity: 0.25 },
]

const branches = ['All Branches', 'Andheri Store', 'Bandra Store', 'Pune Store']

/* ─── CCTV Canvas Simulator ─── */
const CCTVCanvas: React.FC<{
  camera: DemoCamera
  visitors: number
  isActive: boolean
}> = ({ camera, visitors, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const dotsRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number }[]>([])
  const timeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isActive) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 480
    canvas.height = 270

    // Initialize moving people dots
    const numDots = Math.min(visitors, 40)
    dotsRef.current = Array.from({ length: numDots }, () => ({
      x: Math.random() * canvas.width,
      y: 80 + Math.random() * (canvas.height - 120),
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 0.8,
      size: 3 + Math.random() * 4
    }))

    const render = () => {
      timeRef.current++

      // Dark background with subtle gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, '#0a0f1a')
      grad.addColorStop(0.5, '#0d1320')
      grad.addColorStop(1, '#080c14')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Floor grid (perspective effect)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < 12; i++) {
        ctx.beginPath()
        ctx.moveTo(0, 80 + i * 18)
        ctx.lineTo(canvas.width, 80 + i * 18)
        ctx.stroke()
      }
      for (let i = 0; i < 16; i++) {
        ctx.beginPath()
        ctx.moveTo(i * 32, 80)
        ctx.lineTo(i * 32, canvas.height)
        ctx.stroke()
      }

      // Store shelves (rectangles)
      ctx.fillStyle = 'rgba(100, 116, 139, 0.15)'
      ctx.fillRect(20, 90, 60, 35)
      ctx.fillRect(120, 90, 60, 35)
      ctx.fillRect(220, 90, 60, 35)
      ctx.fillRect(340, 90, 90, 35)
      ctx.fillRect(20, 180, 80, 30)
      ctx.fillRect(150, 180, 60, 30)
      ctx.fillRect(350, 170, 100, 40)

      // Moving people (dots with glow)
      dotsRef.current.forEach(dot => {
        dot.x += dot.vx
        dot.y += dot.vy

        // Bounce off walls
        if (dot.x < 10 || dot.x > canvas.width - 10) dot.vx *= -1
        if (dot.y < 80 || dot.y > canvas.height - 30) dot.vy *= -1

        // Slight random direction changes
        if (Math.random() < 0.02) {
          dot.vx += (Math.random() - 0.5) * 0.5
          dot.vy += (Math.random() - 0.5) * 0.3
        }

        // Person glow
        const glowGrad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 3)
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)')
        glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)')
        ctx.fillStyle = glowGrad
        ctx.fillRect(dot.x - dot.size * 3, dot.y - dot.size * 3, dot.size * 6, dot.size * 6)

        // Person dot
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(168, 180, 255, ${0.6 + Math.random() * 0.3})`
        ctx.fill()
      })

      // CCTV scan line
      const scanY = (timeRef.current * 1.5) % canvas.height
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(canvas.width, scanY)
      ctx.stroke()

      // Noise overlay
      const noiseIntensity = camera.noiseIntensity
      for (let i = 0; i < 150; i++) {
        const nx = Math.random() * canvas.width
        const ny = Math.random() * canvas.height
        const alpha = Math.random() * noiseIntensity
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fillRect(nx, ny, 1, 1)
      }

      // Vignette
      const vigGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      )
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = vigGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Timestamp overlay
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false })
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

      ctx.font = '11px "Courier New", monospace'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillText(`${dateStr}  ${timeStr}`, 10, 18)
      ctx.fillText(camera.cameraName.toUpperCase(), 10, 32)

      // REC indicator (blinking)
      if (Math.floor(timeRef.current / 30) % 2 === 0) {
        ctx.beginPath()
        ctx.arc(canvas.width - 20, 16, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ef4444'
        ctx.fill()
        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = '#ef4444'
        ctx.fillText('REC', canvas.width - 52, 20)
      }

      // Visitor count overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(canvas.width - 90, canvas.height - 30, 80, 22)
      ctx.font = 'bold 12px "Courier New", monospace'
      ctx.fillStyle = '#10b981'
      ctx.fillText(`👥 ${visitors}`, canvas.width - 82, canvas.height - 14)

      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frameRef.current)
  }, [camera, visitors, isActive])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

/* ─── Crowd Density Badge ─── */
const DensityBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' }> = ({ level }) => {
  const config = {
    Low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    High: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  }[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {level}
    </span>
  )
}

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl backdrop-blur-xl bg-slate-900/90">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name}:</span>
          <span className="text-white font-semibold">{e.value?.toLocaleString?.('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Simulated Hourly Data for Demo Cameras ─── */
const generateHourlyData = () => {
  const hours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM']
  return hours.map(hour => ({
    hour,
    andheri: Math.floor(20 + Math.random() * 60),
    bandra: Math.floor(15 + Math.random() * 50),
    pune: Math.floor(10 + Math.random() * 35),
    total: 0,
  })).map(d => ({ ...d, total: d.andheri + d.bandra + d.pune }))
}

const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const mockHours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM']

const getHeatColor = (val: number, max: number) => {
  const ratio = val / max
  if (ratio > 0.8) return '#ef4444'
  if (ratio > 0.6) return '#f97316'
  if (ratio > 0.4) return '#f59e0b'
  if (ratio > 0.2) return '#22c55e'
  return '#1e293b'
}

const CrowdMonitoring: React.FC = () => {
  const { businessData } = useData()
  const navigate = useNavigate()
  const hasData = !!businessData

  const [demoMode, setDemoMode] = useState(false)
  const [branchFilter, setBranchFilter] = useState('All Branches')
  const [liveVisitors, setLiveVisitors] = useState<Record<string, number>>({})
  const [liveDensity, setLiveDensity] = useState<Record<string, 'Low' | 'Medium' | 'High'>>({})
  const [hourlyData] = useState(generateHourlyData)

  // Initialize and update live visitor counts every 3 seconds
  useEffect(() => {
    if (!demoMode) return

    const updateVisitors = () => {
      const newVisitors: Record<string, number> = {}
      const newDensity: Record<string, 'Low' | 'Medium' | 'High'> = {}
      demoCameras.forEach(cam => {
        const variation = Math.floor(Math.random() * 12) - 5
        const count = Math.max(3, cam.baseVisitors + variation)
        newVisitors[cam.id] = count
        newDensity[cam.id] = count > 30 ? 'High' : count > 18 ? 'Medium' : 'Low'
      })
      setLiveVisitors(newVisitors)
      setLiveDensity(newDensity)
    }

    updateVisitors()
    const interval = setInterval(updateVisitors, 3000)
    return () => clearInterval(interval)
  }, [demoMode])

  // Filtered cameras
  const filteredCameras = useMemo(() => {
    if (branchFilter === 'All Branches') return demoCameras
    return demoCameras.filter(c => c.branch === branchFilter)
  }, [branchFilter])

  // Derive crowd data from CSV
  const derived = useMemo(() => {
    if (!businessData) return null
    const { analysis, parsedData } = businessData
    const { summary } = analysis

    const hourCol = summary.categoricalColumns.find(c => /hour|time|period/i.test(c)) || summary.dateColumns[0]
    const visitorCol = summary.numericColumns.find(c => /visitor|count|traffic|crowd|footfall/i.test(c)) || summary.numericColumns[0]
    const dayCol = summary.categoricalColumns.find(c => /day|weekday|day_of_week/i.test(c))

    if (!visitorCol) return null

    if (hourCol) {
      const hourAgg: Record<string, number> = {}
      parsedData.rows.forEach(row => {
        const h = row[hourCol]
        const v = parseFloat(row[visitorCol]) || 0
        if (h) hourAgg[h] = (hourAgg[h] || 0) + v
      })
      const hourlyData = Object.entries(hourAgg)
        .map(([hour, visitors]) => ({ hour, visitors: Math.round(visitors) }))
        .sort((a, b) => a.hour.localeCompare(b.hour))

      const peakHour = hourlyData.reduce((max, h) => h.visitors > max.visitors ? h : max, hourlyData[0])
      const totalVisitors = hourlyData.reduce((a, b) => a + b.visitors, 0)
      return { hourlyData, peakHour: peakHour?.hour || '-', totalVisitors, type: 'hourly' as const }
    }

    if (dayCol) {
      const dayAgg: Record<string, number> = {}
      parsedData.rows.forEach(row => {
        const d = row[dayCol]
        const v = parseFloat(row[visitorCol]) || 0
        if (d) dayAgg[d] = (dayAgg[d] || 0) + v
      })
      const dailyData = Object.entries(dayAgg)
        .map(([day, visitors]) => ({ day, visitors: Math.round(visitors) }))
        .sort((a, b) => b.visitors - a.visitors)

      return { dailyData, busiestDay: dailyData[0]?.day || '-', totalVisitors: dailyData.reduce((a, b) => a + b.visitors, 0), type: 'daily' as const }
    }

    const totalVisitors = parsedData.rows.reduce((sum, row) => sum + (parseFloat(row[visitorCol]) || 0), 0)
    return { totalVisitors: Math.round(totalVisitors), type: 'simple' as const }
  }, [businessData])

  // Total live visitors across all demo cameras
  const totalLiveVisitors = Object.values(liveVisitors).reduce((a, b) => a + b, 0)
  const activeCamCount = filteredCameras.length

  // Heatmap data
  const heatmapMatrix = mockHours.map((_, hi) => {
    const row = mockCrowdData.hourlyData[hi] || {} as any
    return mockDays.map((_, di) => {
      const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sum']
      return (row as any)[keys[di]] || 0
    })
  })
  const maxVal = Math.max(...heatmapMatrix.flat())

  // Branch comparison data for demo
  const branchComparisonData = useMemo(() => {
    if (!demoMode) return []
    const branchTotals: Record<string, number> = {}
    demoCameras.forEach(cam => {
      branchTotals[cam.branch] = (branchTotals[cam.branch] || 0) + (liveVisitors[cam.id] || cam.baseVisitors)
    })
    return Object.entries(branchTotals)
      .map(([name, visitors]) => ({ name: name.replace(' Store', ''), visitors }))
      .sort((a, b) => b.visitors - a.visitors)
  }, [demoMode, liveVisitors])

  return (
    <div className="space-y-7">
      <PageHeader
        title="Crowd Monitoring"
        subtitle={demoMode
          ? `Live demo monitoring · ${activeCamCount} cameras active`
          : hasData && derived
            ? `Visitor patterns from ${businessData.fileName}`
            : 'Real-time visitor tracking and traffic pattern analysis'
        }
        icon={<Users className="w-6 h-6 text-emerald-400" />}
        badge={demoMode ? 'Demo Mode' : hasData && derived ? 'CSV Data' : 'Demo'}
        badgeColor="emerald"
        actions={
          <div className="flex items-center gap-2">
            {!demoMode && (
              <button onClick={() => setDemoMode(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
                <Play className="w-3.5 h-3.5" /> Use Demo Cameras
              </button>
            )}
            {demoMode && (
              <button onClick={() => setDemoMode(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20">
                <WifiOff className="w-3.5 h-3.5" /> Exit Demo
              </button>
            )}
            {!hasData && !demoMode && (
              <button onClick={() => navigate('/upload')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload CSV
              </button>
            )}
          </div>
        }
      />

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Monitor className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
              <span className="font-semibold text-emerald-400">Demo Mode Active</span> — You are currently viewing demo camera feeds. Connect your CCTV cameras to enable real-time monitoring.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeCamCount} Active
          </div>
        </div>
      )}

      {!hasData && !demoMode && (
        <div onClick={() => navigate('/upload')}
          className="p-3 rounded-xl bg-gradient-to-r from-emerald-600/10 to-primary-600/10 border border-primary-500/20 cursor-pointer hover:border-primary-500/40 transition-all">
          <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Upload CSV with visitor/traffic data for real crowd analysis, or try Demo Cameras
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Visitors" value={demoMode ? totalLiveVisitors : derived?.totalVisitors || mockCrowdData.avgDailyVisitors * 8} icon={Users} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
        <StatCard title={demoMode ? 'Active Cameras' : 'Current In-Store'} value={demoMode ? activeCamCount : (hasData ? Math.round((derived?.totalVisitors || 0) / 10) : 1247)} icon={demoMode ? Video : MapPin} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
        <StatCard title="Peak Hour" value={derived?.type === 'hourly' ? (derived as any).peakHour : '6 PM'} icon={Clock} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
        <StatCard title="Busiest Day" value={derived?.type === 'daily' ? (derived as any).busiestDay : mockCrowdData.busiestDay} icon={TrendingUp} iconColor="text-purple-400" iconBg="bg-purple-500/10" />
      </div>

      {/* ═══════ DEMO CAMERA SECTION ═══════ */}
      {demoMode && (
        <>
          {/* Branch Filter */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              <h3 className="text-lg font-bold dark:text-white text-slate-900 font-display">Live Camera Feeds</h3>
            </div>
            <div className="relative">
              <select
                value={branchFilter}
                onChange={e => setBranchFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm dark:bg-white/5 bg-slate-100 dark:text-white text-slate-900 dark:border-white/10 border-slate-200 border focus:border-emerald-500/50 outline-none cursor-pointer min-w-[160px]"
              >
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 dark:text-slate-400 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Camera Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCameras.map(camera => {
              const visitors = liveVisitors[camera.id] || camera.baseVisitors
              const density = liveDensity[camera.id] || camera.densityLevel
              return (
                <div key={camera.id}
                  className="rounded-2xl overflow-hidden border dark:border-white/10 border-slate-200 dark:bg-slate-900/50 bg-white shadow-lg hover:shadow-xl transition-all group">
                  {/* Video Feed */}
                  <div className="relative aspect-video bg-black">
                    <CCTVCanvas camera={camera} visitors={visitors} isActive={demoMode} />
                    {/* Status overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white backdrop-blur-sm">
                        <Wifi className="w-2.5 h-2.5" /> Demo Mode
                      </span>
                    </div>
                  </div>
                  {/* Camera Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold dark:text-white text-slate-900">{camera.branch}</h4>
                        <p className="text-xs dark:text-slate-400 text-slate-500">{camera.cameraName}</p>
                      </div>
                      <DensityBadge level={density} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-sm font-bold dark:text-white text-slate-900">
                          <Eye className="w-4 h-4 text-emerald-400" />
                          <span className="tabular-nums">{visitors}</span>
                        </div>
                        <span className="text-xs dark:text-slate-500 text-slate-400">visitors</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs dark:text-slate-500 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </div>
                    </div>
                    {/* Mini density bar */}
                    <div className="h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        density === 'High' ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                        density === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`} style={{ width: `${Math.min(100, (visitors / 45) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Demo Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Hourly Visitor Trend */}
            <ChartCard title="Hourly Visitor Trend" subtitle="Simulated visitor count by hour (demo)">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="andheriGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bandraGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="puneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="andheri" name="Andheri" stroke="#6366f1" fill="url(#andheriGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="bandra" name="Bandra" stroke="#10b981" fill="url(#bandraGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="pune" name="Pune" stroke="#f59e0b" fill="url(#puneGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Branch Comparison */}
            <ChartCard title="Branch Traffic Comparison" subtitle="Live visitor count by branch">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={branchComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="visitors" name="Visitors" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {branchComparisonData.map((_, i) => (
                      <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b'][i % 3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* ═══════ CSV / MOCK DATA CHARTS ═══════ */}

      {/* CSV hourly chart */}
      {derived?.type === 'hourly' && (
        <ChartCard title="Visitor Flow by Hour" subtitle="From uploaded CSV data">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={(derived as any).hourlyData}>
              <defs>
                <linearGradient id="csvCrowdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#10b981" fill="url(#csvCrowdGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* CSV daily chart */}
      {derived?.type === 'daily' && (
        <ChartCard title="Visitors by Day" subtitle="From uploaded CSV data">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(derived as any).dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visitors" name="Visitors" radius={[6, 6, 0, 0]}>
                {(derived as any).dailyData.map((_: any, i: number) => (
                  <Cell key={i} fill={`hsl(${160 + i * 15}, 70%, ${55 - i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Mock hourly chart - only when no demo mode and no CSV */}
      {(!hasData || !derived || derived.type === 'simple') && !demoMode && (
        <ChartCard title="Today's Hourly Visitor Flow" subtitle="Average vs peak Saturday traffic (demo)" filters={['Today', 'Avg Week', 'Peak Day']}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockCrowdData.hourlyData.map(h => ({
              hour: h.hour,
              visitors: ((h as any).mon + (h as any).tue + (h as any).wed + (h as any).thu + (h as any).fri + (h as any).sat + (h as any).sum) / 7 | 0,
              peak: (h as any).sat,
            }))}>
              <defs>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="visitors" name="Avg Visitors" stroke="#10b981" fill="url(#avgGrad)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="peak" name="Peak (Sat)" stroke="#ef4444" fill="url(#peakGrad)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Weekly Heatmap - always show unless demo mode */}
      {(!demoMode) && (!hasData || !derived || derived.type === 'simple') && (
        <ChartCard title="Weekly Traffic Heatmap" subtitle="Visitor intensity by hour and day (demo)">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex ml-16 mb-2">
                {mockDays.map(d => (
                  <div key={d} className="flex-1 text-center text-xs font-semibold dark:text-slate-400 text-slate-500">{d}</div>
                ))}
              </div>
              {heatmapMatrix.map((row, hi) => (
                <div key={hi} className="flex items-center mb-1.5">
                  <div className="w-14 text-xs dark:text-slate-500 text-slate-400 text-right pr-2 flex-shrink-0">{mockHours[hi]}</div>
                  {row.map((val, di) => (
                    <div key={di} className="flex-1 mx-0.5">
                      <div
                        className="h-8 rounded-md flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: getHeatColor(val, maxVal), opacity: val === 0 ? 0.3 : 1 }}
                        title={`${mockHours[hi]} ${mockDays[di]}: ${val} visitors`}
                      >
                        {val > 200 ? val : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center gap-3 mt-4 ml-16">
                <span className="text-xs dark:text-slate-400 text-slate-500">Low</span>
                {['#1e293b', '#22c55e', '#f59e0b', '#f97316', '#ef4444'].map(c => (
                  <div key={c} className="w-8 h-3 rounded" style={{ backgroundColor: c }} />
                ))}
                <span className="text-xs dark:text-slate-400 text-slate-500">High</span>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Demo mode heatmap */}
      {demoMode && (
        <ChartCard title="Weekly Traffic Heatmap" subtitle="Simulated visitor intensity by hour and day">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex ml-16 mb-2">
                {mockDays.map(d => (
                  <div key={d} className="flex-1 text-center text-xs font-semibold dark:text-slate-400 text-slate-500">{d}</div>
                ))}
              </div>
              {heatmapMatrix.map((row, hi) => (
                <div key={hi} className="flex items-center mb-1.5">
                  <div className="w-14 text-xs dark:text-slate-500 text-slate-400 text-right pr-2 flex-shrink-0">{mockHours[hi]}</div>
                  {row.map((val, di) => (
                    <div key={di} className="flex-1 mx-0.5">
                      <div
                        className="h-8 rounded-md flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: getHeatColor(val, maxVal), opacity: val === 0 ? 0.3 : 1 }}
                        title={`${mockHours[hi]} ${mockDays[di]}: ${val} visitors`}
                      >
                        {val > 200 ? val : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center gap-3 mt-4 ml-16">
                <span className="text-xs dark:text-slate-400 text-slate-500">Low</span>
                {['#1e293b', '#22c55e', '#f59e0b', '#f97316', '#ef4444'].map(c => (
                  <div key={c} className="w-8 h-3 rounded" style={{ backgroundColor: c }} />
                ))}
                <span className="text-xs dark:text-slate-400 text-slate-500">High</span>
              </div>
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  )
}

export default CrowdMonitoring
