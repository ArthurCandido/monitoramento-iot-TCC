// Sistema de armazenamento com persistência para Vercel serverless
// Usa variáveis de processo compartilhadas e cache de arquivo temporário

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

// Cache em processo - funciona apenas dentro da mesma instância
declare global {
  var __dataStore: {
    currentData: SensorData | null
    historyData: HistoryData[]
    nextId: number
    lastUpdate: number
  } | undefined
}

class DataStore {
  private get storage() {
    if (!global.__dataStore) {
      console.log('🔧 Inicializando global dataStore pela primeira vez')
      global.__dataStore = {
        currentData: null,
        historyData: [],
        nextId: 1,
        lastUpdate: 0
      }
      
      // Tentar carregar dados do cache em memória (se existir)
      this.loadFromMemoryCache()
    }
    return global.__dataStore
  }

  // Simula um cache compartilhado usando variáveis de ambiente de processo
  private saveToMemoryCache() {
    try {
      if (this.storage.currentData) {
        // Salva dados no formato ESP32 para compatibilidade
        const dataToCache = {
          temp: this.storage.currentData.temperatura,
          umid: this.storage.currentData.umidade,
          luz: this.storage.currentData.luminosidade,
          mov: this.storage.currentData.movimento,
          alertaAr: this.storage.currentData.alerta_ar,
          alertaLuz: this.storage.currentData.alerta_luz
        }
        
        process.env.CACHE_CURRENT_DATA = JSON.stringify(dataToCache)
        process.env.CACHE_LAST_UPDATE = String(Date.now())
        console.log('💾 Dados salvos no cache de processo:', dataToCache)
      }
    } catch (error) {
      console.log('⚠️ Erro ao salvar cache:', error)
    }
  }

  private loadFromMemoryCache() {
    try {
      const cachedData = process.env.CACHE_CURRENT_DATA
      const lastUpdate = process.env.CACHE_LAST_UPDATE
      
      console.log('🔍 Verificando cache de processo:', {
        hasCachedData: !!cachedData,
        lastUpdate: lastUpdate,
        env: Object.keys(process.env).filter(k => k.startsWith('CACHE_'))
      })
      
      if (cachedData && lastUpdate) {
        const age = Date.now() - parseInt(lastUpdate)
        // Cache válido por 5 minutos
        if (age < 5 * 60 * 1000) {
          const parsedData = JSON.parse(cachedData)
          
          // Converter para o formato correto do SensorData
          this.storage.currentData = {
            temperatura: parsedData.temp || parsedData.temperatura,
            umidade: parsedData.umid || parsedData.umidade,
            luminosidade: parsedData.luz || parsedData.luminosidade,
            movimento: parsedData.mov || parsedData.movimento,
            alerta_ar: parsedData.alertaAr || parsedData.alerta_ar || 'OK',
            alerta_luz: parsedData.alertaLuz || parsedData.alerta_luz || 'OK',
            data_hora: new Date(parseInt(lastUpdate)).toISOString(),
            id: this.storage.nextId++
          }
          
          this.storage.lastUpdate = parseInt(lastUpdate)
          console.log('📂 Dados carregados do cache de processo:', this.storage.currentData)
          return
        } else {
          console.log('⏰ Cache de processo expirado (age: ' + Math.round(age/1000) + 's)')
        }
      } else {
        console.log('❌ Nenhum cache de processo encontrado')
      }
    } catch (error) {
      console.log('⚠️ Erro ao carregar cache:', error)
    }
    
    // NÃO carregar dados de exemplo - aguardar dados reais do ESP32
    console.log('⏳ Aguardando dados reais do ESP32...')
  }

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
    this.storage.currentData = {
      temperatura: esp32Data.temp,
      umidade: esp32Data.umid,
      luminosidade: esp32Data.luz,
      movimento: esp32Data.mov,
      alerta_ar: esp32Data.alertaAr || 'OK',
      alerta_luz: esp32Data.alertaLuz || 'OK',
      data_hora: now,
      id: this.storage.nextId++
    }
    this.storage.lastUpdate = Date.now()
    
    console.log('✅ DataStore.currentData updated to:', this.storage.currentData)

    // Salva no cache de memória
    this.saveToMemoryCache()

    // Adiciona ao histórico
    const historyEntry: HistoryData = {
      temperatura: esp32Data.temp,
      luminosidade: esp32Data.luz,
      data_hora: now
    }

    this.storage.historyData.unshift(historyEntry)

    // Mantém apenas os últimos 100 registros de histórico
    if (this.storage.historyData.length > 100) {
      this.storage.historyData = this.storage.historyData.slice(0, 100)
    }
  }

  getCurrentData(): SensorData | null {
    console.log('🔎 DataStore.getCurrentData called, returning:', this.storage.currentData)
    return this.storage.currentData
  }

  // Força recarregamento do cache de memória
  forceReloadCache(): boolean {
    console.log('🔄 Forçando reload do cache...')
    
    const cachedData = process.env.CACHE_CURRENT_DATA
    const lastUpdate = process.env.CACHE_LAST_UPDATE
    
    if (cachedData && lastUpdate) {
      try {
        const parsedData = JSON.parse(cachedData)
        
        this.storage.currentData = {
          temperatura: parsedData.temp,
          umidade: parsedData.umid,
          luminosidade: parsedData.luz,
          movimento: parsedData.mov,
          alerta_ar: parsedData.alertaAr || 'OK',
          alerta_luz: parsedData.alertaLuz || 'OK',
          data_hora: new Date(parseInt(lastUpdate)).toISOString(),
          id: this.storage.nextId++
        }
        
        console.log('✅ Cache recarregado')
        return true
      } catch (error) {
        console.log('❌ Erro ao recarregar:', error)
      }
    }
    
    return false
  }

  getHistoryData(): HistoryData[] {
    return this.storage.historyData
  }
}

// Instância global do store
export const dataStore = new DataStore()