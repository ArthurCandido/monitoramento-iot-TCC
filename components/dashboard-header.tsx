import React from 'react'
import { Activity, Gauge as Gauge3 } from 'lucide-react'

export default function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Gauge3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Smart Room Monitor</h1>
              <p className="text-sm text-muted-foreground">Sistema de Monitoramento de Sala Inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
