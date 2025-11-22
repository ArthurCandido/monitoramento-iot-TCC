import { sql } from '@vercel/postgres'
import { createPool } from '@vercel/postgres'

export interface SensorData {
  id: number
  temperatura: number
  umidade: number
  luminosidade: number
  movimento: string
  alerta_ar: string
  alerta_luz: string
  timestamp: string
  esp32_timestamp?: number
}

export interface HistoryData {
  temperatura: number
  luminosidade: number
  timestamp: string
}

class PostgresDataStore {
  
  // Salva dados do ESP32 no PostgreSQL
  async updateData(esp32Data: {
    temp: number
    umid: number
    luz: number
    mov: string
    alertaAr?: string
    alertaLuz?: string
    timestamp?: number
  }) {
    try {
      console.log('💾 Salvando no PostgreSQL:', esp32Data)
      
      const result = await sql`
        INSERT INTO sensor_data (
          temperatura, 
          umidade, 
          luminosidade, 
          movimento, 
          alerta_ar, 
          alerta_luz,
          esp32_timestamp
        ) VALUES (
          ${esp32Data.temp},
          ${esp32Data.umid}, 
          ${esp32Data.luz},
          ${esp32Data.mov},
          ${esp32Data.alertaAr || 'OK'},
          ${esp32Data.alertaLuz || 'OK'},
          ${esp32Data.timestamp || null}
        )
        RETURNING id, timestamp;
      `
      
      console.log('✅ Dados salvos com ID:', result.rows[0])
      return result.rows[0]
      
    } catch (error) {
      console.error('❌ Erro ao salvar no PostgreSQL:', error)
      throw error
    }
  }

  // Busca os dados mais recentes
  async getCurrentData(): Promise<SensorData | null> {
    try {
      console.log('🔍 Buscando dados atuais no PostgreSQL...')
      
      const result = await sql`
        SELECT 
          id,
          temperatura,
          umidade, 
          luminosidade,
          movimento,
          alerta_ar,
          alerta_luz,
          timestamp,
          esp32_timestamp
        FROM sensor_data 
        ORDER BY id DESC 
        LIMIT 1;
      `
      
      if (result.rows.length === 0) {
        console.log('❌ Nenhum dado encontrado')
        return null
      }
      
      const row = result.rows[0]
      const sensorData: SensorData = {
        id: row.id,
        temperatura: parseFloat(row.temperatura),
        umidade: parseFloat(row.umidade),
        luminosidade: row.luminosidade,
        movimento: row.movimento,
        alerta_ar: row.alerta_ar,
        alerta_luz: row.alerta_luz,
        timestamp: row.timestamp,
        esp32_timestamp: row.esp32_timestamp
      }
      
      console.log('✅ Dados encontrados:', sensorData)
      return sensorData
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error)
      throw error
    }
  }

  // Busca histórico para gráficos
  async getHistoryData(limit: number = 100): Promise<HistoryData[]> {
    try {
      console.log(`📊 Buscando histórico (${limit} registros)...`)
      
      const result = await sql`
        SELECT 
          temperatura,
          luminosidade,
          timestamp
        FROM sensor_data 
        ORDER BY timestamp DESC 
        LIMIT ${limit};
      `
      
      const historyData = result.rows.map(row => ({
        temperatura: parseFloat(row.temperatura),
        luminosidade: row.luminosidade,
        timestamp: row.timestamp
      }))
      
      console.log(`✅ Histórico carregado: ${historyData.length} registros`)
      return historyData
      
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error)
      throw error
    }
  }

  // Inicializar tabelas (executar uma vez)
  async initializeDatabase() {
    try {
      console.log('🔧 Inicializando banco de dados...')
      
      await sql`
        CREATE TABLE IF NOT EXISTS sensor_data (
          id SERIAL PRIMARY KEY,
          temperatura DECIMAL(5,2) NOT NULL,
          umidade DECIMAL(5,2) NOT NULL, 
          luminosidade INTEGER NOT NULL,
          movimento VARCHAR(20) NOT NULL,
          alerta_ar VARCHAR(20) DEFAULT 'OK',
          alerta_luz VARCHAR(20) DEFAULT 'OK',
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          esp32_timestamp BIGINT
        );
      `
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_data(timestamp DESC);
      `
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_sensor_latest ON sensor_data(id DESC);
      `
      
      console.log('✅ Banco de dados inicializado')
      
    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error)
      throw error
    }
  }

  // Estatísticas rápidas
  async getStats() {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total_records,
          AVG(temperatura) as avg_temp,
          MAX(timestamp) as last_update,
          MIN(timestamp) as first_record
        FROM sensor_data;
      `
      
      return result.rows[0]
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // Limpeza automática - manter apenas últimos N dias
  async cleanupOldData(daysToKeep: number = 7) {
    try {
      console.log(`🧹 Limpando dados anteriores a ${daysToKeep} dias...`)
      
      const result = await sql`
        DELETE FROM sensor_data 
        WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'
        RETURNING COUNT(*);
      `
      
      const deletedCount = result.rowCount || 0
      console.log(`✅ ${deletedCount} registros antigos removidos`)
      
      return deletedCount
    } catch (error) {
      console.error('❌ Erro na limpeza:', error)
      throw error
    }
  }

  // Verificar se precisa de limpeza automática
  async autoCleanup() {
    try {
      const stats = await this.getStats()
      const totalRecords = parseInt(stats.total_records)
      
      // Se tiver mais de 100k registros, fazer limpeza
      if (totalRecords > 100000) {
        console.log(`⚠️ Muitos registros (${totalRecords}), fazendo limpeza...`)
        await this.cleanupOldData(7) // Manter apenas 7 dias
      }
      
      return totalRecords
    } catch (error) {
      console.error('❌ Erro no auto-cleanup:', error)
      return 0
    }
  }
}

export const dbStore = new PostgresDataStore()