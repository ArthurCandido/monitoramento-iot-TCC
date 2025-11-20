import React from 'react'
import { Wifi, WifiOff, Loader } from 'lucide-react'

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'error'
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      icon: Wifi,
      text: 'Conectado',
      color: 'bg-green-500/10 border-green-500/30 text-green-300',
    },
    connecting: {
      icon: Loader,
      text: 'Conectando...',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    },
    error: {
      icon: WifiOff,
      text: 'Desconectado',
      color: 'bg-red-500/10 border-red-500/30 text-red-300',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-medium ${config.color}`}>
      <Icon className={`w-4 h-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {config.text}
    </div>
  )
}
