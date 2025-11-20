'use client'

import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface AlertsViewProps {
  currentData: {
    alerta_ar: string
    alerta_luz: string
    data_hora: string
  } | null
}

export default function AlertsView({ currentData }: AlertsViewProps) {
  const alerts = currentData
    ? [
        {
          id: 1,
          type: currentData.alerta_ar !== 'OK' ? 'alert' : 'ok',
          title: 'Ar Condicionado',
          message: currentData.alerta_ar,
          timestamp: currentData.data_hora,
          icon: AlertCircle,
        },
        {
          id: 2,
          type: currentData.alerta_luz !== 'OK' ? 'alert' : 'ok',
          title: 'Iluminação',
          message: currentData.alerta_luz,
          timestamp: currentData.data_hora,
          icon: AlertCircle,
        },
      ]
    : []

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Alertas do Sistema</h1>
          <p className="text-muted-foreground">Gerenciamento de alertas e notificações</p>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-6 ${
                alert.type === 'alert'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    alert.type === 'alert' ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}
                >
                  {alert.type === 'alert' ? (
                    <AlertCircle
                      size={24}
                      className={alert.type === 'alert' ? 'text-red-500' : 'text-green-500'}
                    />
                  ) : (
                    <CheckCircle size={24} className="text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={14} />
                    {new Date(alert.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    alert.type === 'alert'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-green-500/20 text-green-500'
                  }`}
                >
                  {alert.type === 'alert' ? 'Ativo' : 'Resolvido'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
