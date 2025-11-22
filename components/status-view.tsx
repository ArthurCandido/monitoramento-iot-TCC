'use client'

import { useState, useEffect } from 'react'
import { Activity, Wifi, Database, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface SystemStatus {
  database: {
    status: 'connected' | 'error'
    lastCheck: string
    totalRecords: number
    lastRecord: string | null
  }
  esp32: {
    status: 'connected' | 'disconnected' | 'stale'
    lastDataReceived: string | null
    secondsSinceLastData: number | null
  }
  api: {
    status: 'operational'
    uptime: string
    timestamp: string
  }
}

interface StatusViewProps {
  connectionStatus: string
}

export default function StatusView({ connectionStatus }: StatusViewProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('/api/system-status', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setSystemStatus(result.data)
            setLastRefresh(new Date().toLocaleString('pt-BR'))
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status do sistema:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 10000) // Atualiza a cada 10s
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return 'bg-green-500'
      case 'connecting':
      case 'stale':
        return 'bg-yellow-500'
      case 'error':
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'operational':
        return 'Operacional'
      case 'connecting':
        return 'Conectando'
      case 'stale':
        return 'Dados antigos'
      case 'error':
        return 'Erro na Conexão'
      case 'disconnected':
        return 'Desconectado'
      default:
        return 'Desconhecido'
    }
  }

  const getTimeAgo = (seconds: number | null) => {
    if (seconds === null) return 'N/A'
    if (seconds < 60) return `${seconds}s atrás`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`
    return `${Math.floor(seconds / 3600)}h atrás`
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Status do Sistema</h1>
            <p className="text-muted-foreground">Carregando informações...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Status do Sistema</h1>
          <p className="text-muted-foreground">
            Informações em tempo real - Última atualização: {lastRefresh}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ESP32 Connection Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Conexão ESP32
                </h3>
                <p className="text-sm text-muted-foreground">Status de conectividade do sensor</p>
              </div>
              <Wifi size={24} className="text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(
                    systemStatus?.esp32?.status || connectionStatus
                  )}`}
                ></div>
                <span className="text-lg font-semibold text-foreground">
                  {getStatusText(systemStatus?.esp32?.status || connectionStatus)}
                </span>
              </div>
              {systemStatus?.esp32?.secondsSinceLastData && (
                <p className="text-sm text-muted-foreground">
                  Último dado: {getTimeAgo(systemStatus.esp32.secondsSinceLastData)}
                </p>
              )}
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Banco de Dados
                </h3>
                <p className="text-sm text-muted-foreground">PostgreSQL - Status de armazenamento</p>
              </div>
              <Database size={24} className="text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(systemStatus?.database?.status || 'error')}`}></div>
                <span className="text-lg font-semibold text-foreground">
                  {getStatusText(systemStatus?.database?.status || 'error')}
                </span>
              </div>
              {systemStatus?.database?.totalRecords && (
                <p className="text-sm text-muted-foreground">
                  Total de registros: {systemStatus.database.totalRecords.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* API Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  API do Sistema
                </h3>
                <p className="text-sm text-muted-foreground">Servidor de aplicação</p>
              </div>
              <Activity size={24} className="text-accent" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-lg font-semibold text-foreground">Operacional</span>
              </div>
              {systemStatus?.api?.uptime && (
                <p className="text-sm text-muted-foreground">
                  Uptime: {systemStatus.api.uptime}
                </p>
              )}
            </div>
          </div>

          {/* Last Update */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Última Sincronização
                </h3>
                <p className="text-sm text-muted-foreground">Timestamp da última atualização</p>
              </div>
              <Clock size={24} className="text-accent" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {systemStatus?.database?.lastRecord 
                  ? new Date(systemStatus.database.lastRecord).toLocaleString('pt-BR')
                  : 'N/A'
                }
              </p>
              {systemStatus?.esp32?.secondsSinceLastData !== null && systemStatus.esp32.secondsSinceLastData <= 10 && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-green-600">Dados em tempo real</span>
                </div>
              )}
              {systemStatus?.esp32?.secondsSinceLastData !== null && systemStatus.esp32.secondsSinceLastData > 10 && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-500" />
                  <span className="text-sm text-yellow-600">Dados desatualizados</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-6 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resumo do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getStatusColor(systemStatus?.esp32?.status || 'error')}`}></div>
              <p className="text-sm font-medium">ESP32</p>
              <p className="text-xs text-muted-foreground">{getStatusText(systemStatus?.esp32?.status || 'error')}</p>
            </div>
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getStatusColor(systemStatus?.database?.status || 'error')}`}></div>
              <p className="text-sm font-medium">PostgreSQL</p>
              <p className="text-xs text-muted-foreground">{getStatusText(systemStatus?.database?.status || 'error')}</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 rounded-full mx-auto mb-2 bg-green-500"></div>
              <p className="text-sm font-medium">API</p>
              <p className="text-xs text-muted-foreground">Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
