'use client'

import { useEffect, useState } from 'react'
import DashboardHeader from '@/components/dashboard-header'
import SensorCards from '@/components/sensor-cards'
import AlertBox from '@/components/alert-box'
import ChartSection from '@/components/chart-section'
import EventLog from '@/components/event-log'
import ConnectionStatus from '@/components/connection-status'

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

interface DashboardViewProps {
  currentData: SensorData | null
  historyData: HistoryData[]
  isLoading: boolean
  connectionStatus: string
  events: Array<{ id: number; type: string; message: string; timestamp: string }>
}

export default function DashboardView({
  currentData,
  historyData,
  isLoading,
  connectionStatus,
  events,
}: DashboardViewProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        {/* Connection Status */}
        <div className="mb-6">
          <ConnectionStatus status={connectionStatus} />
        </div>

        {/* Alert Boxes */}
        {currentData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <AlertBox
              title="Ar Condicionado"
              message={currentData.alerta_ar}
              isAlert={currentData.alerta_ar !== 'OK'}
            />
            <AlertBox
              title="Iluminação"
              message={currentData.alerta_luz}
              isAlert={currentData.alerta_luz !== 'OK'}
            />
          </div>
        )}

        {/* Sensor Cards */}
        <SensorCards data={currentData} isLoading={isLoading} />

        {/* Charts Section */}
        <ChartSection historyData={historyData} />

        {/* Event Log */}
        <EventLog events={events} />
      </div>
    </main>
  )
}
