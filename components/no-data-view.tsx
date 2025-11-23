"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, AlertCircle, Settings, Monitor } from 'lucide-react'
import { useLab } from '@/contexts/lab-context'

interface NoDataViewProps {
  labName: string
  labDescription: string
}

export function NoDataView({ labName, labDescription }: NoDataViewProps) {
  const { laboratories, setSelectedLab } = useLab()

  const goToE105 = () => {
    const e105 = laboratories.find(lab => lab.id === 'E105')
    if (e105) {
      setSelectedLab(e105)
    }
  }
  return (
    <main className="flex-1 overflow-y-auto bg-muted/10">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Monitor className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{labName}</h1>
              <p className="text-muted-foreground">{labDescription}</p>
            </div>
            <Badge variant="secondary" className="ml-2">
              <WifiOff className="w-3 h-3 mr-1" />
              Inativo
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <AlertCircle className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Sistema Não Configurado</CardTitle>
                <CardDescription>
                  Este laboratório não possui sensores IoT instalados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-muted-foreground mb-2">Sensores</h3>
                <p className="text-2xl font-bold text-muted-foreground">---</p>
                <p className="text-sm text-muted-foreground">Não configurado</p>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-muted-foreground mb-2">Status</h3>
                <p className="text-2xl font-bold text-muted-foreground">---</p>
                <p className="text-sm text-muted-foreground">Sem dados</p>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-muted-foreground mb-2">Protótipo</h3>
                <p className="text-2xl font-bold text-muted-foreground">---</p>
                <p className="text-sm text-muted-foreground">Indisponível</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Localização:</span>
                <span className="font-medium">Bloco E - {labName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">Laboratório de Informática</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacidade:</span>
                <span className="font-medium">20-30 alunos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sistema IoT:</span>
                <span className="font-medium text-gray-500">Não instalado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔬 Sistema Ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Monitor className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  E105 - Protótipo Ativo
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  Sistema de monitoramento funcionando com dados em tempo real
                </p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={goToE105}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Ir para E105
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Implementação Futura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Este laboratório fará parte da expansão do sistema de monitoramento IoT. 
                Quando implementado, incluirá:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-semibold">🌡️ Sensores de Temperatura</h4>
                  <p className="text-muted-foreground">Monitoramento de ar condicionado</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">💡 Sensores de Luminosidade</h4>
                  <p className="text-muted-foreground">Controle inteligente de iluminação</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">🚶 Sensores de Movimento</h4>
                  <p className="text-muted-foreground">Detecção de presença</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">📊 Alertas Inteligentes</h4>
                  <p className="text-muted-foreground">Sistema de economia de energia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}