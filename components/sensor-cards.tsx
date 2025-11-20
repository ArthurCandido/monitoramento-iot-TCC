import React from 'react'
import { Thermometer, Lightbulb, Activity, Droplets } from 'lucide-react'

interface SensorData {
  temperatura: number
  umidade: number
  luminosidade: number
  movimento: string
}

interface SensorCardsProps {
  data: SensorData | null
  isLoading: boolean
}

export default function SensorCards({ data, isLoading }: SensorCardsProps) {
  const cards = [
    {
      icon: Thermometer,
      label: 'Temperatura',
      value: data?.temperatura ?? '--',
      unit: '°C',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Droplets,
      label: 'Umidade',
      value: data?.umidade ?? '--',
      unit: '%',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Lightbulb,
      label: 'Luminosidade',
      value: data?.luminosidade ?? '--',
      unit: 'lux',
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: Activity,
      label: 'Movimento',
      value: data?.movimento ?? '--',
      unit: '',
      color: 'from-green-500 to-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon
        const isMovement = card.label === 'Movimento'
        const isMovementDetected = data?.movimento === 'Detectado'

        return (
          <div
            key={idx}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`bg-gradient-to-br ${card.color} p-3 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {isLoading && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{card.label}</p>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {isMovement && !isMovementDetected ? '✕' : isMovement && isMovementDetected ? '✓' : card.value}
              </span>
              {!isMovement && card.unit && (
                <span className="text-sm text-muted-foreground">{card.unit}</span>
              )}
            </div>

            {isMovement && (
              <div className="mt-2">
                <div className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${
                  isMovementDetected
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {data?.movimento}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
