// Sistema simples de armazenamento em memória para os dados do sensor

export interface SensorData {
  temperatura: number
  umidade: number
  luminosidade: number
  movimento: string
  alerta_ar: string
  alerta_luz: string
  data_hora: string
  id: number
}

export interface HistoryData {
  temperatura: number
  luminosidade: number
  data_hora: string
}

class DataStore {
  private currentData: SensorData | null = null
  private historyData: HistoryData[] = []
  private nextId = 1

  // Armazena dados atuais e adiciona ao histórico
  updateData(esp32Data: {
    temp: number
    umid: number
    luz: number
    mov: string
    alertaAr?: string
    alertaLuz?: string
  }) {
    const now = new Date().toISOString()
    console.log('💾 DataStore.updateData called with:', esp32Data)
    
    // Dados atuais no formato esperado pelo frontend
    this.currentData = {
      temperatura: esp32Data.temp,
      umidade: esp32Data.umid,
      luminosidade: esp32Data.luz,
      movimento: esp32Data.mov,
      alerta_ar: esp32Data.alertaAr || 'OK',
      alerta_luz: esp32Data.alertaLuz || 'OK',
      data_hora: now,
      id: this.nextId++
    }
    console.log('✅ DataStore.currentData updated to:', this.currentData)

    // Adiciona ao histórico
    const historyEntry: HistoryData = {
      temperatura: esp32Data.temp,
      luminosidade: esp32Data.luz,
      data_hora: now
    }

    this.historyData.unshift(historyEntry)

    // Mantém apenas os últimos 100 registros de histórico
    if (this.historyData.length > 100) {
      this.historyData = this.historyData.slice(0, 100)
    }
  }

  getCurrentData(): SensorData | null {
    console.log('🔎 DataStore.getCurrentData called, returning:', this.currentData)
    return this.currentData
  }

  getHistoryData(): HistoryData[] {
    console.log('🔎 DataStore.getHistoryData called, returning:', {
      count: this.historyData.length,
      data: this.historyData.slice(0, 3) // primeiros 3 para debug
    })
    return this.historyData
  }

  // Gera dados iniciais fictícios para teste
  initializeWithSampleData() {
    if (!this.currentData) {
      this.updateData({
        temp: 24.5,
        umid: 65.2,
        luz: 1200,
        mov: 'Nenhum',
        alertaAr: 'OK',
        alertaLuz: 'OK'
      })

      // Adiciona alguns dados históricos fictícios
      const now = Date.now()
      for (let i = 1; i <= 10; i++) {
        const pastTime = new Date(now - (i * 5 * 60 * 1000)) // 5 minutos atrás para cada entrada
        this.historyData.push({
          temperatura: 24 + Math.random() * 4, // 24-28°C
          luminosidade: 1000 + Math.random() * 1000, // 1000-2000
          data_hora: pastTime.toISOString()
        })
      }
    }
  }
}

// Instância global do store
export const dataStore = new DataStore()

// Inicializa com dados de exemplo
dataStore.initializeWithSampleData()