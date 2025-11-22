import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    const currentData = dataStore.getCurrentData()
    const historyData = dataStore.getHistoryData()
    
    const status = {
      timestamp: new Date().toISOString(),
      hasCurrentData: !!currentData,
      currentData: currentData,
      historyCount: historyData.length,
      historyPreview: historyData.slice(0, 3),
      serverInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        env: process.env.NODE_ENV || 'unknown'
      }
    }
    
    console.log('📊 Status endpoint called:', status)
    
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no endpoint status:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}