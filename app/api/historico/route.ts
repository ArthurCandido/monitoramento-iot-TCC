import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    const historyData = dataStore.getHistoryData()
    
    return NextResponse.json(historyData)
    
  } catch (error) {
    console.error('Erro ao buscar dados do histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}