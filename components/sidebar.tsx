'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Gauge, History, AlertCircle, Activity, Menu, X, ChevronRight, Settings } from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sections = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral do sistema',
    },
    {
      id: 'sensors',
      name: 'Sensores',
      icon: Gauge,
      description: 'Detalhes dos sensores',
    },
    {
      id: 'history',
      name: 'Histórico',
      icon: History,
      description: 'Dados e gráficos históricos',
    },
    {
      id: 'alerts',
      name: 'Alertas',
      icon: AlertCircle,
      description: 'Gerenciamento de alertas',
    },
    {
      id: 'status',
      name: 'Status',
      icon: Activity,
      description: 'Status do sistema',
    },
    {
      id: 'config',
      name: 'Configurações',
      icon: Settings,
      description: 'Configurar alertas e sistema',
    },
  ]

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <Activity size={24} className="text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">IoT Monitor</h1>
              <p className="text-xs text-muted-foreground">Smart Room</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{section.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {section.description}
                  </p>
                </div>
                {isActive && <ChevronRight size={18} />}
              </button>
            )
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Sistema IoT</p>
            <p>Monitoramento em tempo real</p>
          </div>
        </div>
      </aside>
    </>
  )
}
