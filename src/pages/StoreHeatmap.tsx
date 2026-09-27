import React, { useState } from 'react'
import { MapPin, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import ChartCard from '../components/ui/ChartCard'
import Badge from '../components/ui/Badge'
import { storeHeatmapData } from '../data/mockData'

const getIntensityColor = (traffic: number) => {
  if (traffic >= 85) return { bg: 'bg-red-500', text: 'text-red-400', label: 'Very High', badge: 'danger' as const }
  if (traffic >= 70) return { bg: 'bg-orange-500', text: 'text-orange-400', label: 'High', badge: 'warning' as const }
  if (traffic >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Medium', badge: 'warning' as const }
  return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Low', badge: 'success' as const }
}

const StoreHeatmap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const selected = storeHeatmapData.zones.find(z => z.id === selectedZone)

  return (
    <div className="space-y-7">
      <PageHeader
        title="Store Heatmap"
        subtitle="Visual traffic intensity and zone analysis across the store floor"
        icon={<MapPin className="w-6 h-6 text-red-400" />}
        badge="AI Analysis"
        badgeColor="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Heatmap Visual */}
        <div className="lg:col-span-2">
          <ChartCard title="Store Floor Plan — Traffic Heatmap" subtitle="Click a zone to see details">
            <div className="relative w-full aspect-[4/3] dark:bg-slate-800/60 bg-slate-100 rounded-xl overflow-hidden border dark:border-white/10 border-slate-200">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '10% 10%' }}
              />
              {/* Store boundaries label */}
              <div className="absolute top-2 left-2 text-xs dark:text-slate-500 text-slate-400 font-mono">Store Floor Plan</div>

              {storeHeatmapData.zones.map(zone => {
                const intensity = getIntensityColor(zone.traffic)
                const isSelected = selectedZone === zone.id
                return (
                  <div
                    key={zone.id}
                    className={`absolute rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center
                      ${isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-102 hover:z-10'}`}
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.width}%`,
                      height: `${zone.height}%`,
                      backgroundColor: zone.color,
                      opacity: 0.7 + (zone.traffic / 100) * 0.3,
                    }}
                    onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                  >
                    <span className="text-white text-xs font-bold drop-shadow text-center leading-tight px-1">
                      {zone.name}
                    </span>
                    <span className="text-white/90 text-xs font-semibold">{zone.traffic}%</span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {[
                { label: 'Very High (85%+)', color: 'bg-red-500' },
                { label: 'High (70-85%)', color: 'bg-orange-500' },
                { label: 'Medium (50-70%)', color: 'bg-yellow-500' },
                { label: 'Low (<50%)', color: 'bg-emerald-500' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs dark:text-slate-400 text-slate-500">
                  <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Zone Details + Recommendations */}
        <div className="space-y-5">
          {/* Zone Info */}
          <ChartCard title={selected ? selected.name : 'Zone Details'} subtitle="Click a zone on the map">
            {selected ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-black font-display" style={{ color: selected.color }}>
                    {selected.traffic}%
                  </div>
                  <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">Traffic Intensity</p>
                  <Badge variant={getIntensityColor(selected.traffic).badge} size="md" dot className="mt-2">
                    {getIntensityColor(selected.traffic).label} Traffic Zone
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-slate-400 text-slate-500">Avg Dwell Time</span>
                    <span className="dark:text-white text-slate-900 font-medium">{Math.round(selected.traffic / 10 + 2)} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-slate-400 text-slate-500">Conversion Rate</span>
                    <span className="dark:text-white text-slate-900 font-medium">{Math.round(selected.traffic * 0.35)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-slate-400 text-slate-500">Revenue Contribution</span>
                    <span className="dark:text-white text-slate-900 font-medium">{selected.traffic > 80 ? 'Very High' : selected.traffic > 60 ? 'High' : 'Medium'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 dark:text-slate-500 text-slate-400">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Click a zone on the heatmap to see analytics</p>
              </div>
            )}
          </ChartCard>

          {/* Zone Rankings */}
          <ChartCard title="Zone Traffic Rankings" subtitle="By traffic intensity">
            <div className="space-y-2">
              {storeHeatmapData.zones.sort((a, b) => b.traffic - a.traffic).map((zone, i) => (
                <div key={zone.id} className="flex items-center gap-3 cursor-pointer hover:dark:bg-white/5 hover:bg-slate-100 rounded-lg p-2 transition-colors"
                  onClick={() => setSelectedZone(zone.id)}>
                  <span className="text-xs dark:text-slate-500 text-slate-400 font-mono w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium dark:text-white text-slate-900">{zone.name}</span>
                      <span className="text-xs font-bold" style={{ color: zone.color }}>{zone.traffic}%</span>
                    </div>
                    <div className="h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${zone.traffic}%`, backgroundColor: zone.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* AI Recommendations */}
      <ChartCard title="AI Layout Recommendations" subtitle="Optimize product placement based on traffic patterns"
        actions={<Lightbulb className="w-4 h-4 text-amber-400" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeHeatmapData.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl dark:bg-white/5 bg-slate-100 border dark:border-white/5 border-slate-200 group hover:border-primary-500/30 transition-all">
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-sm dark:text-slate-300 text-slate-700">{rec}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

export default StoreHeatmap
