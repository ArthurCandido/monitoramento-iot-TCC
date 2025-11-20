import React from 'react'
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react'

interface Event {
  id: number
  type: string
  message: string
  timestamp: string
}

interface EventLogProps {
  events: Event[]
}

export default function EventLog({ events }: EventLogProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'success':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-red-400'
      case 'success':
        return 'text-green-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Histórico de Eventos</h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento registrado</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
              <div className={`mt-0.5 ${getEventColor(event.type)}`}>{getEventIcon(event.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{event.message}</p>
                <p className="text-xs text-muted-foreground">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
