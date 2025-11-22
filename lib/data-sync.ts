// Utilitário para sincronização de dados entre instâncias serverless
// Usa parâmetros de URL como mecanismo de sincronização simples

export interface SyncData {
  currentData: any
  timestamp: number
}

export class DataSync {
  private static SYNC_TIMEOUT = 30000 // 30 segundos
  
  // Codifica dados para uso em URL (base64 + compressão simples)
  static encode(data: any): string {
    try {
      const jsonString = JSON.stringify(data)
      return Buffer.from(jsonString).toString('base64')
    } catch {
      return ''
    }
  }
  
  // Decodifica dados da URL
  static decode(encoded: string): any {
    try {
      const jsonString = Buffer.from(encoded, 'base64').toString('utf8')
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }
  
  // Verifica se os dados sincronizados ainda são válidos
  static isValidSync(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.SYNC_TIMEOUT
  }
}