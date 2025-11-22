import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    console.log('🔍 GET /api/historico - Buscando dados históricos...')
    const historyData = dataStore.getHistoryData()
    console.log('📈 History data from store:', { 
      count: historyData.length, 
      first: historyData[0],
      last: historyData[historyData.length - 1]
    })
    
    return NextResponse.json(historyData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar dados do histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}