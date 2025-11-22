'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart, Bar } from 'recharts'

interface HistoryData {
  temperatura: number
  luminosidade: number
  data_hora?: string  // formato antigo
  timestamp?: string  // formato PostgreSQL
}

interface ChartSectionProps {
  historyData: HistoryData[]
}

export default function ChartSection({ historyData }: ChartSectionProps) {
  // Validação de segurança - garantir que historyData é um array
  const safeHistoryData = Array.isArray(historyData) ? historyData : []
  
  if (safeHistoryData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Histórico de Dados</h2>
        <p className="text-muted-foreground">Aguardando dados históricos...</p>
      </div>
    )
  }
  
  const chartData = safeHistoryData.map((d) => ({
    time: new Date(d.timestamp || d.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temperatura: d.temperatura,
    luminosidade: Math.round(d.luminosidade / 100),
  }))

  // Calculate statistics
  const temps = safeHistoryData.map((d) => d.temperatura)
  const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '0'
  const maxTemp = temps.length > 0 ? Math.max(...temps).toFixed(1) : '0'
  const minTemp = temps.length > 0 ? Math.min(...temps).toFixed(1) : '0'

  return (
    <div className="space-y-6 mb-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Temperatura Média</p>
          <p className="text-2xl font-bold text-primary">{avgTemp}°C</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Máxima</p>
          <p className="text-2xl font-bold text-accent">{maxTemp}°C</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Mínima</p>
          <p className="text-2xl font-bold text-secondary">{minTemp}°C</p>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Histórico de Temperatura</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #2d3748',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f5f5f5' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperatura"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="Temperatura (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Luminosity Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Histórico de Luminosidade</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #2d3748',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f5f5f5' }}
            />
            <Legend />
            <Bar dataKey="luminosidade" fill="#0ea5e9" name="Luminosidade (x100 lux)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
