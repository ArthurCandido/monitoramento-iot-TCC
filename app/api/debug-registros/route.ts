import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    console.log('🔍 Verificando últimos registros...')
    
    const result = await sql`
      SELECT 
        id,
        temperatura,
        timestamp,
        esp32_timestamp
      FROM sensor_data 
      ORDER BY timestamp DESC, id DESC 
      LIMIT 5;
    `
    
    return NextResponse.json({
      success: true,
      message: 'Últimos 5 registros por timestamp',
      data: result.rows,
      totalCount: result.rowCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar registros:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar registros',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}