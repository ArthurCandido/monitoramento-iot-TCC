'use client'

import { Activity, Wifi, Database, Clock } from 'lucide-react'

interface StatusData {
  connectionStatus: string
  uptime: string
  totalRecords: number
  lastUpdate: string
}

interface StatusViewProps {
  connectionStatus: string
}

export default function StatusView({ connectionStatus }: StatusViewProps) {
  const statusInfo: StatusData = {
    connectionStatus: connectionStatus,
    uptime: 'N/A',
    totalRecords: 0,
    lastUpdate: new Date().toLocaleString('pt-BR'),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'connecting':
        return 'Conectando'
      case 'error':
        return 'Erro na Conexão'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Status do Sistema</h1>
          <p className="text-muted-foreground">Informações gerais e estado operacional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Conexão ESP32
                </h3>
                <p className="text-sm text-muted-foreground">Status de conectividade</p>
              </div>
              <Wifi size={24} className="text-accent" />
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  statusInfo.connectionStatus
                )}`}
              ></div>
              <span className="text-lg font-semibold text-foreground">
                {getStatusText(statusInfo.connectionStatus)}
              </span>
            </div>
          </div>

          {/* Last Update */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Última Atualização
                </h3>
                <p className="text-sm text-muted-foreground">Timestamp de sincronização</p>
              </div>
              <Clock size={24} className="text-accent" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              {statusInfo.lastUpdate}
            </p>
          </div>

          {/* System Activity */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Atividade do Sistema
                </h3>
                <p className="text-sm text-muted-foreground">Operações em tempo real</p>
              </div>
              <Activity size={24} className="text-accent" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-foreground">Sistema operacional</span>
            </div>
          </div>

          {/* Database */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Banco de Dados
                </h3>
                <p className="text-sm text-muted-foreground">Status de armazenamento</p>
              </div>
              <Database size={24} className="text-accent" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-foreground">Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
