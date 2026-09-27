import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Fingerprint, Mail, Phone, MapPin, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react'
import { useAuth, RegisterData } from '../context/AuthContext'

const storeTypes = [
  { id: 'supermarket', label: 'Supermarket', icon: '🛒' },
  { id: 'clothing', label: 'Clothing', icon: '👗' },
  { id: 'eyewear', label: 'Eyewear', icon: '👓' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'department', label: 'Department', icon: '🏬' },
]

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Indore', 'Bhopal', 'Other',
]

const Register: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState<RegisterData>({
    businessName: '',
    gstId: '',
    licenseId: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    storeType: '',
  })

  const set = (key: keyof RegisterData, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setError('')
  }

  const validateStep1 = () => {
    if (!form.businessName.trim()) return 'Business name is required'
    if (!form.gstId.trim() && !form.licenseId.trim()) return 'Please provide either GST ID or Business License ID'
    return ''
  }

  const validateStep2 = () => {
    if (!form.email.trim() || !form.email.includes('@')) return 'Valid email is required'
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) return 'Valid 10-digit phone number is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const validateStep3 = () => {
    if (!form.city) return 'Please select your city'
    if (!form.storeType) return 'Please select your store type'
    return ''
  }

  const nextStep = () => {
    let err = ''
    if (step === 1) err = validateStep1()
    if (step === 2) err = validateStep2()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateStep3()
    if (err) { setError(err); return }

    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  const stepLabels = ['Business identity', 'Contact details', 'Store setup']

  return (
    <div className="min-h-screen flex font-sans">
      {/* ─── Left: About Panel ─── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden" style={{ background: '#0f172a' }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/6 blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between px-14 py-12 w-full">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-tight">V</span>
              </div>
              <span className="text-white/90 text-lg font-semibold tracking-tight">VOCiQ</span>
            </div>
            <div className="w-8 h-px bg-white/10 mt-5" />
          </div>

          {/* Copy */}
          <div className="max-w-sm">
            <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-[0.2em] mb-4">Get started</p>
            <h2 className="text-[2.4rem] leading-[1.15] font-semibold text-white tracking-tight mb-6">
              Set up your<br />business in three<br />simple steps.
            </h2>
            <p className="text-white/50 text-[15px] leading-relaxed mb-10">
              You'll need your GST number or trade license handy. Once registered,
              you can start uploading sales data and see analytics within minutes.
            </p>

            {/* Steps */}
            <div className="space-y-5">
              {stepLabels.map((label, i) => {
                const n = i + 1
                const done = step > n
                const active = step === n
                return (
                  <div key={n} className={`flex items-center gap-4 transition-opacity ${step >= n ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
                      done ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                      active ? 'border-white/40 text-white' :
                      'border-white/10 text-white/30'
                    }`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : n}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${active ? 'text-white' : done ? 'text-white/60' : 'text-white/30'}`}>
                        {label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/25">
            <span>© 2026 VOCiQ</span>
            <span>DPIIT Recognised</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Registration Form ─── */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-slate-900 dark:text-white text-base font-semibold">VOCiQ</span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Create your account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-2">
            Step {step} of 3 — {stepLabels[step - 1]}
          </p>

          {/* Progress */}
          <div className="h-1 bg-slate-100 dark:bg-white/[0.06] rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
            {/* Step 1 */}
            {step === 1 && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Business name *</label>
                  <input type="text" value={form.businessName} onChange={e => set('businessName', e.target.value)}
                    placeholder="e.g. Reliance Retail Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">GST Identification Number</label>
                  <input type="text" value={form.gstId} onChange={e => set('gstId', e.target.value.toUpperCase())}
                    placeholder="27AAECR4849N1Z5" maxLength={15}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tracking-wider bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition uppercase"
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">15-character alphanumeric GSTIN</p>
                </div>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
                  <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">or</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Business License Number</label>
                  <input type="text" value={form.licenseId} onChange={e => set('licenseId', e.target.value.toUpperCase())}
                    placeholder="BL-MH-2024-001842"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono tracking-wider bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition uppercase"
                  />
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Business email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="admin@yourbusiness.in"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Phone number *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Create a password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Primary city *</label>
                  <select
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition appearance-none"
                  >
                    <option value="">Select your city</option>
                    {indianCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">What kind of store? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {storeTypes.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => set('storeType', t.id)}
                        className={`p-3 rounded-lg text-center transition-all border ${
                          form.storeType === t.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                            : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-lg">{t.icon}</span>
                        <p className={`text-xs font-medium mt-1 ${
                          form.storeType === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>{t.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setStep(s => s - 1); setError(''); }}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : step < 3 ? (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Complete registration
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
