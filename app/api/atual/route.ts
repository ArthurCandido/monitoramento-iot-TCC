import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET(request: Request) {
  try {
    console.log('🔍 GET /api/atual - Buscando dados atuais...')
    
    // Tentar obter dados do store atual
    let currentData = dataStore.getCurrentData()
    console.log('📊 Current data from store:', currentData)
    
    // Se não tem dados ou são muito antigos, buscar dados do cache do processo
    if (!currentData || !currentData.data_hora) {
      console.log('⚠️ Dados não encontrados ou inválidos, tentando cache...')
      
      // Forçar recarregamento do cache
      dataStore.forceReloadCache()
      currentData = dataStore.getCurrentData()
      console.log('🔄 Dados após reload do cache:', currentData)
    }
    
    if (!currentData) {
      console.log('❌ Nenhum dado encontrado em nenhum cache')
      return NextResponse.json(
        { error: 'Nenhum dado disponível ainda - ESP32 não enviou dados' }, 
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
    
    // Verificar se os dados são muito antigos (mais de 2 minutos)
    const dataAge = Date.now() - new Date(currentData.data_hora).getTime()
    const isStale = dataAge > 2 * 60 * 1000 // 2 minutos
    
    console.log('✅ Retornando dados atuais:', {
      data: currentData,
      ageMinutes: Math.round(dataAge / 60000),
      isStale
    })
    
    return NextResponse.json({
      ...currentData,
      _meta: {
        age: dataAge,
        isStale,
        timestamp: new Date().toISOString()
      }
    }, {
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