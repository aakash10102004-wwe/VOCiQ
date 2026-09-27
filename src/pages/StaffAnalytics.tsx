import React, { useState, useMemo } from 'react'
import {
  UserCheck, Users, TrendingUp, Clock, Upload, Award, Calendar,
  Search, ChevronDown, ChevronUp, Star, Building2, Filter
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import CsvUploadWidget from '../components/ui/CsvUploadWidget'
import { useData } from '../context/DataContext'
import { staffData as mockStaffData } from '../data/mockData'

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-slate-300">{e.name}:</span>
          <span className="text-white font-semibold">{e.value}{e.name === 'Efficiency' || e.name === 'Rating' ? '' : ''}</span>
        </div>
      ))}
    </div>
  )
}

// Helper to calculate years from a date string to now
const yearsFromDate = (dateStr: string): number => {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 0
    const diff = Date.now() - d.getTime()
    return Math.max(0, Math.round(diff / (365.25 * 24 * 60 * 60 * 1000) * 10) / 10)
  } catch { return 0 }
}

interface StaffMember {
  [key: string]: string
}

type SortDir = 'asc' | 'desc'

const StaffAnalytics: React.FC = () => {
  const { staffData, setStaffData } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortCol, setSortCol] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showPromoOnly, setShowPromoOnly] = useState(false)

  const hasData = !!staffData

  // Column detection helpers
  const colMap = useMemo(() => {
    if (!staffData) return { name: '', dept: '', joining: '', role: '', branch: '', salary: '', rating: '', id: '' }
    const cols = staffData.parsedData.headers
    const find = (patterns: RegExp[]) => cols.find(c => patterns.some(p => p.test(c.toLowerCase()))) || ''
    return {
      name: find([/name/, /employee/, /staff/]),
      dept: find([/dept/, /department/, /division/, /team/]),
      joining: find([/join/, /date/, /hire/, /start/]),
      role: find([/role/, /position/, /title/, /designation/]),
      branch: find([/branch/, /location/, /office/, /city/]),
      salary: find([/salary/, /pay/, /wage/, /compensation/, /ctc/]),
      rating: find([/rating/, /performance/, /score/, /review/]),
      id: find([/id/, /emp_id/, /employee_id/, /staff_id/]),
    }
  }, [staffData])

  // Derive all staff analytics
  const analytics = useMemo(() => {
    if (!staffData) return null
    const rows = staffData.parsedData.rows

    // Parse staff members with enriched data
    const members = rows.map((row, idx) => {
      const joiningDate = colMap.joining ? row[colMap.joining] : ''
      const tenure = joiningDate ? yearsFromDate(joiningDate) : 0
      const rating = colMap.rating ? parseFloat(row[colMap.rating]) || 0 : 0
      const salary = colMap.salary ? parseFloat(row[colMap.salary]) || 0 : 0
      const name = colMap.name ? row[colMap.name] : `Staff #${idx + 1}`
      const dept = colMap.dept ? row[colMap.dept] : 'Unknown'
      const role = colMap.role ? row[colMap.role] : '-'
      const branch = colMap.branch ? row[colMap.branch] : '-'

      // Promotion eligibility: tenure >= 2 years AND rating >= 4 (on 5-point scale)
      const maxRating = rows.reduce((max, r) => {
        const v = colMap.rating ? parseFloat(r[colMap.rating]) || 0 : 0
        return v > max ? v : max
      }, 0)
      const normalizedRating = maxRating > 0 ? (rating / maxRating) * 5 : 0
      const promotionEligible = tenure >= 2 && normalizedRating >= 4

      return { name, dept, role, branch, joiningDate, tenure, salary, rating, normalizedRating, promotionEligible, raw: row, idx }
    })

    // KPIs
    const totalStaff = members.length
    const avgTenure = members.length > 0
      ? Math.round(members.reduce((a, b) => a + b.tenure, 0) / members.length * 10) / 10
      : 0
    const promoReady = members.filter(m => m.promotionEligible).length
    const avgSalary = colMap.salary && members.length > 0
      ? Math.round(members.reduce((a, b) => a + b.salary, 0) / members.length)
      : 0

    // Department distribution
    const deptCount: Record<string, number> = {}
    members.forEach(m => { deptCount[m.dept] = (deptCount[m.dept] || 0) + 1 })
    const deptPieData = Object.entries(deptCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))

    // Joining by month/year
    const joiningByMonth: Record<string, number> = {}
    members.forEach(m => {
      if (m.joiningDate) {
        const d = new Date(m.joiningDate)
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          joiningByMonth[key] = (joiningByMonth[key] || 0) + 1
        }
      }
    })
    const joiningTrend = Object.entries(joiningByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))

    // Performance rating distribution
    const ratingBuckets: Record<string, number> = {}
    if (colMap.rating) {
      members.forEach(m => {
        const bucket = m.rating >= 4.5 ? 'Excellent (4.5+)' :
                       m.rating >= 3.5 ? 'Good (3.5-4.5)' :
                       m.rating >= 2.5 ? 'Average (2.5-3.5)' :
                       m.rating > 0 ? 'Below Avg (<2.5)' : 'N/A'
        ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1
      })
    }
    const ratingData = Object.entries(ratingBuckets)
      .filter(([k]) => k !== 'N/A')
      .map(([name, count]) => ({ name, count }))

    // Tenure by department
    const deptTenure: Record<string, number[]> = {}
    members.forEach(m => {
      if (!deptTenure[m.dept]) deptTenure[m.dept] = []
      deptTenure[m.dept].push(m.tenure)
    })
    const tenureByDept = Object.entries(deptTenure)
      .map(([dept, tenures]) => ({
        dept,
        avgTenure: Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length * 10) / 10,
        count: tenures.length,
      }))
      .sort((a, b) => b.avgTenure - a.avgTenure)

    // All unique departments
    const allDepts = ['All', ...Object.keys(deptCount).sort()]

    return {
      members, totalStaff, avgTenure, promoReady, avgSalary,
      deptPieData, joiningTrend, ratingData, tenureByDept, allDepts,
    }
  }, [staffData, colMap])

  // Filtered + sorted members for table
  const displayMembers = useMemo(() => {
    if (!analytics) return []
    let list = [...analytics.members]

    // Department filter
    if (deptFilter !== 'All') {
      list = list.filter(m => m.dept === deptFilter)
    }

    // Promotion only
    if (showPromoOnly) {
      list = list.filter(m => m.promotionEligible)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.dept.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.branch.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortCol) {
      list.sort((a: any, b: any) => {
        const aVal = a[sortCol]
        const bVal = b[sortCol]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal))
      })
    }

    return list
  }, [analytics, deptFilter, showPromoOnly, searchQuery, sortCol, sortDir])

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: string }) => (
    sortCol === col
      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
      : <ChevronDown className="w-3 h-3 opacity-30" />
  )

  // Mock data view (when no staff CSV uploaded)
  const mockStaffForecastData = [
    { hour: '9AM', needed: 12, actual: 10, efficiency: 83 },
    { hour: '10AM', needed: 18, actual: 16, efficiency: 89 },
    { hour: '11AM', needed: 22, actual: 20, efficiency: 91 },
    { hour: '12PM', needed: 28, actual: 25, efficiency: 89 },
    { hour: '1PM', needed: 30, actual: 28, efficiency: 93 },
    { hour: '2PM', needed: 25, actual: 25, efficiency: 100 },
    { hour: '3PM', needed: 22, actual: 22, efficiency: 100 },
    { hour: '4PM', needed: 26, actual: 24, efficiency: 92 },
    { hour: '5PM', needed: 35, actual: 30, efficiency: 86 },
    { hour: '6PM', needed: 40, actual: 35, efficiency: 88 },
    { hour: '7PM', needed: 38, actual: 36, efficiency: 95 },
    { hour: '8PM', needed: 28, actual: 28, efficiency: 100 },
  ]

  return (
    <div className="space-y-7">
      <PageHeader
        title="Staff Analytics"
        subtitle={hasData
          ? `Staff database loaded from ${staffData.fileName} · ${analytics?.totalStaff} members`
          : 'Employee productivity, staffing optimization, and service capacity'
        }
        icon={<UserCheck className="w-6 h-6 text-cyan-400" />}
        badge={hasData ? 'CSV Loaded' : 'Upload Required'}
        badgeColor={hasData ? 'primary' : 'amber'}
      />

      {/* Staff CSV Upload */}
      <CsvUploadWidget
        label="Upload Staff CSV"
        description="Upload staff database CSV with columns like name, department, joining_date, role, salary, performance_rating"
        sampleColumns={['name', 'department', 'joining_date', 'role', 'branch', 'salary', 'rating']}
        loadedFileName={staffData?.fileName}
        onDataLoaded={(parsed, analysis, fileName) => {
          setStaffData({ fileName, parsedData: parsed, analysis, uploadedAt: new Date() })
        }}
        onDataCleared={() => setStaffData(null)}
      />

      {/* === CSV DATA VIEW === */}
      {hasData && analytics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Staff" value={analytics.totalStaff} icon={Users} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
            <StatCard title="Avg Tenure" value={analytics.avgTenure} suffix=" yrs" icon={Calendar} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
            <StatCard title="Promotion Ready" value={analytics.promoReady} icon={Award} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
            {analytics.avgSalary > 0 && (
              <StatCard title="Avg Salary" value={analytics.avgSalary} prefix="₹" icon={TrendingUp} iconColor="text-purple-400" iconBg="bg-purple-500/10" />
            )}
          </div>

          {/* Charts Row: Department Distribution + Joining Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Department Pie */}
            <ChartCard title="Department Distribution" subtitle="Staff count by department">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={analytics.deptPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                    {analytics.deptPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [value, 'Staff']}
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {analytics.deptPieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1 text-xs dark:text-slate-400 text-slate-500">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Joining Trend */}
            <div className="lg:col-span-2">
              <ChartCard title="Staff Joining Trend" subtitle="Hiring patterns over time">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={analytics.joiningTrend}>
                    <defs>
                      <linearGradient id="joinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Joinings" stroke="#6366f1" fill="url(#joinGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* Charts Row: Rating Distribution + Tenure by Department */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {analytics.ratingData.length > 0 && (
              <ChartCard title="Performance Rating Distribution" subtitle="Staff grouped by rating buckets">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={analytics.ratingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Staff Count" radius={[6, 6, 0, 0]}>
                      {analytics.ratingData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            <ChartCard title="Avg Tenure by Department" subtitle="Years of service comparison">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.tenureByDept} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}yr`} />
                  <YAxis type="category" dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgTenure" name="Avg Tenure (yrs)" radius={[0, 6, 6, 0]}>
                    {analytics.tenureByDept.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Promotion Eligibility Section */}
          <ChartCard
            title="🏆 Promotion Eligibility Analysis"
            subtitle="AI-calculated based on tenure (≥2 years) and performance rating (≥80%)"
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="success">{analytics.promoReady} eligible</Badge>
                <Badge variant="default">{analytics.totalStaff - analytics.promoReady} not ready</Badge>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.members.filter(m => m.promotionEligible).slice(0, 12).map((m, i) => (
                <div key={i} className="p-3 rounded-xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200 hover:dark:border-primary-500/30 hover:border-primary-400 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold dark:text-white text-slate-900">{m.name}</p>
                      <p className="text-xs dark:text-slate-400 text-slate-500">{m.role} · {m.dept}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-400">{m.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs dark:text-slate-400 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {m.tenure} yrs
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {m.branch}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Badge variant="success" dot>Promotion Ready</Badge>
                  </div>
                </div>
              ))}
            </div>
            {analytics.members.filter(m => m.promotionEligible).length > 12 && (
              <p className="text-xs dark:text-slate-400 text-slate-500 mt-3 text-center">
                +{analytics.members.filter(m => m.promotionEligible).length - 12} more eligible staff members
              </p>
            )}
          </ChartCard>

          {/* Staff Database Table */}
          <ChartCard
            title="Staff Database"
            subtitle={`${displayMembers.length} of ${analytics.totalStaff} staff shown`}
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPromoOnly(!showPromoOnly)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    showPromoOnly ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'dark:text-slate-400 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  Promo Ready
                </button>
              </div>
            }
          >
            {/* Search + Filter */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-500 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, department, role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm dark:bg-white/5 bg-slate-100 dark:text-white text-slate-900 dark:border-white/10 border-slate-200 border focus:border-primary-500/50 outline-none transition-all"
                />
              </div>
              {analytics.allDepts.length > 2 && (
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm dark:bg-white/5 bg-slate-100 dark:text-white text-slate-900 dark:border-white/10 border-slate-200 border focus:border-primary-500/50 outline-none cursor-pointer"
                >
                  {analytics.allDepts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th className="cursor-pointer" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">Name <SortIcon col="name" /></div>
                    </th>
                    <th className="cursor-pointer" onClick={() => toggleSort('dept')}>
                      <div className="flex items-center gap-1">Department <SortIcon col="dept" /></div>
                    </th>
                    <th className="cursor-pointer" onClick={() => toggleSort('role')}>
                      <div className="flex items-center gap-1">Role <SortIcon col="role" /></div>
                    </th>
                    <th>Branch</th>
                    <th className="cursor-pointer" onClick={() => toggleSort('tenure')}>
                      <div className="flex items-center gap-1">Tenure <SortIcon col="tenure" /></div>
                    </th>
                    {colMap.rating && (
                      <th className="cursor-pointer" onClick={() => toggleSort('rating')}>
                        <div className="flex items-center gap-1">Rating <SortIcon col="rating" /></div>
                      </th>
                    )}
                    {colMap.salary && (
                      <th className="cursor-pointer" onClick={() => toggleSort('salary')}>
                        <div className="flex items-center gap-1">Salary <SortIcon col="salary" /></div>
                      </th>
                    )}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayMembers.slice(0, 50).map((m, i) => (
                    <tr key={m.idx}>
                      <td className="dark:text-slate-500 text-slate-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                      <td className="dark:text-white text-slate-900 font-medium">{m.name}</td>
                      <td>
                        <Badge variant={
                          m.dept === analytics.deptPieData[0]?.name ? 'info' :
                          m.dept === analytics.deptPieData[1]?.name ? 'purple' : 'default'
                        }>
                          {m.dept}
                        </Badge>
                      </td>
                      <td className="dark:text-slate-300 text-slate-700 text-xs">{m.role}</td>
                      <td className="dark:text-slate-300 text-slate-700 text-xs">{m.branch}</td>
                      <td className="dark:text-slate-300 text-slate-700">
                        <span className="text-xs font-medium">{m.tenure} yrs</span>
                      </td>
                      {colMap.rating && (
                        <td>
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${m.rating >= 4 ? 'text-amber-400 fill-amber-400' : 'dark:text-slate-500 text-slate-400'}`} />
                            <span className="text-xs font-medium dark:text-white text-slate-900">{m.rating}</span>
                          </div>
                        </td>
                      )}
                      {colMap.salary && (
                        <td className="dark:text-slate-300 text-slate-700 font-medium text-xs">
                          ₹{m.salary.toLocaleString('en-IN')}
                        </td>
                      )}
                      <td>
                        {m.promotionEligible ? (
                          <Badge variant="success" dot>Promo Ready</Badge>
                        ) : m.tenure >= 2 ? (
                          <Badge variant="warning">Need Rating</Badge>
                        ) : (
                          <Badge variant="default">Growing</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {displayMembers.length > 50 && (
              <p className="text-xs dark:text-slate-400 text-slate-500 mt-3 text-center">
                Showing 50 of {displayMembers.length} results
              </p>
            )}
          </ChartCard>
        </>
      )}

      {/* === MOCK DATA VIEW (no CSV uploaded) === */}
      {!hasData && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Staff" value={mockStaffData.reduce((a, b) => a + b.currentStaff, 0)} icon={Users} iconColor="text-blue-400" iconBg="bg-blue-500/10" />
            <StatCard title="Recommended" value={mockStaffData.reduce((a, b) => a + b.recommended, 0)} icon={UserCheck} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
            <StatCard title="Gap" value={mockStaffData.reduce((a, b) => a + b.recommended, 0) - mockStaffData.reduce((a, b) => a + b.currentStaff, 0)} icon={TrendingUp} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
            <StatCard title="Avg Efficiency" value={Math.round(mockStaffData.reduce((a, b) => a + b.efficiency, 0) / mockStaffData.length)} suffix="%" icon={Clock} iconColor="text-purple-400" iconBg="bg-purple-500/10" />
          </div>

          <ChartCard title="Staff Requirement by Branch" subtitle="Current vs AI-recommended staffing levels (demo data)">
            <div className="space-y-4">
              {mockStaffData.map(branch => {
                const gap = branch.recommended - branch.currentStaff
                return (
                  <div key={branch.branch} className="p-4 rounded-xl dark:bg-white/5 bg-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold dark:text-white text-slate-900 text-sm">{branch.branch}</p>
                        <p className="text-xs dark:text-slate-400 text-slate-500">{branch.customersPerHour} customers/hr · Ratio {branch.ratio}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={gap > 5 ? 'danger' : gap > 0 ? 'warning' : 'success'}>
                          {gap > 0 ? `Need +${gap} staff` : 'Optimal'}
                        </Badge>
                        <p className="text-xs dark:text-slate-400 text-slate-500 mt-1">{branch.efficiency}% efficient</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="dark:text-slate-400 text-slate-500">Current: <strong className="dark:text-white text-slate-900">{branch.currentStaff}</strong></span>
                          <span className="dark:text-slate-400 text-slate-500">Needed: <strong className="text-primary-400">{branch.recommended}</strong></span>
                        </div>
                        <div className="h-2 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                            style={{ width: `${(branch.currentStaff / branch.recommended) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Hourly Staff Requirement" subtitle="Today's needed vs actual staffing (demo)">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mockStaffForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  <Bar dataKey="needed" name="Needed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Service Efficiency by Hour" subtitle="Staff utilization percentage (demo)">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={mockStaffForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[75, 105]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="efficiency" name="Efficiency" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}

export default StaffAnalytics
