import React, { useState } from 'react'
import { BarChart3, Lightbulb, ArrowRight, CheckCircle2, LayoutGrid } from 'lucide-react'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import { storeHeatmapData } from '../data/mockData'

const layoutZonesCurrent = [
  { id: 'entrance', name: 'Entrance', x: 5, y: 82, w: 90, h: 14, color: '#ef4444' },
  { id: 'electronics', name: 'Electronics', x: 5, y: 5, w: 38, h: 35, color: '#f97316' },
  { id: 'fashion', name: 'Fashion', x: 57, y: 5, w: 38, h: 35, color: '#f59e0b' },
  { id: 'groceries', name: 'Groceries', x: 5, y: 45, w: 28, h: 33, color: '#22c55e' },
  { id: 'home', name: 'Home & Living', x: 38, y: 45, w: 22, h: 33, color: '#3b82f6' },
  { id: 'beauty', name: 'Beauty', x: 65, y: 45, w: 30, h: 33, color: '#ec4899' },
  { id: 'billing', name: 'Billing', x: 78, y: 82, w: 17, h: 14, color: '#8b5cf6' },
]

const layoutZonesOptimized = [
  { id: 'entrance', name: 'Entrance', x: 5, y: 82, w: 90, h: 14, color: '#ef4444' },
  { id: 'electronics', name: 'Electronics', x: 5, y: 5, w: 55, h: 35, color: '#f97316' },  // wider
  { id: 'accessories', name: 'Accessories', x: 65, y: 5, w: 30, h: 35, color: '#6366f1' }, // moved near electronics
  { id: 'fashion', name: 'Fashion', x: 5, y: 45, w: 40, h: 33, color: '#f59e0b' },        // more space
  { id: 'groceries', name: 'Groceries', x: 50, y: 45, w: 20, h: 33, color: '#22c55e' },
  { id: 'beauty', name: 'Beauty', x: 75, y: 45, w: 20, h: 33, color: '#ec4899' },
  { id: 'billing', name: 'Billing', x: 78, y: 82, w: 17, h: 14, color: '#8b5cf6' },
]

const LayoutOptimizer: React.FC = () => {
  const [view, setView] = useState<'current' | 'optimized'>('current')
  const zones = view === 'current' ? layoutZonesCurrent : layoutZonesOptimized

  return (
    <div className="space-y-7">
      <PageHeader
        title="AI Store Layout Optimizer"
        subtitle="AI-generated layout recommendations to maximize sales and customer flow"
        icon={<BarChart3 className="w-6 h-6 text-teal-400" />}
        badge="AI Generated"
        badgeColor="primary"
      />

      {/* Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl overflow-hidden border dark:border-white/10 border-slate-200">
          {(['current', 'optimized'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                view === v
                  ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                  : 'dark:text-slate-400 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-100'
              }`}
            >
              {v === 'current' ? '📦 Current Layout' : '✨ AI Optimized'}
            </button>
          ))}
        </div>
        {view === 'optimized' && (
          <span className="text-xs text-emerald-400 font-semibold animate-pulse-soft">
            ↑ Projected +12% revenue with this layout
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Floor Plan */}
        <div className="lg:col-span-2">
          <ChartCard title={view === 'current' ? 'Current Store Layout' : 'AI-Optimized Layout'} subtitle="Interactive floor plan visualization">
            <div className="relative w-full dark:bg-slate-800/60 bg-slate-100 rounded-xl overflow-hidden border dark:border-white/10 border-slate-200"
              style={{ paddingBottom: '70%' }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '10% 10%' }}
              />
              {zones.map(zone => (
                <div
                  key={zone.id}
                  className="absolute rounded-xl flex flex-col items-center justify-center transition-all duration-700 hover:opacity-90 border-2 border-white/20"
                  style={{
                    left: `${zone.x}%`, top: `${zone.y}%`,
                    width: `${zone.w}%`, height: `${zone.h}%`,
                    backgroundColor: zone.color + '90',
                  }}
                >
                  <span className="text-white text-xs font-bold drop-shadow text-center px-1">{zone.name}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Recommendations */}
        <ChartCard title="AI Recommendations" subtitle="Changes to apply for optimal layout">
          <div className="space-y-3">
            {[
              { title: 'Expand Electronics Zone', desc: 'Increase floor area by 17% — highest traffic and revenue per sqft', impact: '+4.2%', icon: '📱' },
              { title: 'Move Accessories Adjacent', desc: 'Co-locate with Electronics for impulse cross-sells', impact: '+3.1%', icon: '🎧' },
              { title: 'Widen Fashion Aisle', desc: 'Second highest dwell time — needs more browsing space', impact: '+2.8%', icon: '👗' },
              { title: 'Add Promo Zone at Entrance', desc: 'High footfall area underutilized for promotions', impact: '+1.9%', icon: '🎯' },
            ].map(r => (
              <div key={r.title} className="p-3 rounded-xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold dark:text-white text-slate-900">{r.title}</p>
                      <span className="text-xs font-bold text-emerald-400 flex-shrink-0">{r.impact}</span>
                    </div>
                    <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Zone Analysis */}
      <ChartCard title="Zone Performance Analysis" subtitle="Current metrics informing the optimization">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {storeHeatmapData.zones.slice(0, 4).map(zone => (
            <div key={zone.id} className="p-4 rounded-xl dark:bg-white/5 bg-slate-100 text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: zone.color + '30' }}>
                <LayoutGrid className="w-5 h-5" style={{ color: zone.color }} />
              </div>
              <p className="text-xs font-semibold dark:text-white text-slate-900 mb-1">{zone.name}</p>
              <p className="text-2xl font-bold" style={{ color: zone.color }}>{zone.traffic}%</p>
              <p className="text-xs dark:text-slate-400 text-slate-500">traffic score</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

export default LayoutOptimizer
