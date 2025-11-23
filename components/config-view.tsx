"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Settings, Thermometer, Lightbulb, Clock } from 'lucide-react'

// Configurações fixas do sistema (alteráveis apenas via código)
const CONFIG_SISTEMA = {
  temperaturaLimite: 23, // °C
  luminosidadeLimite: 2500, // lux  
  tempoSemMovimento: 20 // segundos
}

export function ConfigView() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Visualização das configurações ativas do sistema de alertas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações de Alerta */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Configurações de Alerta</CardTitle>
              </div>
              <CardDescription>
                Parâmetros do sistema de detecção de economia de energia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ar Condicionado */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium">Limite de Temperatura</Label>
                  <Badge variant="secondary">{CONFIG_SISTEMA.temperaturaLimite}°C</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alerta quando temperatura for menor que {CONFIG_SISTEMA.temperaturaLimite}°C sem movimento por {CONFIG_SISTEMA.tempoSemMovimento}s
                </p>
              </div>

              {/* Luminosidade */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <Label className="text-sm font-medium">Limite de Luminosidade</Label>
                  <Badge variant="secondary">{CONFIG_SISTEMA.luminosidadeLimite} lux</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alerta quando luminosidade for maior que {CONFIG_SISTEMA.luminosidadeLimite} lux sem movimento por {CONFIG_SISTEMA.tempoSemMovimento}s
                </p>
              </div>

              {/* Tempo sem movimento */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm font-medium">Tempo sem Movimento</Label>
                  <Badge variant="secondary">{CONFIG_SISTEMA.tempoSemMovimento}s</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tempo necessário sem movimento detectado antes de gerar alertas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumo dos Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Alertas</CardTitle>
              <CardDescription>
                Condições que acionam os alertas de economia de energia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alerta Ar Condicionado */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Ar Condicionado</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Temperatura &lt; {CONFIG_SISTEMA.temperaturaLimite}°C por {CONFIG_SISTEMA.tempoSemMovimento}s sem movimento
                </p>
              </div>

              {/* Alerta Luminosidade */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Luzes</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Luminosidade &gt; {CONFIG_SISTEMA.luminosidadeLimite} lux por {CONFIG_SISTEMA.tempoSemMovimento}s sem movimento
                </p>
              </div>

              {/* Nota sobre configuração */}
              <div className="mt-6 p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> As configurações são definidas no código fonte e não podem ser alteradas pela interface. 
                  Para modificar os valores, edite o arquivo <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">use-alert-system.ts</code>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}