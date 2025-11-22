'use client'

import ChartSection from '@/components/chart-section'

interface HistoryData {
  temperatura: number
  luminosidade: number
  data_hora?: string  // formato antigo
  timestamp?: string  // formato PostgreSQL
}

interface HistoryViewProps {
  historyData: HistoryData[]
}

export default function HistoryView({ historyData }: HistoryViewProps) {
  // Validação de segurança
  const safeHistoryData = Array.isArray(historyData) ? historyData : []
  
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Histórico de Dados</h1>
          <p className="text-muted-foreground">Análise de tendências e padrões históricos</p>
        </div>

        <ChartSection historyData={safeHistoryData} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Total de Registros</p>
            <p className="text-3xl font-bold text-foreground">{safeHistoryData.length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Período Monitorado</p>
            <p className="text-lg font-semibold text-foreground">
              {safeHistoryData.length > 0
                ? `${new Date(safeHistoryData[0].timestamp || safeHistoryData[0].data_hora || '').toLocaleDateString('pt-BR')}`
                : 'N/A'}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <p className="text-lg font-semibold text-green-500">Ativo</p>
          </div>
        </div>
      </div>
    </main>
  )
}
