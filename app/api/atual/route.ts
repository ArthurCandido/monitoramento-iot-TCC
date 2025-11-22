import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET(request: Request) {
  try {
    console.log('🔍 GET /api/atual - Buscando dados atuais...')
    
    // 1. Tentar obter dados do store local primeiro
    let currentData = dataStore.getCurrentData()
    console.log('📊 Dados do store local:', currentData)
    
    // 2. Se dados não existem ou são antigos, buscar no cache de processo
    let dataAge = 999999
    if (currentData?.data_hora) {
      dataAge = Date.now() - new Date(currentData.data_hora).getTime()
    }
    
    const isStale = dataAge > 30 * 1000 // Considera antigo após 30 segundos
    
    if (!currentData || isStale) {
      console.log('⚠️ Dados locais antigos/inexistentes, verificando cache de processo...')
      
      // Buscar diretamente do cache de processo (variáveis de ambiente)
      const cachedData = process.env.CACHE_CURRENT_DATA
      const lastUpdate = process.env.CACHE_LAST_UPDATE
      
      if (cachedData && lastUpdate) {
        const cacheAge = Date.now() - parseInt(lastUpdate)
        console.log(`📂 Cache encontrado, idade: ${Math.round(cacheAge/1000)}s`)
        
        if (cacheAge < 2 * 60 * 1000) { // Cache válido por 2 minutos
          try {
            const processData = JSON.parse(cachedData)
            
            // Converter formato ESP32 para formato frontend
            const convertedData = {
              temperatura: processData.temp || processData.temperatura || 0,
              umidade: processData.umid || processData.umidade || 0,
              luminosidade: processData.luz || processData.luminosidade || 0,
              movimento: processData.mov || processData.movimento || 'Nenhum',
              alerta_ar: processData.alertaAr || processData.alerta_ar || 'OK',
              alerta_luz: processData.alertaLuz || processData.alerta_luz || 'OK',
              data_hora: new Date(parseInt(lastUpdate)).toISOString(),
              id: Math.floor(Date.now() / 1000) // ID baseado em timestamp
            }
            
            console.log('✅ Usando dados do cache de processo:', convertedData)
            
            return NextResponse.json({
              ...convertedData,
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
            
          } catch (parseError) {
            console.log('❌ Erro ao parsear cache de processo:', parseError)
          }
        } else {
          console.log('⏰ Cache de processo expirado')
        }
      } else {
        console.log('❌ Cache de processo não encontrado')
      }
      
      // 3. Último recurso: forçar reload do dataStore
      dataStore.forceReloadCache()
      currentData = dataStore.getCurrentData()
      console.log('🔄 Dados após force reload:', currentData)
    }
    
    // Se ainda não tem dados, retornar erro
    if (!currentData) {
      console.log('❌ Nenhum dado encontrado em lugar algum')
      return NextResponse.json(
        { error: 'Nenhum dado disponível - ESP32 não enviou dados recentes' },
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
    
    // Retornar dados encontrados
    console.log('✅ Retornando dados:', currentData)
    
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