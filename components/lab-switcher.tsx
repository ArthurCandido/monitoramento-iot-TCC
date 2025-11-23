"use client"

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
          <Button variant="outline" className="w-full text-left h-auto p-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium">{selectedLab.nome}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedLab.descricao}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Badge 
                  variant={selectedLab.ativo ? "default" : "secondary"} 
                  className={`text-xs ${selectedLab.ativo ? "bg-green-500" : ""}`}
                >
                  {selectedLab.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Laboratórios - Bloco E
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {laboratories.map((lab) => (
            <DropdownMenuItem
              key={lab.id}
              className="cursor-pointer"
              onClick={() => setSelectedLab(lab)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{lab.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {lab.descricao}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={lab.ativo ? "default" : "secondary"}
                  className={`text-xs ${lab.ativo ? "bg-green-500" : ""}`}
                >
                  {lab.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}