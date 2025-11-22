"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Settings, Save, RefreshCw, Thermometer, Lightbulb } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface AlertConfig {
  tempoSemMovimento: number
}

const defaultConfig: AlertConfig = {
  tempoSemMovimento: 20, // segundos sem movimento (padrão 20 segundos)
}

// Valores fixos do sistema
const TEMPERATURA_LIMITE = 23 // °C - fixo
const LUMINOSIDADE_LIMITE = 2500 // lux - fixo

export function ConfigView() {
  const [config, setConfig] = useState<AlertConfig>(defaultConfig)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Carregar configurações
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        // Carregar do localStorage primeiro
        const savedConfig = localStorage.getItem('iot-alert-config')
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig))
        }
        
        // Carregar do backend para sincronizar
        const response = await fetch('/api/config-alertas')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.config) {
            setConfig(result.config)
            // Atualizar localStorage com dados do backend
            localStorage.setItem('iot-alert-config', JSON.stringify(result.config))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
    
    carregarConfiguracoes()
  }, [])

  // Salvar configurações
  const salvarConfiguracoes = async () => {
    setIsSaving(true)
    try {
      // Salvar no localStorage (frontend)
      localStorage.setItem('iot-alert-config', JSON.stringify(config))
      
      // Enviar para o backend
      const response = await fetch('/api/config-alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Configurações salvas!",
          description: "Alertas atualizados no sistema.",
        })
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações no backend.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Resetar configurações
  const resetarConfiguracoes = () => {
    setConfig(defaultConfig)
    toast({
      title: "🔄 Configurações resetadas",
      description: "Valores padrão restaurados.",
    })
  }

  // Testar conexão com backend
  const testarConexao = async () => {
    try {
      const response = await fetch('/api/config-alertas')
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Conexão OK!",
          description: "Backend respondendo corretamente.",
        })
      } else {
        toast({
          title: "⚠️ Backend não configurado",
          description: "Ainda não há configurações salvas no backend.",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar ao backend.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Configurações de Alertas</h1>
          </div>
          <Badge variant="default" className="w-fit">
            Economia de Energia
          </Badge>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Alertas de Ar Condicionado */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Thermometer className="h-5 w-5 text-blue-500" />
              Alerta de Ar Condicionado
            </CardTitle>
            <CardDescription>
              Detecta desperdício de energia com ar condicionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  Temperatura limite (°C) - Fixo
                </Label>
                <div className="mt-1 p-3 bg-muted/30 rounded-md border">
                  <span className="text-lg font-semibold">{TEMPERATURA_LIMITE}°C</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Alerta se temperatura &lt; {TEMPERATURA_LIMITE}°C sem movimento por {config.tempoSemMovimento}s
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Luzes */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Alerta de Luzes Acesas
            </CardTitle>
            <CardDescription>
              Detecta luzes acesas desnecessariamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Luminosidade limite (lux) - Fixo
              </Label>
              <div className="mt-1 p-3 bg-muted/30 rounded-md border">
                <span className="text-lg font-semibold">{LUMINOSIDADE_LIMITE} lux</span>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Alerta se luminosidade &gt; {LUMINOSIDADE_LIMITE} lux sem movimento por {config.tempoSemMovimento}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuração do Tempo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            ⏱️ Configuração de Tempo
          </CardTitle>
          <CardDescription>
            Defina por quanto tempo sem movimento os alertas devem ser ativados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tempoMovimento" className="text-sm font-medium">
                Tempo sem movimento (segundos)
              </Label>
              <Input
                id="tempoMovimento"
                type="number"
                value={config.tempoSemMovimento}
                onChange={(e) => setConfig({...config, tempoSemMovimento: Number(e.target.value)})}
                min="10"
                max="300"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Entre 10 segundos e 5 minutos (300s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={salvarConfiguracoes} 
          disabled={isSaving}
          className="flex-1 sm:flex-none sm:min-w-[200px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
        
        <Button 
          onClick={resetarConfiguracoes}
          variant="outline"
          className="flex-1 sm:flex-none sm:min-w-[150px]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restaurar Padrão
        </Button>
        
        <Button 
          onClick={testarConexao}
          variant="secondary"
          className="flex-1 sm:flex-none sm:min-w-[120px]"
        >
          🔗 Testar Backend
        </Button>
      </div>

      {/* Preview das Configurações */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">❄️ Ar Condicionado:</span>
                <span className="text-muted-foreground">Temp &lt; {TEMPERATURA_LIMITE}°C por {config.tempoSemMovimento}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">💡 Luzes:</span>
                <span className="text-muted-foreground">Luz &gt; {LUMINOSIDADE_LIMITE} lux por {config.tempoSemMovimento}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">⏱️ Tempo configurável:</span>
                <span className="text-primary font-semibold">{config.tempoSemMovimento} segundos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}