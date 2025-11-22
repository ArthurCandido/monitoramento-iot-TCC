import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔍 GET /api/atual - TESTE SIMPLES')
  
  try {
    // Buscar dados do cache de processo diretamente
    const cachedData = process.env.CACHE_CURRENT_DATA
    const lastUpdate = process.env.CACHE_LAST_UPDATE
    
    console.log('Cache status:', { 
      hasData: !!cachedData, 
      lastUpdate: lastUpdate 
    })
    
    if (cachedData && lastUpdate) {
      const data = JSON.parse(cachedData)
      console.log('Cache data:', data)
      
      return NextResponse.json({
        temperatura: data.temp,
        umidade: data.umid,
        luminosidade: data.luz,
        movimento: data.mov,
        alerta_ar: 'OK',
        alerta_luz: 'OK',
        data_hora: new Date(parseInt(lastUpdate)).toISOString(),
        id: Date.now()
      })
    }
    
    console.log('No cache data found')
    return NextResponse.json({ error: 'No data' }, { status: 404 })
    
  } catch (error) {
    console.log('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}