"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor, Wifi, WifiOff, ChevronRight } from 'lucide-react'
import { useLab } from '@/contexts/lab-context'

export function LabSelector() {
  const { laboratories, setSelectedLab } = useLab()

  const handleLabSelect = (lab: any) => {
    setSelectedLab(lab)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sistema de Monitoramento IoT
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Laboratórios do Bloco E - Faculdade
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selecione um laboratório para monitorar
          </p>
        </div>

        {/* Grid de Laboratórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {laboratories.map((lab) => (
            <Card 
              key={lab.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
                lab.ativo 
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 hover:shadow-green-200 dark:hover:shadow-green-900/50' 
                  : 'border-gray-200 hover:shadow-gray-300 dark:hover:shadow-gray-700'
              }`}
              onClick={() => handleLabSelect(lab)}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={lab.ativo ? "default" : "secondary"} 
                  className={lab.ativo ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {lab.ativo ? (
                    <>
                      <Wifi className="w-3 h-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Inativo
                    </>
                  )}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    lab.ativo ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Monitor className={`w-6 h-6 ${
                      lab.ativo ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lab.nome}</CardTitle>
                    <CardDescription className="text-sm">
                      {lab.descricao}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {lab.ativo ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sensores:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">3 ativos</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Protótipo:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">ESP32</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="text-gray-500 font-medium">Sem dados</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sensores:</span>
                        <span className="text-gray-500 font-medium">Não configurado</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Protótipo:</span>
                        <span className="text-gray-500 font-medium">Indisponível</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    variant={lab.ativo ? "default" : "outline"} 
                    className="w-full mt-4"
                    size="sm"
                  >
                    {lab.ativo ? 'Monitorar' : 'Visualizar'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>

              {/* Indicador visual para laboratório ativo */}
              {lab.ativo && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
              )}
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>💡 Apenas o laboratório E105 possui dados em tempo real</p>
          <p>🔬 Sistema de monitoramento de economia de energia</p>
        </div>
      </div>
    </div>
  )
}