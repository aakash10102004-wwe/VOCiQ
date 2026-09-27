import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Brain, MapPin, TrendingUp, Building2, CheckCircle, Layers } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ChartCard from '../components/ui/ChartCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import { expansionRecommendations } from '../data/mockData'

// Indian cities with real lat/lng
const indianCities = [
  { city: 'Mumbai', lat: 19.076, lng: 72.8777, existing: true, branches: 5 },
  { city: 'Delhi', lat: 28.7041, lng: 77.1025, existing: true, branches: 4 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946, existing: true, branches: 3 },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707, existing: true, branches: 3 },
  { city: 'Hyderabad', lat: 17.385, lng: 78.4867, existing: true, branches: 2 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, existing: true, branches: 2 },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639, existing: true, branches: 2 },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873, existing: true, branches: 1 },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, existing: false, score: 92 },
  { city: 'Lucknow', lat: 26.8467, lng: 80.9462, existing: false, score: 87 },
  { city: 'Chandigarh', lat: 30.7333, lng: 76.7794, existing: false, score: 85 },
  { city: 'Kochi', lat: 9.9312, lng: 76.2673, existing: false, score: 82 },
  { city: 'Indore', lat: 22.7196, lng: 75.8577, existing: false, score: 80 },
]

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const tileUrls: Record<string, { url: string; attr: string; subdomains?: string[] }> = {
  'Google Maps': {
    url: `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_KEY}`,
    attr: '&copy; Google Maps',
    subdomains: ['0', '1', '2', '3'],
  },
  'Google Satellite': {
    url: `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_KEY}`,
    attr: '&copy; Google Maps',
    subdomains: ['0', '1', '2', '3'],
  },
  'Google Terrain': {
    url: `https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_KEY}`,
    attr: '&copy; Google Maps',
    subdomains: ['0', '1', '2', '3'],
  },
  Blueprint: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '&copy; CARTO' },
  Classic: { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', attr: '&copy; CARTO' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-white font-bold">Score: {payload[0]?.value}/100</p>
    </div>
  )
}

// Leaflet Map component using raw L.map API
const LeafletMap: React.FC<{
  mapStyle: string
  selectedCity: string | null
  onCityClick: (city: string) => void
}> = ({ mapStyle, selectedCity, onCityClick }) => {
  const mapRef = useRef<L.Map | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const onCityClickRef = useRef(onCityClick)
  onCityClickRef.current = onCityClick

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [22.5, 78.9] as L.LatLngExpression,
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
    })
    mapRef.current = map

    // Add initial tile layer
    const tile = tileUrls[mapStyle] || tileUrls['Google Maps']
    tileRef.current = L.tileLayer(tile.url, {
      attribution: tile.attr,
      maxZoom: 20,
      subdomains: tile.subdomains || ['a', 'b', 'c', 'd'],
    }).addTo(map)

    // Custom icons
    const existingIcon = L.divIcon({
      html: '<div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:3px solid #fff;box-shadow:0 2px 12px rgba(99,102,241,0.5);"></div>',
      className: '',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13],
    })

    const recommendedIcon = L.divIcon({
      html: '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#f97316);border:3px dashed #fbbf24;box-shadow:0 2px 14px rgba(245,158,11,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px;">+</div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    })

    // Add existing branch markers
    indianCities.filter(c => c.existing).forEach(city => {
      L.marker([city.lat, city.lng] as L.LatLngExpression, { icon: existingIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,system-ui,sans-serif;min-width:150px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="width:8px;height:8px;border-radius:50%;background:#6366f1;"></div>
              <strong style="font-size:13px;">${city.city}</strong>
            </div>
            <div style="font-size:11px;color:#666;line-height:1.6;">
              <div>Status: <span style="color:#10b981;font-weight:600;">Active</span></div>
              <div>Branches: <span style="color:#333;font-weight:700;">${city.branches}</span></div>
            </div>
          </div>
        `)

      L.circle([city.lat, city.lng] as L.LatLngExpression, {
        radius: 50000,
        color: '#6366f1',
        fillColor: '#6366f1',
        fillOpacity: 0.06,
        weight: 1,
        dashArray: '4, 4',
      }).addTo(map)
    })

    // Add recommended location markers
    indianCities.filter(c => !c.existing).forEach(city => {
      const recData = expansionRecommendations.find(r => r.city === city.city)
      const marker = L.marker([city.lat, city.lng] as L.LatLngExpression, { icon: recommendedIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,system-ui,sans-serif;min-width:180px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;"></div>
              <strong style="font-size:13px;">${city.city}</strong>
            </div>
            <div style="font-size:11px;color:#666;line-height:1.8;">
              <div>Status: <span style="color:#f59e0b;font-weight:600;">Recommended</span></div>
              <div>AI Score: <span style="color:#d97706;font-weight:700;font-size:14px;">${(city as any).score}/100</span></div>
              ${recData ? `
                <div>Population: <span style="color:#333;">${recData.population}</span></div>
                <div>Demand: <span style="color:#10b981;">${recData.demand}</span></div>
                <div>Competition: <span style="color:#ef4444;">${recData.competition}</span></div>
              ` : ''}
            </div>
            ${recData ? `<div style="margin-top:8px;padding:6px 8px;background:rgba(99,102,241,0.08);border-radius:8px;font-size:10px;color:#6366f1;line-height:1.4;">${recData.reason}</div>` : ''}
          </div>
        `)

      marker.on('click', () => {
        onCityClickRef.current(city.city)
      })

      L.circle([city.lat, city.lng] as L.LatLngExpression, {
        radius: 40000,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: '6, 3',
      }).addTo(map)
    })

    return () => {
      map.remove()
      mapRef.current = null
      tileRef.current = null
    }
  }, [])

  // Fly to selected city
  useEffect(() => {
    if (!mapRef.current) return
    if (selectedCity) {
      const city = indianCities.find(c => c.city === selectedCity)
      if (city) {
        mapRef.current.flyTo([city.lat, city.lng] as L.LatLngExpression, 10, { duration: 1.2 })
      }
    } else {
      mapRef.current.flyTo([22.5, 78.9] as L.LatLngExpression, 5, { duration: 1 })
    }
  }, [selectedCity])

  // Change tile layer on style change
  useEffect(() => {
    if (!mapRef.current) return
    if (tileRef.current) {
      mapRef.current.removeLayer(tileRef.current)
    }
    const tile = tileUrls[mapStyle] || tileUrls['Google Maps']
    tileRef.current = L.tileLayer(tile.url, {
      attribution: tile.attr,
      maxZoom: 20,
      subdomains: tile.subdomains || ['a', 'b', 'c', 'd'],
    }).addTo(mapRef.current)
  }, [mapStyle])

  return (
    <div
      ref={mapContainerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: 420 }}
    />
  )
}

const BranchPredictor: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState('Google Maps')
  const selected = expansionRecommendations.find(c => c.city === selectedCity)

  const handleCityClick = useCallback((city: string) => {
    setSelectedCity(prev => prev === city ? null : city)
  }, [])

  return (
    <div className="space-y-7">
      <style>{`
        .leaflet-container {
          background: #0f172a !important;
          border-radius: 12px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(255,255,255,0.97) !important;
          color: #1e293b !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-tip {
          background: rgba(255,255,255,0.97) !important;
        }
        .leaflet-popup-content {
          margin: 10px 14px !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.85) !important;
          color: #94a3b8 !important;
          border-color: rgba(99,102,241,0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(99, 102, 241, 0.4) !important;
          color: #fff !important;
        }
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.6) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
      `}</style>

      <PageHeader
        title="AI Branch Location Predictor"
        subtitle="Find the best Indian cities to expand your retail presence"
        icon={<Brain className="w-6 h-6 text-purple-400" />}
        badge="AI Powered"
        badgeColor="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <ChartCard
            title="India Expansion Map"
            subtitle="● Existing branches  ◎ Recommended locations"
            actions={
              <div className="flex items-center gap-1.5">
                {Object.keys(tileUrls).map(s => (
                  <button
                    key={s}
                    onClick={() => setMapStyle(s)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      mapStyle === s
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:bg-white/10 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            }
          >
            <div className="rounded-xl overflow-hidden border dark:border-white/10 border-slate-200">
              <LeafletMap
                mapStyle={mapStyle}
                selectedCity={selectedCity}
                onCityClick={handleCityClick}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-3 text-xs dark:text-slate-400 text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 border-2 border-white shadow" />
                Existing branches
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-dashed border-amber-300" />
                AI Recommended
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-dashed border-primary-400 bg-primary-500/10" />
                Coverage radius
              </div>
            </div>
          </ChartCard>
        </div>

        {/* City Detail Panel */}
        <ChartCard title="Expansion Analysis" subtitle={selected ? `City: ${selected.city}` : 'Click a ◎ marker for details'}>
          {selected ? (
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br dark:from-amber-500/10 dark:to-orange-500/5 from-amber-50 to-orange-50 border dark:border-amber-500/20 border-amber-200">
                <p className="text-5xl font-black font-display text-amber-400">{selected.score}</p>
                <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">Expansion Score / 100</p>
                <Badge variant={selected.score >= 90 ? 'success' : selected.score >= 80 ? 'warning' : 'info'} className="mt-2">
                  {selected.score >= 90 ? 'Highly Recommended' : selected.score >= 80 ? 'Recommended' : 'Under Review'}
                </Badge>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Population', value: selected.population, icon: '👥' },
                  { label: 'Demand Level', value: selected.demand, icon: '📈' },
                  { label: 'Competition', value: selected.competition, icon: '⚔️' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between py-2.5 px-3 rounded-lg dark:bg-white/3 bg-slate-50 border dark:border-white/5 border-slate-200">
                    <span className="text-sm dark:text-slate-400 text-slate-500 flex items-center gap-2">
                      <span>{m.icon}</span> {m.label}
                    </span>
                    <Badge variant={m.value === 'High' ? 'success' : m.value === 'Medium' ? 'warning' : 'danger'}>
                      {m.value}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl dark:bg-primary-500/5 bg-primary-50 border border-primary-500/20">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs dark:text-primary-300 text-primary-700 leading-relaxed">{selected.reason}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCity(null)}
                className="w-full py-2 rounded-lg text-xs font-medium dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:bg-white/10 hover:bg-slate-200 transition-all"
              >
                Back to overview
              </button>
            </div>
          ) : (
            <div className="text-center py-14 space-y-3">
              <div className="relative inline-block">
                <MapPin className="w-12 h-12 dark:text-slate-600 text-slate-400" />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </div>
              <p className="text-sm dark:text-slate-400 text-slate-500">Click any <span className="text-amber-400 font-semibold">orange marker</span> on the map</p>
              <p className="text-xs dark:text-slate-500 text-slate-400">{indianCities.filter(c => !c.existing).length} recommended cities available</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Cities Bar Chart */}
      <ChartCard title="Top 5 Recommended Cities" subtitle="AI-driven expansion score ranking">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={expansionRecommendations}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="city" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[70, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              name="AI Score"
              radius={[6, 6, 0, 0]}
              cursor="pointer"
              onClick={(data: any) => setSelectedCity(data.city)}
            >
              {expansionRecommendations.map((entry, i) => (
                <Cell
                  key={i}
                  fill={selectedCity === entry.city
                    ? '#f59e0b'
                    : `hsl(${260 + i * 15}, 75%, ${65 - i * 5}%)`
                  }
                  stroke={selectedCity === entry.city ? '#fbbf24' : 'transparent'}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

export default BranchPredictor
