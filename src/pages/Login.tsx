import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Building2, Fingerprint, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [idType, setIdType] = useState<'gst' | 'license'>('gst')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setLoading(true)
    const result = await login(identifier.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* ─── Left: Project Introduction ─── */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden" style={{ background: '#0f172a' }}>
        {/* Subtle grain overlay for organic feel */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Very minimal accent — a single soft glow at bottom */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-indigo-500/8 blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between px-14 py-12 w-full">
          {/* ── Brand mark ── */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm tracking-tight">V</span>
              </div>
              <span className="text-white/90 text-lg font-semibold tracking-tight">VOCiQ</span>
            </div>
            <div className="w-8 h-px bg-white/10 mt-5" />
          </div>

          {/* ── Welcome copy ── */}
          <div className="max-w-sm">
            <p className="text-indigo-400/80 text-xs font-medium uppercase tracking-[0.2em] mb-4">Welcome to VOCiQ</p>
            <h2 className="text-[2.5rem] leading-[1.15] font-semibold text-white tracking-tight mb-6">
              The smarter way to<br />run your retail<br />business.
            </h2>
            <p className="text-white/50 text-[15px] leading-relaxed mb-8">
              VOCiQ helps Indian retailers make sense of their data — from daily footfall and inventory
              levels to branch performance and seasonal demand. Sign in with your GST or trade license number
              to pick up right where you left off.
            </p>

            {/* Key numbers — understated, factual */}
            <div className="grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-6">
              {[
                { figure: '500+', label: 'Retail businesses' },
                { figure: '12', label: 'Indian cities' },
                { figure: '8.6Cr', label: 'Revenue tracked' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-white text-xl font-semibold">{s.figure}</p>
                  <p className="text-white/35 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between text-xs text-white/25">
            <span>© 2026 VOCiQ</span>
            <span>DPIIT Recognised · Made in India</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-slate-900 dark:text-white text-base font-semibold">VOCiQ</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-8">
            Use your registered GST number or business license ID.
          </p>

          {/* ID Type Toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-white/10 mb-6 overflow-hidden">
            {[
              { id: 'gst' as const, label: 'GST Number', icon: Building2 },
              { id: 'license' as const, label: 'License ID', icon: Fingerprint },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { setIdType(opt.id); setIdentifier(''); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${idType === opt.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                {idType === 'gst' ? 'GSTIN' : 'Business License Number'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={idType === 'gst' ? '27AAECR4849N1Z5' : 'BL-MH-2024-001842'}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition font-mono tracking-wider uppercase"
                autoComplete="username"
              />
              {idType === 'gst' && (
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">15-character alphanumeric GSTIN</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Password</label>
                <button type="button" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo callout */}
          <div className="mt-6 px-3.5 py-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-700 dark:text-slate-300">Try the demo →</strong>{' '}
              Enter any GST number (e.g. <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[11px]">27AAECR4849N1Z5</code>) with password{' '}
              <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[11px]">demo123</code>
            </p>
          </div>

          {/* Register */}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-8">
            New to VOCiQ?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Register your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
