'use client'

import { SettingsIcon, Bell, Database, Clock } from 'lucide-react'

export default function SettingsView() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">Personalize o comportamento do sistema</p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={20} className="text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded accent-accent"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Alertas de Temperatura
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notificar quando a temperatura exceder os limites
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded accent-accent"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Alertas de Luminosidade
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notificar sobre alterações de luminosidade
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Data Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Dados</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie como os dados são armazenados e mantidos
            </p>
            <button className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm font-medium">
              Limpar Histórico Antigo
            </button>
          </div>

          {/* Update Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Atualização</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Intervalo de Atualização
                </label>
                <select className="mt-2 w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm">
                  <option>A cada 1 segundo</option>
                  <option selected>A cada 3 segundos</option>
                  <option>A cada 5 segundos</option>
                  <option>A cada 10 segundos</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
