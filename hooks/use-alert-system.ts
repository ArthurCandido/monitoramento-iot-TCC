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
}

const defaultConfig: AlertConfig = {
  temperaturaLimite: 23,
  luminosidadeLimite: 2500,
  tempoSemMovimento: 20, // segundos (padrão 20 segundos)
}

export function useAlertSystem() {
  const [config, setConfig] = useState<AlertConfig>(defaultConfig)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastMovementTime, setLastMovementTime] = useState<number>(Date.now())
  const { toast } = useToast()

  // Configurações fixas - apenas via código
  // Para alterar: modifique os valores em defaultConfig acima

  // Usar ref para manter lastMovementTime atualizado nas dependências
  const lastMovementTimeRef = useRef(lastMovementTime)
  
  useEffect(() => {
    lastMovementTimeRef.current = lastMovementTime
  }, [lastMovementTime])

  // Adicionar novo alerta
  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    }
    
    setAlerts(prev => {
      // Verificar se já existe um alerta ativo do mesmo tipo (não verificar por tempo)
      const hasActiveAlert = prev.some(existingAlert => 
        existingAlert.tipo === newAlert.tipo
      )
      
      // Se não há alerta ativo do mesmo tipo, adicionar o novo alerta
      if (!hasActiveAlert) {
        // Manter apenas os últimos 20 alertas
        const updatedAlerts = [newAlert, ...prev].slice(0, 20)
        
        // Mostrar toast simples
        toast({
          title: getAlertTitle(newAlert.tipo, newAlert.nivel),
          description: newAlert.mensagem,
          variant: newAlert.nivel === 'error' ? 'destructive' : 'default'
        })
        
        return updatedAlerts
      }
      
      return prev
    })
  }, [toast])

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

  // Limpar alertas ativos por tipo
  const clearActiveAlerts = useCallback((tipoAlerta?: 'ar-condicionado' | 'luzes') => {
    setAlerts(prev => {
      if (tipoAlerta) {
        // Limpar apenas alertas do tipo específico
        return prev.filter(alert => alert.tipo !== tipoAlerta)
      } else {
        // Limpar todos os alertas ativos
        return []
      }
    })
  }, [])

  // Analisar dados dos sensores e gerar alertas
  const analyzeData = useCallback((data: SensorData) => {
    const now = Date.now()
    
    // Atualizar último movimento detectado
    if (data.movimento === 'Detectado') {
      console.log('🚶 Movimento detectado - resetando timer e limpando alertas')
      const newTime = now
      setLastMovementTime(newTime)
      lastMovementTimeRef.current = newTime
      // Limpar todos os alertas ativos quando movimento é detectado
      clearActiveAlerts()
      return // Se há movimento, não gerar alertas de economia
    }
    
    // Calcular tempo sem movimento em segundos usando a ref
    const tempoSemMovimentoSegundos = (now - lastMovementTimeRef.current) / 1000
    
    console.log('⏰ Timer sem movimento:', {
      tempoAtual: Math.round(tempoSemMovimentoSegundos),
      tempoLimite: config.tempoSemMovimento,
      precisaGerar: tempoSemMovimentoSegundos >= config.tempoSemMovimento,
      lastMovementRef: new Date(lastMovementTimeRef.current).toLocaleTimeString(),
      agora: new Date(now).toLocaleTimeString()
    })
    
    // Só gerar alertas se passou o tempo configurado sem movimento
    if (tempoSemMovimentoSegundos >= config.tempoSemMovimento) {
      
      // Alerta de ar condicionado (temperatura baixa indica ar ligado)
      if (data.temperatura < config.temperaturaLimite) {
        addAlert({
          tipo: 'ar-condicionado',
          nivel: 'error',
          mensagem: `❄️ Ar condicionado ligado há ${Math.round(tempoSemMovimentoSegundos)}s sem ninguém! Temp: ${data.temperatura.toFixed(1)}°C`
        })
      }
      
      // Alerta de luzes acesas
      if (data.luminosidade > config.luminosidadeLimite) {
        addAlert({
          tipo: 'luzes',
          nivel: 'warning',
          mensagem: `💡 Luzes acesas há ${Math.round(tempoSemMovimentoSegundos)}s sem ninguém! Luminosidade: ${data.luminosidade} lux`
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