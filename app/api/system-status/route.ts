import { NextResponse } from 'next/server'
import postgres from 'postgres'

// Conexão com PostgreSQL
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30
})

interface SystemStatus {
  database: {
    status: 'connected' | 'error'
    lastCheck: string
    totalRecords: number
    lastRecord: string | null
  }
  esp32: {
    status: 'connected' | 'disconnected' | 'stale'
    lastDataReceived: string | null
    secondsSinceLastData: number | null
  }
  api: {
    status: 'operational'
    uptime: string
    timestamp: string
  }
}

export async function GET() {
  try {
    const checkStartTime = Date.now()
    let systemStatus: SystemStatus = {
      database: {
        status: 'error',
        lastCheck: new Date().toISOString(),
        totalRecords: 0,
        lastRecord: null
      },
      esp32: {
        status: 'disconnected',
        lastDataReceived: null,
        secondsSinceLastData: null
      },
      api: {
        status: 'operational',
        uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A',
        timestamp: new Date().toISOString()
      }
    }

    try {
      // Verificar status do banco de dados
      const dbResult = await sql`
        SELECT 
          COUNT(*) as total,
          MAX(timestamp) as last_record
        FROM sensor_data
      `
      
      if (dbResult.length > 0) {
        const { total, last_record } = dbResult[0]
        systemStatus.database = {
          status: 'connected',
          lastCheck: new Date().toISOString(),
          totalRecords: parseInt(total as string),
          lastRecord: last_record
        }

        // Verificar status do ESP32 baseado na última entrada e intervalo esperado
        if (last_record) {
          const lastDataTime = new Date(last_record).getTime()
          const now = Date.now()
          const secondsAgo = Math.floor((now - lastDataTime) / 1000)
          
          // ESP32 transmite a cada 5 segundos
          const ESP32_INTERVAL = 5 // segundos
          const TOLERANCE = 2 // tolerância adicional
          
          // Calcular status baseado no intervalo esperado
          let status: 'connected' | 'stale' | 'disconnected'
          
          if (secondsAgo <= ESP32_INTERVAL + TOLERANCE) {
            // Dentro do intervalo esperado (≤ 7s) = conectado
            status = 'connected'
          } else if (secondsAgo <= (ESP32_INTERVAL * 3) + TOLERANCE) {
            // Perdeu 1-2 transmissões (7s-17s) = dados antigos
            status = 'stale'
          } else {
            // Perdeu 3+ transmissões (>17s) = desconectado  
            status = 'disconnected'
          }
          
          systemStatus.esp32 = {
            lastDataReceived: last_record,
            secondsSinceLastData: secondsAgo,
            status: status
          }
        }
      }
    } catch (dbError) {
      console.error('❌ Erro ao verificar banco de dados:', dbError)
      systemStatus.database.status = 'error'
    }

    const responseTime = Date.now() - checkStartTime
    
    return NextResponse.json({
      success: true,
      data: systemStatus,
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ Erro no endpoint system-status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}