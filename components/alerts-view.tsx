'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Trash2, Search, Filter, Download, Archive, Lightbulb, Snowflake, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Alert {
  id: string
  tipo: 'ar-condicionado' | 'luzes'
  mensagem: string
  nivel: 'warning' | 'error'
  timestamp: number
}

interface HistoryAlert extends Alert {
  laboratorio: string
}

interface AlertStats {
  total: number
  errors: number
  warnings: number
  today: number
}

interface AlertsViewProps {
  alerts: Alert[]
  alertStats: AlertStats
  clearActiveAlerts: () => void
}

export default function AlertsView({ alerts, alertStats, clearActiveAlerts }: AlertsViewProps) {
  const [alertHistory, setAlertHistory] = useState<HistoryAlert[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryAlert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'ar-condicionado' | 'luzes'>('all')
  const [filterLevel, setFilterLevel] = useState<'all' | 'warning' | 'error'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Carregar histórico do localStorage
  useEffect(() => {
    console.log('🔄 AlertsView: Carregando histórico do localStorage')
    const savedHistory = localStorage.getItem('alert-history')
    console.log('📦 Dados do localStorage:', savedHistory)
    
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        console.log('✅ Histórico carregado:', history.length, 'alertas')
        setAlertHistory(history)
        setFilteredHistory(history)
      } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error)
      }
    } else {
      console.log('📭 Nenhum histórico encontrado no localStorage')
    }

    // Recarregar a cada 5 segundos para capturar novos alertas
    const interval = setInterval(() => {
      const updatedHistory = localStorage.getItem('alert-history')
      if (updatedHistory) {
        try {
          const history = JSON.parse(updatedHistory)
          setAlertHistory(history)
        } catch (error) {
          console.error('Erro ao recarregar histórico:', error)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Aplicar filtros ao histórico
  useEffect(() => {
    let filtered = alertHistory

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.laboratorio.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.tipo === filterType)
    }

    // Filtro por nível
    if (filterLevel !== 'all') {
      filtered = filtered.filter(alert => alert.nivel === filterLevel)
    }

    // Filtro por data
    if (startDate) {
      const start = startOfDay(new Date(startDate))
      filtered = filtered.filter(alert => 
        isAfter(new Date(alert.timestamp), start) || 
        alert.timestamp === start.getTime()
      )
    }

    if (endDate) {
      const end = endOfDay(new Date(endDate))
      filtered = filtered.filter(alert => 
        isBefore(new Date(alert.timestamp), end) ||
        alert.timestamp === end.getTime()
      )
    }

    // Ordenar por timestamp (mais recente primeiro)
    filtered = filtered.sort((a, b) => b.timestamp - a.timestamp)

    setFilteredHistory(filtered)
  }, [alertHistory, searchTerm, filterType, filterLevel, startDate, endDate])

  const getAlertTitle = (tipo: Alert['tipo']): string => {
    const tipos = {
      'ar-condicionado': 'Ar Condicionado',
      'luzes': 'Iluminação'
    }
    return tipos[tipo]
  }

  const getAlertColor = (nivel: Alert['nivel']) => {
    return nivel === 'error' 
      ? { bg: 'bg-red-500/10 border-red-500/30', icon: 'bg-red-500/20', text: 'text-red-500', badge: 'bg-red-500/20 text-red-500' }
      : { bg: 'bg-yellow-500/10 border-yellow-500/30', icon: 'bg-yellow-500/20', text: 'text-yellow-500', badge: 'bg-yellow-500/20 text-yellow-500' }
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'ar-condicionado':
        return <Snowflake className="h-4 w-4" />
      case 'luzes':
        return <Lightbulb className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const deleteHistoryAlert = (alertId: string) => {
    const updatedHistory = alertHistory.filter(alert => alert.id !== alertId)
    setAlertHistory(updatedHistory)
    localStorage.setItem('alert-history', JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de alertas?')) {
      setAlertHistory([])
      setFilteredHistory([])
      localStorage.removeItem('alert-history')
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Data/Hora', 'Tipo', 'Nível', 'Laboratório', 'Mensagem'],
      ...filteredHistory.map(alert => [
        format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        alert.tipo === 'ar-condicionado' ? 'Ar Condicionado' : 'Luzes',
        alert.nivel === 'error' ? 'Erro' : 'Aviso',
        alert.laboratorio,
        alert.mensagem.replace(/[💡❄️🟡🔴]/g, '') // Remove emojis
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `historico-alertas-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  // Estatísticas do histórico
  const historyStats = {
    total: alertHistory.length,
    arCondicionado: alertHistory.filter(a => a.tipo === 'ar-condicionado').length,
    luzes: alertHistory.filter(a => a.tipo === 'luzes').length,
    errors: alertHistory.filter(a => a.nivel === 'error').length,
    warnings: alertHistory.filter(a => a.nivel === 'warning').length,
    hoje: alertHistory.filter(a => {
      const today = startOfDay(new Date())
      return isAfter(new Date(a.timestamp), today) || a.timestamp === today.getTime()
    }).length,
    semana: alertHistory.filter(a => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return isAfter(new Date(a.timestamp), weekAgo)
    }).length
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sistema de Alertas</h1>
          <p className="text-muted-foreground">Gerenciamento de alertas ativos e histórico completo</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Alertas Ativos ({alerts.length})</TabsTrigger>
            <TabsTrigger value="history">Histórico ({alertHistory.length})</TabsTrigger>
          </TabsList>

          {/* Alertas Ativos */}
          <TabsContent value="active">
            {/* Estatísticas dos Alertas Ativos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{alertStats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{alertStats.errors}</p>
                      <p className="text-xs text-muted-foreground">Críticos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{alertStats.warnings}</p>
                      <p className="text-xs text-muted-foreground">Avisos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{alertStats.today}</p>
                      <p className="text-xs text-muted-foreground">Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações para Alertas Ativos */}
            {alerts.length > 0 && (
              <div className="mb-6">
                <Button 
                  onClick={clearActiveAlerts}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Limpar Todos os Alertas Ativos
                </Button>
              </div>
            )}

            {/* Lista de Alertas Ativos */}
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum alerta ativo</h3>
                  <p className="text-muted-foreground">Todos os sistemas estão funcionando normalmente!</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const colors = getAlertColor(alert.nivel)
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-lg border p-6 ${colors.bg}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${colors.icon}`}>
                          <AlertCircle size={24} className={colors.text} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{getAlertTitle(alert.tipo)}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{alert.mensagem}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock size={14} />
                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                          {alert.nivel === 'error' ? 'Crítico' : 'Aviso'}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Histórico de Alertas */}
          <TabsContent value="history">
            {/* Estatísticas do Histórico */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Snowflake className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.arCondicionado}</p>
                      <p className="text-xs text-muted-foreground">Ar Condicionado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.luzes}</p>
                      <p className="text-xs text-muted-foreground">Luzes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.errors}</p>
                      <p className="text-xs text-muted-foreground">Erros</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.warnings}</p>
                      <p className="text-xs text-muted-foreground">Avisos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.hoje}</p>
                      <p className="text-xs text-muted-foreground">Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{historyStats.semana}</p>
                      <p className="text-xs text-muted-foreground">7 dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações do Histórico */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div />
              <div className="flex gap-2">
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button onClick={clearHistory} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Histórico
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar alertas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="ar-condicionado">Ar Condicionado</option>
                      <option value="luzes">Luzes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nível</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="error">Erros</option>
                      <option value="warning">Avisos</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Inicial</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Final</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Histórico */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Histórico de Alertas ({filteredHistory.length})
                </CardTitle>
                <CardDescription>
                  {filteredHistory.length === 0 ? 
                    'Nenhum alerta encontrado' : 
                    `Mostrando ${filteredHistory.length} de ${alertHistory.length} alertas`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum alerta no histórico</p>
                    </div>
                  ) : (
                    filteredHistory.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-4 p-4 border rounded-lg group hover:border-destructive/30 transition-colors">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {alert.mensagem}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={alert.nivel === 'error' ? 'destructive' : 'outline'} className="text-xs">
                                  {alert.nivel === 'error' ? 'Erro' : 'Aviso'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {alert.laboratorio}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(alert.timestamp), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(alert.timestamp), 'HH:mm:ss', { locale: ptBR })}
                                </p>
                              </div>
                              <Button
                                onClick={() => {
                                  if (confirm('Deletar este alerta?')) {
                                    deleteHistoryAlert(alert.id)
                                  }
                                }}
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
