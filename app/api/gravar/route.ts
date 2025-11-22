import { NextRequest, NextResponse } from 'next/server'
import { dbStore } from '@/lib/db-store'

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
    
    // Use dados diretos do ESP32 sem conversões
    const dataForStore = {
      temp: body.temp,
      umid: body.umid,
      luz: body.luz,  // usar valor direto do ESP32
      mov: body.mov,
      alertaAr: "OK",
      alertaLuz: "OK",
      timestamp: body.timestamp
    }
    
    console.log('Dados para PostgreSQL:', dataForStore)
    
    // Salva os dados no PostgreSQL
    const savedData = await dbStore.updateData(dataForStore)
    
    // Auto-limpeza periódica (a cada 100 registros aprox)
    if (savedData.id && savedData.id % 100 === 0) {
      console.log('🧹 Verificando se precisa de limpeza automática...')
      try {
        await dbStore.autoCleanup()
      } catch (cleanupError) {
        console.log('⚠️ Erro na limpeza automática:', cleanupError)
        // Não falhar o salvamento por causa da limpeza
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dados salvos no PostgreSQL com sucesso',
      receivedAt: new Date().toISOString(),
      savedId: savedData.id,
      data: {
        temperatura: body.temp,
        umidade: body.umid,
        luminosidade: body.luz,  // valor original ESP32
        movimento: body.mov,
        timestamp: body.timestamp
      }
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