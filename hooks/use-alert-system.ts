"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from './use-toast'

interface SensorData {
  temperatura: number
  umidade: number
  luminosidade: number
  movimento: string
  timestamp: number
}

interface AlertConfig {
  temperaturaLimite: number
  luminosidadeLimite: number
  tempoSemMovimento: number
}

interface Alert {
  id: string
  tipo: 'ar-condicionado' | 'luzes'
  mensagem: string
  nivel: 'warning' | 'error'
  timestamp: number
  timestampInicio: number // Quando o alerta começou
}

interface HistoryAlert {
  tipo: 'ar-condicionado' | 'luzes'
  mensagem: string
  nivel: 'warning' | 'error'
  laboratorio: string
  timestampInicio: number
  timestampFim: number
  duracaoSegundos: number
}

const defaultConfig: AlertConfig = {
  temperaturaLimite: 23,
  luminosidadeLimite: 2500,
  tempoSemMovimento: 20,
}

export function useAlertSystem() {
  const [config, setConfig] = useState<AlertConfig>(defaultConfig)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastMovementTime, setLastMovementTime] = useState<number>(() => Date.now())
  const { toast } = useToast()

  // Carregar configurações da API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/configuracoes')
        const data = await response.json()
        
        if (data.success && data.data) {
          setConfig({
            temperaturaLimite: data.data.temperatura_limite,
            luminosidadeLimite: data.data.luminosidade_limite,
            tempoSemMovimento: data.data.tempo_sem_movimento
          })
          console.log('✅ Configurações carregadas da API:', data.data)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error)
      }
    }

    loadConfig()
    
    // Recarregar configurações a cada 30 segundos
    const interval = setInterval(loadConfig, 30000)
    return () => clearInterval(interval)
  }, [])

  // Configurações fixas - apenas via código
  // Para alterar: modifique os valores em defaultConfig acima

  // Usar ref para manter lastMovementTime atualizado nas dependências
  const lastMovementTimeRef = useRef<number>(Date.now())
  
  useEffect(() => {
    lastMovementTimeRef.current = lastMovementTime
  }, [lastMovementTime])

  // Salvar alerta no histórico via API quando for desativado
  const saveToHistory = useCallback(async (alert: Alert, timestampFim: number) => {
    try {
      const duracaoSegundos = Math.round((timestampFim - alert.timestampInicio) / 1000)
      
      console.log(`🔄 Salvando alerta no histórico via API (duração: ${duracaoSegundos}s):`, alert)
      
      let labName = 'Laboratório Desconhecido'
      
      try {
        const currentLab = localStorage.getItem('selected-lab')
        if (currentLab) {
          const labData = JSON.parse(currentLab)
          labName = labData.nome || labData.id || currentLab
        }
      } catch (parseError) {
        const currentLab = localStorage.getItem('selected-lab')
        if (currentLab) {
          labName = currentLab
        }
      }
      
      const historyAlert: HistoryAlert = {
        tipo: alert.tipo,
        mensagem: `${alert.mensagem} (Duração: ${duracaoSegundos}s)`,
        nivel: alert.nivel,
        laboratorio: labName,
        timestampInicio: alert.timestampInicio,
        timestampFim: timestampFim,
        duracaoSegundos: duracaoSegundos
      }
      
      console.log('📝 Enviando para /api/alertas:', historyAlert)
      
      const response = await fetch('/api/alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(historyAlert)
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Alerta salvo no PostgreSQL:', data.data)
      } else {
        console.error('❌ Erro ao salvar alerta:', data.error)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar histórico de alertas via API:', error)
    }
  }, [])

  // Adicionar novo alerta
  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'timestampInicio'>) => {
    const now = Date.now()
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: now,
      timestampInicio: now
    }
    
    console.log('🔔 Novo alerta gerado:', newAlert)
    
    // Verificar se já existe um alerta ativo do mesmo tipo
    const hasActiveAlert = alerts.some(existingAlert => 
      existingAlert.tipo === newAlert.tipo
    )
    
    console.log('🔍 Já existe alerta ativo do mesmo tipo?', hasActiveAlert)
    
    // Se não há alerta ativo do mesmo tipo, adicionar o novo alerta aos ativos
    if (!hasActiveAlert) {
      // Adicionar ao estado local (NÃO salva no histórico ainda)
      setAlerts(prev => {
        const updatedAlerts = [newAlert, ...prev].slice(0, 20)
        return updatedAlerts
      })
      
      // Mostrar toast simples
      toast({
        title: getAlertTitle(newAlert.tipo, newAlert.nivel),
        description: newAlert.mensagem,
        variant: newAlert.nivel === 'error' ? 'destructive' : 'default'
      })
      
      console.log('✅ Alerta ativado (será salvo no histórico quando for desativado)')
    } else {
      console.log('⚠️ Alerta não adicionado - já existe ativo do mesmo tipo')
    }
  }, [alerts, toast])

  // Gerar título do alerta
  const getAlertTitle = (tipo: Alert['tipo'], nivel: Alert['nivel']): string => {
    const prefixes = {
      warning: '🟡 Aviso',
      error: '🔴 Alerta'
    }
    
    const tipos = {
      'ar-condicionado': 'Ar Condicionado',
      'luzes': 'Luzes'
    }
    
    return `${prefixes[nivel]} - ${tipos[tipo]}`
  }

  // Limpar alertas ativos por tipo e salvar no histórico
  const clearActiveAlerts = useCallback(async (tipoAlerta?: 'ar-condicionado' | 'luzes') => {
    const now = Date.now()
    
    // Pegar alertas que serão removidos para salvar no histórico
    const alertsToSave = tipoAlerta 
      ? alerts.filter(alert => alert.tipo === tipoAlerta)
      : alerts
    
    // Salvar cada alerta no histórico com informação de duração
    for (const alert of alertsToSave) {
      await saveToHistory(alert, now)
    }
    
    console.log(`📝 ${alertsToSave.length} alerta(s) salvo(s) no histórico`)
    
    // Agora sim limpar os alertas ativos
    setAlerts(prev => {
      if (tipoAlerta) {
        return prev.filter(alert => alert.tipo !== tipoAlerta)
      } else {
        return []
      }
    })
  }, [alerts, saveToHistory])

  // Analisar dados dos sensores e gerar alertas
  const analyzeData = useCallback((data: SensorData) => {
    const now = Date.now()
    
    // Atualizar último movimento detectado
    if (data.movimento === 'Detectado') {
      const newTime = now
      setLastMovementTime(newTime)
      lastMovementTimeRef.current = newTime
      // Limpar todos os alertas ativos quando movimento é detectado
      clearActiveAlerts()
      return // Se há movimento, não gerar alertas de economia
    }
    
    // Calcular tempo sem movimento em segundos usando a ref
    const tempoSemMovimentoSegundos = (now - lastMovementTimeRef.current) / 1000
    
    // Só gerar alertas se passou o tempo configurado sem movimento
    if (tempoSemMovimentoSegundos >= config.tempoSemMovimento) {
      
      // Alerta de ar condicionado (temperatura baixa indica ar ligado)
      if (data.temperatura < config.temperaturaLimite) {
        addAlert({
          tipo: 'ar-condicionado',
          nivel: 'error',
          mensagem: `❄️ Ar condicionado ligado sem ninguém! Temp: ${data.temperatura.toFixed(1)}°C`
        })
      }
      
      // Alerta de luzes acesas
      if (data.luminosidade > config.luminosidadeLimite) {
        addAlert({
          tipo: 'luzes',
          nivel: 'warning',
          mensagem: `💡 Luzes acesas sem ninguém! Luminosidade: ${data.luminosidade} lux`
        })
      }
    }
    
  }, [config, addAlert, clearActiveAlerts])

  // Limpar alertas antigos
  const clearOldAlerts = useCallback(() => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    setAlerts(prev => prev.filter(alert => alert.timestamp > oneDayAgo))
  }, [])

  // Remover alerta específico
  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  // Limpar todos os alertas
  const clearAllAlerts = useCallback(() => {
    setAlerts([])
  }, [])



  // Estatísticas dos alertas
  const alertStats = {
    total: alerts.length,
    errors: alerts.filter(a => a.nivel === 'error').length,
    warnings: alerts.filter(a => a.nivel === 'warning').length,
    today: alerts.filter(a => Date.now() - a.timestamp < 24 * 60 * 60 * 1000).length
  }

  // Limpeza automática a cada hora
  useEffect(() => {
    const interval = setInterval(clearOldAlerts, 60 * 60 * 1000) // 1 hora
    return () => clearInterval(interval)
  }, [clearOldAlerts])

  return {
    config,
    alerts,
    alertStats,
    lastMovementTime: lastMovementTimeRef.current,
    analyzeData,
    removeAlert,
    clearAllAlerts,
    clearActiveAlerts,
    addAlert
  }
}