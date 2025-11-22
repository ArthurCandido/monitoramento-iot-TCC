import { NextResponse } from 'next/server'
import { dbStore } from '@/lib/db-store'

export async function POST() {
  try {
    console.log('🔧 Inicializando banco de dados PostgreSQL...')
    
    await dbStore.initializeDatabase()
    const stats = await dbStore.getStats()
    
    return NextResponse.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso',
      stats: stats
    })
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao inicializar banco de dados',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = await dbStore.getStats()
    
    return NextResponse.json({
      message: 'Estatísticas do banco de dados',
      stats: stats
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao buscar estatísticas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}