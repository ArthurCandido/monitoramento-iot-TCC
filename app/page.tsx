'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/sidebar'
import DashboardView from '@/components/dashboard-view'
import SensorsView from '@/components/sensors-view'
import HistoryView from '@/components/history-view'
import AlertsView from '@/components/alerts-view'
import StatusView from '@/components/status-view'
import { ConfigView } from '@/components/config-view'
import { LabSelector } from '@/components/lab-selector'
import { LabsView } from '@/components/labs-view'
import { AlertHistoryView } from '@/components/alert-history-view'
import { NoDataView } from '@/components/no-data-view'
import ApiDocsPage from '@/app/docs/page'
import { useAlertSystem } from '@/hooks/use-alert-system'
import { LabProvider, useLab } from '@/contexts/lab-context'

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

function DashboardContent() {
  const { selectedLab, isLoading: isLabLoading } = useLab()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [events, setEvents] = useState<Array<{ id: number; type: string; message: string; timestamp: string }>>([])
  
  // Sistema de alertas com lógica de tempo correto - SEMPRE chamado
  const { analyzeData, alerts, alertStats, clearActiveAlerts } = useAlertSystem()

  useEffect(() => {
    // Só buscar dados se o laboratório está ativo
    if (!selectedLab?.ativo) return
    
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

          // Analisar dados com o sistema de alertas (com lógica de tempo)
          if (dataAtual) {
            analyzeData({
              temperatura: dataAtual.temperatura,
              umidade: dataAtual.umidade,
              luminosidade: dataAtual.luminosidade,
              movimento: dataAtual.movimento,
              timestamp: Date.now()
            })
          }

          // Usar alertas do sistema frontend para eventos
          if (alerts.length > 0) {
            const latestAlert = alerts[0]
            const newEvent = {
              id: latestAlert.timestamp,
              type: latestAlert.nivel,
              message: latestAlert.mensagem,
              timestamp: new Date(latestAlert.timestamp).toLocaleTimeString('pt-BR'),
            }
            setEvents((prev) => {
              // Evitar duplicatas
              const exists = prev.find(e => e.id === newEvent.id)
              if (!exists) {
                return [newEvent, ...prev.slice(0, 9)]
              }
              return prev
            })
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
  }, [selectedLab, analyzeData, alerts])

  const renderContent = () => {
    switch (activeSection) {
      case 'labs':
        return <LabsView />
      case 'sensors':
        return <SensorsView currentData={currentData} isLoading={isLoading} />
      case 'history':
        return <HistoryView historyData={historyData} />
      case 'alerts':
        return <AlertsView alerts={alerts} alertStats={alertStats} clearActiveAlerts={clearActiveAlerts} />
      case 'alert-history':
        return <AlertHistoryView />
      case 'status':
        return <StatusView connectionStatus={connectionStatus} />
      case 'config':
        return <ConfigView />
      case 'docs':
        return <ApiDocsPage />
      default:
        return (
          <DashboardView
            currentData={currentData}
            historyData={historyData}
            isLoading={isLoading}
            connectionStatus={connectionStatus}
            events={events}
            alerts={alerts}
          />
        )
    }
  }

  // Se ainda está carregando o contexto, mostrar loading
  if (isLabLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não há laboratório selecionado, mostrar seletor
  if (!selectedLab) {
    return <LabSelector />
  }

  // Se laboratório não está ativo, mostrar tela sem dados
  if (!selectedLab.ativo) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <NoDataView labName={selectedLab.nome} labDescription={selectedLab.descricao || ''} />
      </div>
    )
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

export default function Dashboard() {
  return (
    <LabProvider>
      <DashboardContent />
    </LabProvider>
  )
}
