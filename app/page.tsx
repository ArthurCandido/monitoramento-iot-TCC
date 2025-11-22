'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/sidebar'
import DashboardView from '@/components/dashboard-view'
import SensorsView from '@/components/sensors-view'
import HistoryView from '@/components/history-view'
import AlertsView from '@/components/alerts-view'
import StatusView from '@/components/status-view'
import { ConfigView } from '@/components/config-view'
import { useAlertSystem } from '@/hooks/use-alert-system'

interface SensorData {
  temperatura: number
  umidade: number
  luminosidade: number
  movimento: string
  alerta_ar: string
  alerta_luz: string
  data_hora: string
  id: number
}

interface HistoryData {
  temperatura: number
  luminosidade: number
  data_hora: string
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [events, setEvents] = useState<Array<{ id: number; type: string; message: string; timestamp: string }>>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Adicionar timestamp para evitar cache do browser E do Vercel Edge
        const timestamp = Date.now()
        const cacheBust = Math.random().toString(36).substring(7)
        const [resAtual, resHist] = await Promise.all([
          fetch(`/api/atual?t=${timestamp}&bust=${cacheBust}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }),
          fetch(`/api/historico?t=${timestamp}&bust=${cacheBust}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }),
        ])

        if (resAtual.ok && resHist.ok) {
          const dataAtual = await resAtual.json()
          const dataHist = await resHist.json()

          console.log('🔄 Frontend: Dados recebidos da API atual:', dataAtual)
          console.log('🔄 Frontend: Dados recebidos da API histórico:', dataHist)

          setCurrentData(dataAtual)
          // PostgreSQL API retorna { success: true, data: [...] }
          const histArray = dataHist.data || dataHist || []
          setHistoryData(histArray)
          setConnectionStatus('connected')
          setIsLoading(false)

          if (dataAtual.alerta_ar !== 'OK' || dataAtual.alerta_luz !== 'OK') {
            const newEvent = {
              id: Date.now(),
              type: dataAtual.alerta_ar !== 'OK' ? 'warning' : 'warning',
              message: dataAtual.alerta_ar !== 'OK' ? dataAtual.alerta_ar : dataAtual.alerta_luz,
              timestamp: new Date().toLocaleTimeString('pt-BR'),
            }
            setEvents((prev) => [newEvent, ...prev.slice(0, 9)])
          }
        } else {
          setConnectionStatus('error')
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setConnectionStatus('error')
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case 'sensors':
        return <SensorsView currentData={currentData} isLoading={isLoading} />
      case 'history':
        return <HistoryView historyData={historyData} />
      case 'alerts':
        return <AlertsView currentData={currentData} />
      case 'status':
        return <StatusView connectionStatus={connectionStatus} />
      case 'config':
        return <ConfigView />
      default:
        return (
          <DashboardView
            currentData={currentData}
            historyData={historyData}
            isLoading={isLoading}
            connectionStatus={connectionStatus}
            events={events}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  )
}
