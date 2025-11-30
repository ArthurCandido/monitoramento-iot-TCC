'use client'

import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BarChart, Bar } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock } from 'lucide-react'

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
  const [timeRange, setTimeRange] = useState('10') // em minutos
  
  // Validação de segurança - garantir que historyData é um array
  const safeHistoryData = Array.isArray(historyData) ? historyData : []
  
  // Filtrar dados baseado no intervalo selecionado
  const filteredData = useMemo(() => {
    if (safeHistoryData.length === 0) return []
    
    const now = Date.now()
    const rangeMs = parseInt(timeRange) * 60 * 1000 // converter minutos para ms
    
    return safeHistoryData.filter(d => {
      const dataTime = new Date(d.timestamp || d.data_hora).getTime()
      return (now - dataTime) <= rangeMs
    })
  }, [safeHistoryData, timeRange])
  
  if (safeHistoryData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Histórico de Dados</h2>
        <p className="text-muted-foreground">Aguardando dados históricos...</p>
      </div>
    )
  }
  
  const chartData = filteredData.map((d) => ({
    time: new Date(d.timestamp || d.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temperatura: d.temperatura,
    luminosidade: Math.round(d.luminosidade / 100),
  }))

  // Calculate statistics
  const temps = filteredData.map((d) => d.temperatura)
  const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '0'
  const maxTemp = temps.length > 0 ? Math.max(...temps).toFixed(1) : '0'
  const minTemp = temps.length > 0 ? Math.min(...temps).toFixed(1) : '0'

  return (
    <div className="space-y-6 mb-8">
      {/* Time Range Selector */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Intervalo de Tempo</h3>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Últimos 5 minutos</SelectItem>
              <SelectItem value="10">Últimos 10 minutos</SelectItem>
              <SelectItem value="15">Últimos 15 minutos</SelectItem>
              <SelectItem value="30">Últimos 30 minutos</SelectItem>
              <SelectItem value="60">Última 1 hora</SelectItem>
              <SelectItem value="120">Últimas 2 horas</SelectItem>
              <SelectItem value="180">Últimas 3 horas</SelectItem>
              <SelectItem value="360">Últimas 6 horas</SelectItem>
              <SelectItem value="720">Últimas 12 horas</SelectItem>
              <SelectItem value="1440">Últimas 24 horas</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {filteredData.length} registro(s) no período
          </div>
        </div>
      </div>
      
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
