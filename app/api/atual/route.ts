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
    
    // Se ainda não tem dados ou são muito antigos, tentar buscar dados mais recentes via sync
    let dataAge = 999999
    if (currentData?.data_hora) {
      dataAge = Date.now() - new Date(currentData.data_hora).getTime()
    }
    
    // Dados são considerados antigos se > 1 minuto
    const isStale = dataAge > 60 * 1000
    
    if (!currentData || isStale) {
      console.log('🔗 Dados antigos ou inexistentes, buscando dados via proxy interno...')
      
      try {
        // Buscar dados mais recentes do cache de variáveis de processo
        const cachedData = process.env.CACHE_CURRENT_DATA
        const lastUpdate = process.env.CACHE_LAST_UPDATE
        
        if (cachedData && lastUpdate) {
          const cacheAge = Date.now() - parseInt(lastUpdate)
          if (cacheAge < 2 * 60 * 1000) { // Cache válido por 2 minutos
            const parsedData = JSON.parse(cachedData)
            console.log('💾 Usando dados do cache de processo:', parsedData)
            
            return NextResponse.json({
              ...parsedData,
              _meta: {
                source: 'process_cache',
                age: cacheAge,
                isStale: false,
                timestamp: new Date().toISOString()
              }
            }, {
              headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache', 
                'Expires': '0'
              }
            })
          }
        }
        
        console.log('❌ Cache de processo também não disponível')
      } catch (error) {
        console.log('⚠️ Erro ao buscar cache de processo:', error)
      }
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
    
    console.log('✅ Retornando dados atuais:', {
      data: currentData,
      ageMinutes: Math.round(dataAge / 60000),
      isStale
    })
    
    return NextResponse.json({
      ...currentData,
      _meta: {
        source: 'datastore',
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