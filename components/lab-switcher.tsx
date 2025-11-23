"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Monitor, ChevronDown, Wifi, WifiOff, Building } from 'lucide-react'
import { useLab } from '@/contexts/lab-context'

export function LabSwitcher() {
  const { laboratories, selectedLab, setSelectedLab } = useLab()

  if (!selectedLab) return null

  return (
    <div className="p-4 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{selectedLab.nome}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {selectedLab.descricao}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant={selectedLab.ativo ? "default" : "secondary"} 
                className={`text-xs ${selectedLab.ativo ? "bg-green-500 hover:bg-green-600" : ""}`}
              >
                {selectedLab.ativo ? (
                  <>
                    <Wifi className="w-2 h-2 mr-1" />
                    On
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2 h-2 mr-1" />
                    Off
                  </>
                )}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Laboratórios - Bloco E
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {laboratories.map((lab) => (
            <DropdownMenuItem
              key={lab.id}
              className={`flex items-center justify-between cursor-pointer ${
                selectedLab.id === lab.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedLab(lab)}
            >
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{lab.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {lab.descricao}
                  </span>
                </div>
              </div>
              
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
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}