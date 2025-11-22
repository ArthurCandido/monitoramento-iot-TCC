import { NextResponse, NextRequest } from 'next/server'
import { dbStore } from '@/lib/db-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const daysToKeep = body.days || 7
    
    console.log(`🧹 Iniciando limpeza - manter ${daysToKeep} dias`)
    
    const statsBefore = await dbStore.getStats()
    const deletedCount = await dbStore.cleanupOldData(daysToKeep)
    const statsAfter = await dbStore.getStats()
    
    return NextResponse.json({
      success: true,
      message: `Limpeza concluída - ${deletedCount} registros removidos`,
      before: {
        total: statsBefore.total_records,
        oldest: statsBefore.first_record
      },
      after: {
        total: statsAfter.total_records,
        oldest: statsAfter.first_record
      },
      deleted: deletedCount,
      daysKept: daysToKeep
    })
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro durante limpeza',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = await dbStore.getStats()
    const totalRecords = parseInt(stats.total_records)
    
    // Calcular uso aproximado
    const recordSizeKB = 0.1 // ~100 bytes por registro
    const usedStorageMB = (totalRecords * recordSizeKB) / 1024
    const limitMB = 512 // Limite gratuito Neon
    const usagePercent = (usedStorageMB / limitMB) * 100
    
    return NextResponse.json({
      stats: stats,
      storage: {
        records: totalRecords,
        usedMB: Math.round(usedStorageMB * 100) / 100,
        limitMB: limitMB,
        usagePercent: Math.round(usagePercent * 100) / 100,
        needsCleanup: totalRecords > 100000
      },
      recommendations: {
        autoCleanupAt: "100.000 registros",
        keepDays: 7,
        cleanupFrequency: "Automático a cada 50k+ registros"
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao verificar storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}