import { NextResponse, NextRequest } from 'next/server'
import { dbStore } from '@/lib/db-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '500')
    const hours = parseInt(searchParams.get('hours') || '48')
    
    console.log(`📊 Buscando histórico PostgreSQL: ${limit} registros, últimas ${hours}h`)
    
    const historyData = await dbStore.getHistoryData(limit)
    const recentData = historyData.filter(record => {
      const recordTime = new Date(record.timestamp).getTime()
      const hoursAgo = Date.now() - (hours * 60 * 60 * 1000)
      return recordTime > hoursAgo
    })
    
    return NextResponse.json({
      success: true,
      data: recentData,
      metadata: {
        totalReturned: recentData.length,
        totalRequested: limit,
        hoursFilter: hours,
        oldestRecord: recentData[recentData.length - 1]?.timestamp,
        newestRecord: recentData[0]?.timestamp
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar histórico',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}