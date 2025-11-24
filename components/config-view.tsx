"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings, Thermometer, Lightbulb, Clock, Save, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export function ConfigView() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    temperaturaLimite: 23,
    luminosidadeLimite: 2500,
    tempoSemMovimento: 20
  })

  const [tempConfig, setTempConfig] = useState(config)

  // Carregar configurações da API
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/configuracoes')
      const data = await response.json()
      
      if (data.success && data.data) {
        const newConfig = {
          temperaturaLimite: data.data.temperatura_limite,
          luminosidadeLimite: data.data.luminosidade_limite,
          tempoSemMovimento: data.data.tempo_sem_movimento
        }
        setConfig(newConfig)
        setTempConfig(newConfig)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const saveConfig = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperatura_limite: tempConfig.temperaturaLimite,
          luminosidade_limite: tempConfig.luminosidadeLimite,
          tempo_sem_movimento: tempConfig.tempoSemMovimento
        })
      })

      const data = await response.json()

      if (data.success) {
        setConfig(tempConfig)
        toast({
          title: "✅ Configurações Salvas",
          description: "As configurações foram atualizadas com sucesso!",
        })
      } else {
        toast({
          title: "❌ Erro",
          description: data.error || "Erro ao salvar configurações",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetConfig = () => {
    setTempConfig(config)
  }

  const hasChanges = 
    tempConfig.temperaturaLimite !== config.temperaturaLimite ||
    tempConfig.luminosidadeLimite !== config.luminosidadeLimite ||
    tempConfig.tempoSemMovimento !== config.tempoSemMovimento

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Configure os parâmetros do sistema de alertas de economia de energia</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações Editáveis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Parâmetros de Alerta</CardTitle>
              </div>
              <CardDescription>
                Ajuste os limites para detecção de economia de energia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temperatura */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium">Limite de Temperatura (°C)</Label>
                </div>
                <Input
                  type="number"
                  min="15"
                  max="35"
                  step="0.5"
                  value={tempConfig.temperaturaLimite}
                  onChange={(e) => setTempConfig({...tempConfig, temperaturaLimite: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Alerta quando temperatura for menor que este valor (15°C - 35°C)
                </p>
              </div>

              {/* Luminosidade */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <Label className="text-sm font-medium">Limite de Luminosidade (lux)</Label>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={tempConfig.luminosidadeLimite}
                  onChange={(e) => setTempConfig({...tempConfig, luminosidadeLimite: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Alerta quando luminosidade for maior que este valor (0 - 10000 lux)
                </p>
              </div>

              {/* Tempo sem movimento */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-medium">Tempo sem Movimento (segundos)</Label>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="600"
                  step="1"
                  value={tempConfig.tempoSemMovimento}
                  onChange={(e) => setTempConfig({...tempConfig, tempoSemMovimento: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Tempo necessário sem movimento antes de gerar alertas (1 - 600 segundos)
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={saveConfig} 
                  disabled={!hasChanges || loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button 
                  onClick={resetConfig} 
                  variant="outline"
                  disabled={!hasChanges || loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumo dos Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Alertas</CardTitle>
              <CardDescription>
                Condições atuais que acionam os alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alerta Ar Condicionado */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Ar Condicionado</h4>
                  <Badge variant="secondary">{config.temperaturaLimite}°C</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Temperatura &lt; {config.temperaturaLimite}°C por {config.tempoSemMovimento}s sem movimento
                </p>
              </div>

              {/* Alerta Luminosidade */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Luzes</h4>
                  <Badge variant="secondary">{config.luminosidadeLimite} lux</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Luminosidade &gt; {config.luminosidadeLimite} lux por {config.tempoSemMovimento}s sem movimento
                </p>
              </div>

              {/* Info sobre mudanças */}
              {hasChanges && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>⚠️ Alterações pendentes:</strong> Clique em "Salvar Alterações" para aplicar as novas configurações.
                  </p>
                </div>
              )}

              {/* Nota sobre persistência */}
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>💾 Persistente:</strong> As configurações são salvas no banco de dados PostgreSQL e aplicadas a todos os dispositivos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}