'use client'

import { useLab } from '@/contexts/lab-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Monitor, Wifi, WifiOff, MapPin, Check } from 'lucide-react'

export function LabsView() {
  const { laboratories, selectedLab, setSelectedLab } = useLab()

  const handleLabSelect = (lab: any) => {
    setSelectedLab(lab)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Building className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laboratórios</h1>
          <p className="text-muted-foreground">Selecione o laboratório para monitorar</p>
        </div>
      </div>

      {/* Current Lab */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              Laboratório Atual
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={selectedLab?.ativo ? "default" : "secondary"}
                className={selectedLab?.ativo ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {selectedLab?.ativo ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="bg-white border-blue-500 text-blue-600 font-semibold">
                ATIVO
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-blue-900">{selectedLab?.nome}</h3>
                <p className="text-sm text-blue-600">{selectedLab?.descricao}</p>
                <p className="text-xs text-muted-foreground mt-1">Este laboratório está sendo monitorado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Labs */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Laboratórios Disponíveis - Bloco E
        </h2>
        
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {laboratories.map((lab) => (
            <Card 
              key={lab.id} 
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedLab?.id === lab.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50/80 border-blue-300 shadow-lg' 
                  : 'hover:bg-accent/50 border-border hover:border-accent-foreground/20'
              }`}
              onClick={() => handleLabSelect(lab)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header com ícone e nome */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        selectedLab?.id === lab.id
                          ? 'bg-blue-500 text-white'
                          : lab.ativo 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold flex items-center gap-2 truncate">
                          {lab.nome}
                          {selectedLab?.id === lab.id && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{lab.descricao}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status e ações */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <Badge 
                      variant={lab.ativo ? "default" : "secondary"}
                      className={`text-xs ${lab.ativo ? "bg-green-500" : ""}`}
                    >
                      {lab.ativo ? (
                        <>
                          <Wifi className="w-2 h-2 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-2 h-2 mr-1" />
                          Inativo
                        </>
                      )}
                    </Badge>
                    
                    {selectedLab?.id === lab.id ? (
                      <Badge className="text-xs bg-blue-500 hover:bg-blue-600">
                        <Check className="w-2 h-2 mr-1" />
                        Selecionado
                      </Badge>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7 px-3 hover:bg-blue-50 hover:border-blue-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLabSelect(lab)
                        }}
                      >
                        Selecionar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info */}
      <Card className="bg-accent/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium mb-1">Sobre os Laboratórios</p>
              <p className="text-muted-foreground">
                Os laboratórios do Bloco E são equipados com sensores IoT para monitoramento em tempo real. 
                Apenas laboratórios com status "Ativo" possuem dados disponíveis para visualização.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}