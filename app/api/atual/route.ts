import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    const currentData = dataStore.getCurrentData()
    
    if (!currentData) {
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