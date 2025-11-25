"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Laboratory {
  id: string
  nome: string
  ativo: boolean
  descricao?: string
}

interface LabContextType {
  laboratories: Laboratory[]
  selectedLab: Laboratory | null
  setSelectedLab: (lab: Laboratory) => void
  isLabActive: (labId: string) => boolean
  isLoading: boolean
}

const LABORATORIES: Laboratory[] = [
  { id: 'E100', nome: 'E100', ativo: false, descricao: 'Laboratório de Informática' },
  { id: 'E101', nome: 'E101', ativo: false, descricao: 'Laboratório de Informática' },
  { id: 'E102', nome: 'E102', ativo: false, descricao: 'Laboratório de Informática' },
  { id: 'E103', nome: 'E103', ativo: false, descricao: 'Laboratório de Informática' },
  { id: 'E104', nome: 'E104', ativo: false, descricao: 'Laboratório de Informática' },
  { id: 'E105', nome: 'E105', ativo: true, descricao: 'Laboratório de Informática' },
  { id: 'E106', nome: 'E106', ativo: false, descricao: 'Laboratório de Informática' },
  { id: 'E107', nome: 'E107', ativo: false, descricao: 'Laboratório de Informática' }
]

const LabContext = createContext<LabContextType | undefined>(undefined)

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [selectedLab, setSelectedLabState] = useState<Laboratory | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setSelectedLab = (lab: Laboratory) => {
    setSelectedLabState(lab)
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected-lab', lab.id)
      localStorage.setItem('lab-selected', 'true') // Marcar que já selecionou
    }
  }

  const isLabActive = (labId: string) => {
    return LABORATORIES.find(lab => lab.id === labId)?.ativo || false
  }

  // Inicialização única combinada
  useEffect(() => {
    // Verificar se estamos no lado cliente
    if (typeof window !== 'undefined') {
      const savedLabId = localStorage.getItem('selected-lab')
      const hasSelected = localStorage.getItem('lab-selected')
      
      // Só auto-selecionar se já foi selecionado anteriormente
      if (savedLabId && hasSelected === 'true') {
        const lab = LABORATORIES.find(l => l.id === savedLabId)
        if (lab) {
          setSelectedLabState(lab)
        }
      }
      
      setIsLoading(false)
    }
  }, [])

  return (
    <LabContext.Provider value={{
      laboratories: LABORATORIES,
      selectedLab,
      setSelectedLab,
      isLabActive,
      isLoading
    }}>
      {children}
    </LabContext.Provider>
  )
}

export function useLab() {
  const context = useContext(LabContext)
  if (context === undefined) {
    throw new Error('useLab must be used within a LabProvider')
  }
  return context
}