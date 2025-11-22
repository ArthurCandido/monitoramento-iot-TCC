import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the received data from ESP32
    console.log('Received sensor data:', body)
    
    // ESP32 sends data in this format (simplified version):
    // {
    //   temp: number,        // temperatura em °C
    //   umid: number,        // umidade em %
    //   luz: number,         // luminosidade (valor ADC)
    //   mov: string,         // "Detectado" ou "Nenhum"
    //   timestamp: number    // timestamp em millis
    // }
    
    // Validate the data structure (ESP32 format)
    if (typeof body.temp === 'undefined' || 
        typeof body.umid === 'undefined' || 
        typeof body.luz === 'undefined' ||
        typeof body.mov === 'undefined') {
      return NextResponse.json(
        { 
          error: 'Missing required sensor data fields',
          expected: 'temp, umid, luz, mov',
          received: Object.keys(body)
        }, 
        { status: 400 }
      )
    }
    
    // Convert luminosity to lux approximation 
    // ESP32 ADC: 0-4095 -> approximated lux conversion
    const lux = Math.round((body.luz / 4095) * 10000)
    
    // Prepare data for data store (legacy format compatibility)
    const dataForStore = {
      temp: body.temp,
      umid: body.umid,
      luz: lux,  // converted to lux approximation
      mov: body.mov,
      alertaAr: "OK",  // Always OK since logic moved to frontend
      alertaLuz: "OK"  // Always OK since logic moved to frontend
    }
    
    // Log processed data
    console.log('Processed sensor data for store:', dataForStore)
    
    // Salva os dados no data store
    dataStore.updateData(dataForStore)
    
    // Criar URL de sincronização para outras instâncias
    const syncData = Buffer.from(JSON.stringify(dataForStore)).toString('base64')
    const syncTimestamp = Date.now()
    const syncUrl = `${new URL(request.url).origin}/api/sync?data=${encodeURIComponent(syncData)}&ts=${syncTimestamp}`
    
    console.log('🔗 URL de sincronização criada:', syncUrl)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dados do sensor recebidos com sucesso',
      receivedAt: new Date().toISOString(),
      data: {
        temperatura: body.temp,
        umidade: body.umid,
        luminosidade: lux,
        movimento: body.mov,
        timestamp: body.timestamp
      },
      syncUrl: syncUrl // URL para outras instâncias buscarem dados atuais
    })
    
  } catch (error) {
    console.error('Error processing sensor data:', error)
    
    // More detailed error logging
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint para recebimento de dados do ESP32 (versão simplificada)',
    method: 'POST',
    expectedFormat: {
      temp: 'number (°C)',
      umid: 'number (%)',
      luz: 'number (valor ADC 0-4095)', 
      mov: 'string (Detectado/Nenhum)',
      timestamp: 'number (millis - opcional)'
    },
    note: 'Alertas são processados no frontend baseado nas configurações do usuário'
  })
}