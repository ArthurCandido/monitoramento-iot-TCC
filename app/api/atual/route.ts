import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    const currentData = dataStore.getCurrentData()
    
    if (!currentData) {
      return NextResponse.json(
        { error: 'Nenhum dado disponível ainda' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(currentData)
    
  } catch (error) {
    console.error('Erro ao buscar dados atuais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}