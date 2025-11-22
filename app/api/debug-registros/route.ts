import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Força novo pool de conexão para evitar cache de query
    const timestamp = Date.now()
    console.log(`🔍 [${timestamp}] Verificando últimos registros sem cache...`)
    
    const result = await sql`
      SELECT 
        id,
        temperatura,
        timestamp,
        esp32_timestamp,
        EXTRACT(EPOCH FROM NOW() - timestamp) as age_seconds
      FROM sensor_data 
      ORDER BY timestamp DESC, id DESC 
      LIMIT 10;
    `
    
    console.log(`✅ [${timestamp}] Found ${result.rowCount} records, latest ID: ${result.rows[0]?.id}`)
    
    return NextResponse.json({
      success: true,
      message: `Últimos 10 registros por timestamp [${new Date().toISOString()}]`,
      query_time: new Date().toISOString(),
      latest_id: result.rows[0]?.id,
      data: result.rows
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Timestamp': timestamp.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar registros:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar registros',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}