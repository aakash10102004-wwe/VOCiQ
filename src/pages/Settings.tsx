import React, { useState } from 'react'
import { Settings as SettingsIcon, Building2, Bell, Shield, Palette, Globe, Save, BookOpen, RotateCcw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import ChartCard from '../components/ui/ChartCard'
import { useTheme } from '../context/ThemeContext'

const storeTypes = [
  { id: 'supermarket', label: 'Supermarket', icon: '🛒', desc: 'Grocery & FMCG analysis' },
  { id: 'clothing', label: 'Clothing Store', icon: '👗', desc: 'Fashion & apparel analytics' },
  { id: 'eyewear', label: 'Eyewear Store', icon: '👓', desc: 'Frame & lens performance' },
  { id: 'electronics', label: 'Electronics', icon: '📱', desc: 'Tech product analytics' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊', desc: 'Medicine & health analytics' },
  { id: 'department', label: 'Department Store', icon: '🏬', desc: 'Multi-category retail' },
]

const Settings: React.FC = () => {
  const { isDark, toggleTheme } = useTheme()
  const [selectedType, setSelectedType] = useState('department')
  const [notifications, setNotifications] = useState({
    inventoryAlerts: true,
    staffAlerts: true,
    salesMilestones: true,
    weeklyReports: false,
    festivalReminders: true,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Settings"
        subtitle="Configure your store type, notifications, and platform preferences"
        icon={<SettingsIcon className="w-6 h-6 text-slate-400" />}
        actions={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Save className="w-4 h-4" />
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        }
      />

      {/* Store Type */}
      <ChartCard title="Store Type" subtitle="Select your retail category for AI-tailored analytics">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {storeTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                selectedType === type.id
                  ? 'border-primary-500 dark:bg-primary-500/10 bg-primary-50'
                  : 'dark:border-white/5 border-slate-200 dark:hover:border-white/10 hover:border-slate-300 dark:hover:bg-white/5 hover:bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <p className={`text-sm font-semibold ${selectedType === type.id ? 'text-primary-400' : 'dark:text-white text-slate-900'}`}>{type.label}</p>
              <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{type.desc}</p>
            </button>
          ))}
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Notification Settings */}
        <ChartCard title="Notifications" subtitle="Configure alert preferences" actions={<Bell className="w-4 h-4 dark:text-slate-400 text-slate-500" />}>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, val]) => {
              const labels: Record<string, string> = {
                inventoryAlerts: 'Low inventory alerts',
                staffAlerts: 'Staff shortage warnings',
                salesMilestones: 'Sales milestone achievements',
                weeklyReports: 'Weekly performance emails',
                festivalReminders: 'Festival demand reminders',
              }
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b dark:border-white/5 border-slate-200 last:border-0">
                  <span className="text-sm dark:text-slate-300 text-slate-700">{labels[key]}</span>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${val ? 'bg-primary-500' : 'dark:bg-white/10 bg-slate-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${val ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              )
            })}
          </div>
        </ChartCard>

        {/* Appearance */}
        <ChartCard title="Appearance" subtitle="Theme and display settings" actions={<Palette className="w-4 h-4 dark:text-slate-400 text-slate-500" />}>
          <div className="space-y-5">
            <div className="flex items-center justify-between py-2 border-b dark:border-white/5 border-slate-200">
              <div>
                <p className="text-sm dark:text-slate-300 text-slate-700 font-medium">Dark Mode</p>
                <p className="text-xs dark:text-slate-500 text-slate-400">Premium glassmorphism interface</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative ${isDark ? 'bg-primary-500' : 'dark:bg-white/10 bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <p className="text-sm dark:text-slate-300 text-slate-700 font-medium mb-3">Language</p>
              <select className="w-full px-3 py-2 rounded-xl text-sm dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
                <option>Tamil</option>
                <option>Bengali</option>
              </select>
            </div>

            <div>
              <p className="text-sm dark:text-slate-300 text-slate-700 font-medium mb-3">Currency</p>
              <select className="w-full px-3 py-2 rounded-xl text-sm dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                <option>₹ — Indian Rupee (INR)</option>
                <option>$ — US Dollar (USD)</option>
              </select>
            </div>

            {/* Restart Tutorial */}
            <div className="pt-2 border-t dark:border-white/5 border-slate-200">
              <p className="text-sm dark:text-slate-300 text-slate-700 font-medium mb-3">Onboarding Tutorial</p>
              <button
                onClick={() => {
                  localStorage.removeItem('vyapaarIQ_tutorial_complete')
                  window.location.href = '/'
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                  border dark:border-primary-500/30 border-primary-300
                  dark:text-primary-400 text-primary-600 text-sm font-medium
                  hover:dark:bg-primary-500/5 hover:bg-primary-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Onboarding Tutorial
              </button>
              <p className="text-xs dark:text-slate-500 text-slate-400 mt-2">
                Re-experience the platform tour to discover features you might have missed.
              </p>
            </div>
          </div>
        </ChartCard>

        {/* Business Profile */}
        <ChartCard title="Business Profile" subtitle="Your organization details" actions={<Building2 className="w-4 h-4 dark:text-slate-400 text-slate-500" />}>
          <div className="space-y-4">
            {[
              { label: 'Business Name', defaultValue: 'Reliance Retail Ltd.' },
              { label: 'Primary City', defaultValue: 'Mumbai, Maharashtra' },
              { label: 'Total Branches', defaultValue: '12' },
              { label: 'GST Number', defaultValue: 'GSTIN27AAECR4849N1Z5' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs dark:text-slate-400 text-slate-500 mb-1 block">{f.label}</label>
                <input
                  type="text"
                  defaultValue={f.defaultValue}
                  className="w-full px-3 py-2 rounded-xl text-sm dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 dark:text-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Security */}
        <ChartCard title="Security" subtitle="Account and data security settings" actions={<Shield className="w-4 h-4 dark:text-slate-400 text-slate-500" />}>
          <div className="space-y-4">
            <div className="p-3 rounded-xl dark:bg-emerald-500/5 bg-emerald-50 border border-emerald-500/20">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ JWT Authentication Active</p>
            </div>
            <div className="p-3 rounded-xl dark:bg-emerald-500/5 bg-emerald-50 border border-emerald-500/20">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Bcrypt Password Hashing Enabled</p>
            </div>
            <div className="p-3 rounded-xl dark:bg-emerald-500/5 bg-emerald-50 border border-emerald-500/20">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ SQL Injection Protection Active</p>
            </div>
            <button className="w-full py-2.5 rounded-xl border dark:border-red-500/30 border-red-300 dark:text-red-400 text-red-600 text-sm font-medium hover:dark:bg-red-500/5 hover:bg-red-50 transition-all">
              Reset Password
            </button>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

export default Settings
