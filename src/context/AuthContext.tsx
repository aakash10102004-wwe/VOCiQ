import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Business {
  name: string
  gstId: string
  licenseId: string
  email: string
  phone: string
  city: string
  storeType: string
}

interface AuthContextType {
  isAuthenticated: boolean
  business: Business | null
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export interface RegisterData {
  businessName: string
  gstId: string
  licenseId: string
  email: string
  phone: string
  password: string
  city: string
  storeType: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [business, setBusiness] = useState<Business | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('wyapariq_session')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setBusiness(data.business)
        setIsAuthenticated(true)
      } catch { /* ignore */ }
    }
  }, [])

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200))

    // Check stored registrations
    const registrations: RegisterData[] = JSON.parse(localStorage.getItem('wyapariq_registrations') || '[]')
    const match = registrations.find(
      r => (r.gstId.toLowerCase() === identifier.toLowerCase() || r.licenseId.toLowerCase() === identifier.toLowerCase()) &&
           r.password === password
    )

    if (match) {
      const biz: Business = {
        name: match.businessName,
        gstId: match.gstId,
        licenseId: match.licenseId,
        email: match.email,
        phone: match.phone,
        city: match.city,
        storeType: match.storeType,
      }
      setBusiness(biz)
      setIsAuthenticated(true)
      localStorage.setItem('wyapariq_session', JSON.stringify({ business: biz }))
      return { success: true }
    }

    // Demo login: accept any GST-format ID with password "demo123"
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i
    const isGST = gstRegex.test(identifier)
    if (password === 'demo123') {
      const biz: Business = {
        name: isGST ? 'Demo Retail Pvt Ltd' : 'Demo Business',
        gstId: isGST ? identifier.toUpperCase() : 'GSTIN27AAECR4849N1Z5',
        licenseId: !isGST ? identifier.toUpperCase() : 'BL-MH-2024-001842',
        email: 'admin@demoretail.in',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        storeType: 'department',
      }
      setBusiness(biz)
      setIsAuthenticated(true)
      localStorage.setItem('wyapariq_session', JSON.stringify({ business: biz }))
      return { success: true }
    }

    return { success: false, error: 'Invalid GST/License ID or password. Use password "demo123" for demo access.' }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 1500))

    // Validate GST format (basic)
    if (data.gstId && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i.test(data.gstId)) {
      return { success: false, error: 'Invalid GST ID format. Expected format: 27AAECR4849N1Z5' }
    }

    if (!data.gstId && !data.licenseId) {
      return { success: false, error: 'Please provide either a GST ID or Business License ID' }
    }

    // Store registration
    const registrations: RegisterData[] = JSON.parse(localStorage.getItem('wyapariq_registrations') || '[]')
    const exists = registrations.find(r => r.gstId === data.gstId || r.licenseId === data.licenseId)
    if (exists) {
      return { success: false, error: 'A business with this GST/License ID is already registered' }
    }

    registrations.push(data)
    localStorage.setItem('wyapariq_registrations', JSON.stringify(registrations))

    // Auto-login after registration
    const biz: Business = {
      name: data.businessName,
      gstId: data.gstId,
      licenseId: data.licenseId,
      email: data.email,
      phone: data.phone,
      city: data.city,
      storeType: data.storeType,
    }
    setBusiness(biz)
    setIsAuthenticated(true)
    localStorage.setItem('wyapariq_session', JSON.stringify({ business: biz }))
    return { success: true }
  }

  const logout = () => {
    setBusiness(null)
    setIsAuthenticated(false)
    localStorage.removeItem('wyapariq_session')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, business, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
