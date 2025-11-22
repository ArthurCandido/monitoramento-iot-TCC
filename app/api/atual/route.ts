import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    console.log('🔍 GET /api/atual - Buscando dados atuais...')
    const currentData = dataStore.getCurrentData()
    console.log('📊 Current data from store:', currentData)
    
    if (!currentData) {
      console.log('❌ Nenhum dado encontrado no store')
      return NextResponse.json(
        { error: 'Nenhum dado disponível ainda' }, 
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      )
    }
    
    console.log('✅ Retornando dados atuais para frontend')
    return NextResponse.json(currentData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar dados atuais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}