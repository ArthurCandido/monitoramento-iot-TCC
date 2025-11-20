import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the received data from ESP32
    console.log('Received sensor data:', body)
    
    // ESP32 sends data in this format:
    // {
    //   temp: number,        // temperatura em °C
    //   umid: number,        // umidade em %
    //   luz: number,         // luminosidade (valor ADC)
    //   mov: string,         // "Detectado" ou "Nenhum"
    //   alertaAr: string,    // status do ar condicionado
    //   alertaLuz: string    // status da iluminação
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
    
    // Normalize the data for internal use
    const normalizedData = {
      temperature: body.temp,
      humidity: body.umid,
      lightLevel: body.luz,
      motion: body.mov === "Detectado" ? true : false,
      motionStatus: body.mov,
      airConditioningAlert: body.alertaAr || "OK",
      lightAlert: body.alertaLuz || "OK",
      timestamp: new Date().toISOString(),
      rawData: body
    }
    
    // Log normalized data
    console.log('Normalized sensor data:', normalizedData)
    
    // Salva os dados no data store
    dataStore.updateData(body)
    
    // TODO: Save to database here if needed
    // Example: await saveToDatabase(normalizedData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dados do sensor recebidos com sucesso',
      receivedAt: normalizedData.timestamp,
      data: {
        temperatura: body.temp,
        umidade: body.umid,
        luminosidade: body.luz,
        movimento: body.mov,
        alertas: {
          ar: body.alertaAr,
          luz: body.alertaLuz
        }
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
    message: 'Endpoint para recebimento de dados do ESP32',
    method: 'POST',
    expectedFormat: {
      temp: 'number (°C)',
      umid: 'number (%)',
      luz: 'number (valor ADC)', 
      mov: 'string (Detectado/Nenhum)',
      alertaAr: 'string (status ar condicionado)',
      alertaLuz: 'string (status iluminação)'
    }
  })
}