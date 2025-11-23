'use client'

import { AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Alert {
  id: string
  tipo: 'ar-condicionado' | 'luzes'
  mensagem: string
  nivel: 'warning' | 'error'
  timestamp: number
}

interface AlertStats {
  total: number
  errors: number
  warnings: number
  today: number
}

interface AlertsViewProps {
  alerts: Alert[]
  alertStats: AlertStats
  clearActiveAlerts: () => void
}

export default function AlertsView({ alerts, alertStats, clearActiveAlerts }: AlertsViewProps) {
  const getAlertTitle = (tipo: Alert['tipo']): string => {
    const tipos = {
      'ar-condicionado': 'Ar Condicionado',
      'luzes': 'Iluminação'
    }
    return tipos[tipo]
  }

  const getAlertColor = (nivel: Alert['nivel']) => {
    return nivel === 'error' 
      ? { bg: 'bg-red-500/10 border-red-500/30', icon: 'bg-red-500/20', text: 'text-red-500', badge: 'bg-red-500/20 text-red-500' }
      : { bg: 'bg-yellow-500/10 border-yellow-500/30', icon: 'bg-yellow-500/20', text: 'text-yellow-500', badge: 'bg-yellow-500/20 text-yellow-500' }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Alertas do Sistema</h1>
          <p className="text-muted-foreground">Gerenciamento de alertas e notificações</p>
        </div>

        {/* Estatísticas dos Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
            <p className="text-2xl font-bold text-foreground">{alertStats.total}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Críticos</h3>
            <p className="text-2xl font-bold text-red-500">{alertStats.errors}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Avisos</h3>
            <p className="text-2xl font-bold text-yellow-500">{alertStats.warnings}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Hoje</h3>
            <p className="text-2xl font-bold text-foreground">{alertStats.today}</p>
          </div>
        </div>

        {/* Ações */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <Button 
              onClick={clearActiveAlerts}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Trash2 size={16} />
              Limpar Todos os Alertas
            </Button>
          </div>
        )}

        {/* Lista de Alertas */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum alerta ativo</h3>
              <p className="text-muted-foreground">Todos os sistemas estão funcionando normalmente!</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const colors = getAlertColor(alert.nivel)
              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-6 ${colors.bg}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colors.icon}`}>
                      <AlertCircle size={24} className={colors.text} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{getAlertTitle(alert.tipo)}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{alert.mensagem}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={14} />
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                      {alert.nivel === 'error' ? 'Crítico' : 'Aviso'}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
