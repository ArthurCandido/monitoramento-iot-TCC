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
}

const LABORATORIES: Laboratory[] = [
  { id: 'E100', nome: 'E100', ativo: false, descricao: 'Laboratório de Informática 1' },
  { id: 'E101', nome: 'E101', ativo: false, descricao: 'Laboratório de Informática 2' },
  { id: 'E102', nome: 'E102', ativo: false, descricao: 'Laboratório de Redes' },
  { id: 'E103', nome: 'E103', ativo: false, descricao: 'Laboratório de Hardware' },
  { id: 'E104', nome: 'E104', ativo: false, descricao: 'Laboratório de Programação' },
  { id: 'E105', nome: 'E105', ativo: true, descricao: 'Laboratório IoT (Protótipo Ativo)' },
  { id: 'E106', nome: 'E106', ativo: false, descricao: 'Laboratório de Sistemas' },
  { id: 'E107', nome: 'E107', ativo: false, descricao: 'Laboratório de Multimídia' }
]

const LabContext = createContext<LabContextType | undefined>(undefined)

export function LabProvider({ children }: { children: React.ReactNode }) {
  const [selectedLab, setSelectedLabState] = useState<Laboratory | null>(null)

  // Inicializar com E105 (laboratório ativo)
  useEffect(() => {
    const activeLab = LABORATORIES.find(lab => lab.ativo) || LABORATORIES[5] // E105
    setSelectedLabState(activeLab)
  }, [])

  const setSelectedLab = (lab: Laboratory) => {
    setSelectedLabState(lab)
    // Salvar no localStorage
    localStorage.setItem('selected-lab', lab.id)
  }

  const isLabActive = (labId: string) => {
    return LABORATORIES.find(lab => lab.id === labId)?.ativo || false
  }

  // Carregar do localStorage na inicialização
  useEffect(() => {
    const savedLabId = localStorage.getItem('selected-lab')
    if (savedLabId) {
      const lab = LABORATORIES.find(l => l.id === savedLabId)
      if (lab) {
        setSelectedLabState(lab)
      }
    }
  }, [])

  return (
    <LabContext.Provider value={{
      laboratories: LABORATORIES,
      selectedLab,
      setSelectedLab,
      isLabActive
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