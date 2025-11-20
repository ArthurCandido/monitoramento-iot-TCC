'use client'

import { Droplet, Sun, Thermometer, BotIcon as Motion } from 'lucide-react'

interface SensorData {
  temperatura: number
  umidade: number
  luminosidade: number
  movimento: string
  data_hora: string
}

interface SensorsViewProps {
  currentData: SensorData | null
  isLoading: boolean
}

export default function SensorsView({ currentData, isLoading }: SensorsViewProps) {
  const sensors = [
    {
      name: 'Temperatura',
      icon: Thermometer,
      value: currentData?.temperatura,
      unit: '°C',
      color: 'from-red-500 to-orange-500',
      range: { min: -10, max: 50 },
      description: 'Temperatura ambiente',
    },
    {
      name: 'Umidade',
      icon: Droplet,
      value: currentData?.umidade,
      unit: '%',
      color: 'from-blue-500 to-cyan-500',
      range: { min: 0, max: 100 },
      description: 'Umidade relativa do ar',
    },
    {
      name: 'Luminosidade',
      icon: Sun,
      value: currentData?.luminosidade,
      unit: 'lux',
      color: 'from-yellow-500 to-amber-500',
      range: { min: 0, max: 4000 },
      description: 'Intensidade de luz',
    },
    {
      name: 'Movimento',
      icon: Motion,
      value: currentData?.movimento === 'Detectado' ? 100 : 0,
      unit: currentData?.movimento === 'Detectado' ? 'Detectado' : 'Não detectado',
      color: 'from-purple-500 to-pink-500',
      range: { min: 0, max: 100 },
      description: 'Detector de movimento',
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Detalhes dos Sensores</h1>
          <p className="text-muted-foreground">Monitoramento detalhado de cada sensor</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sensors.map((sensor) => {
              const Icon = sensor.icon
              const percentage =
                sensor.value !== undefined
                  ? ((sensor.value - sensor.range.min) /
                      (sensor.range.max - sensor.range.min)) *
                    100
                  : 0

              return (
                <div
                  key={sensor.name}
                  className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {sensor.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sensor.description}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${sensor.color}`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>

                  {/* Value Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      {sensor.name === 'Movimento' ? (
                        <span className={`text-4xl font-bold ${
                          currentData?.movimento === 'Detectado' 
                            ? 'text-green-500' 
                            : 'text-gray-400'
                        }`}>
                          {currentData?.movimento === 'Detectado' ? '✓' : '✕'}
                        </span>
                      ) : (
                        <span className="text-4xl font-bold text-foreground">
                          {typeof sensor.value === 'number'
                            ? sensor.value.toFixed(1)
                            : '-'}
                        </span>
                      )}
                      {sensor.name !== 'Movimento' && (
                        <span className="text-xl text-muted-foreground">
                          {sensor.unit}
                        </span>
                      )}
                      {sensor.name === 'Movimento' && (
                        <span className="text-xl text-muted-foreground">
                          {sensor.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {typeof sensor.value === 'number' && sensor.name !== 'Movimento' && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Min: {sensor.range.min}</span>
                        <span>Max: {sensor.range.max}</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${sensor.color} transition-all duration-300`}
                          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge for Movement */}
                  {sensor.name === 'Movimento' && (
                    <div className="mt-2">
                      <div className={`text-sm font-medium px-3 py-2 rounded-full w-fit ${
                        currentData?.movimento === 'Detectado'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {currentData?.movimento || 'Desconhecido'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
