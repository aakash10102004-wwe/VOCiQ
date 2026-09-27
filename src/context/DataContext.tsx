import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { ParsedData, AnalysisResult } from '../utils/csvParser'

export interface UploadedDataset {
  fileName: string
  parsedData: ParsedData
  analysis: AnalysisResult
  uploadedAt: Date
}

interface DataContextType {
  // Main business data (sales, products, inventory, etc.)
  businessData: UploadedDataset | null
  setBusinessData: (data: UploadedDataset | null) => void

  // Separate staff data
  staffData: UploadedDataset | null
  setStaffData: (data: UploadedDataset | null) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [businessData, setBusinessData] = useState<UploadedDataset | null>(null)
  const [staffData, setStaffData] = useState<UploadedDataset | null>(null)

  return (
    <DataContext.Provider value={{ businessData, setBusinessData, staffData, setStaffData }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
