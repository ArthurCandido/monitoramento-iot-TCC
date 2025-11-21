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
  temperaturaLimite: number
  luminosidadeLimite: number
  tempoSemMovimento: number
}

const defaultConfig: AlertConfig = {
  temperaturaLimite: 23, // Se temp < 23°C sem movimento = alerta ar condicionado
  luminosidadeLimite: 2500, // Se luz > 2500 lux sem movimento = alerta luzes
  tempoSemMovimento: 300, // segundos sem movimento (5 minutos)
}

export function ConfigView() {
  const [config, setConfig] = useState<AlertConfig>(defaultConfig)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Carregar configurações
  useEffect(() => {
    const savedConfig = localStorage.getItem('iot-alert-config')
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
  }, [])

  // Salvar configurações
  const salvarConfiguracoes = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('iot-alert-config', JSON.stringify(config))
      
      toast({
        title: "✅ Configurações salvas!",
        description: "Alertas atualizados com sucesso.",
      })
    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
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
                <Label htmlFor="tempLimite" className="text-sm font-medium">
                  Temperatura limite (°C)
                </Label>
                <Input
                  id="tempLimite"
                  type="number"
                  value={config.temperaturaLimite}
                  onChange={(e) => setConfig({...config, temperaturaLimite: Number(e.target.value)})}
                  min="15"
                  max="30"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tempoMovimento" className="text-sm font-medium">
                  Tempo sem movimento (segundos)
                </Label>
                <Input
                  id="tempoMovimento"
                  type="number"
                  value={config.tempoSemMovimento}
                  onChange={(e) => setConfig({...config, tempoSemMovimento: Number(e.target.value)})}
                  min="30"
                  max="1800"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Alerta se temperatura &lt; {config.temperaturaLimite}°C sem movimento por {config.tempoSemMovimento}s
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
              <Label htmlFor="luzLimite" className="text-sm font-medium">
                Luminosidade limite (lux)
              </Label>
              <Input
                id="luzLimite"
                type="number"
                value={config.luminosidadeLimite}
                onChange={(e) => setConfig({...config, luminosidadeLimite: Number(e.target.value)})}
                min="1000"
                max="4000"
                className="mt-1"
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Alerta se luminosidade &gt; {config.luminosidadeLimite} lux sem movimento por {config.tempoSemMovimento}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
      </div>

      {/* Preview das Configurações */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Resumo das Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="font-medium">❄️ Ar Condicionado:</span>
              <p className="text-muted-foreground">Se &lt; {config.temperaturaLimite}°C por {config.tempoSemMovimento}s</p>
            </div>
            <div className="space-y-1">
              <span className="font-medium">💡 Luzes:</span>
              <p className="text-muted-foreground">Se &gt; {config.luminosidadeLimite} lux por {config.tempoSemMovimento}s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}