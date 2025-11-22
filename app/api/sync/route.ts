import { NextRequest, NextResponse } from 'next/server'

// Endpoint para sincronização direta entre instâncias
// Retorna os dados que foram enviados via query parameters

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Dados sincronizados via query params
    const syncData = searchParams.get('data')
    const timestamp = searchParams.get('ts')
    
    if (!syncData || !timestamp) {
      return NextResponse.json(
        { error: 'Nenhum dado sincronizado disponível' },
        { status: 404 }
      )
    }
    
    // Verificar se os dados não são muito antigos (5 minutos)
    const age = Date.now() - parseInt(timestamp)
    if (age > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Dados sincronizados muito antigos' },
        { status: 410 }
      )
    }
    
    // Decodificar dados
    const data = JSON.parse(Buffer.from(syncData, 'base64').toString())
    
    console.log('🔄 Retornando dados sincronizados:', data)
    
    return NextResponse.json({
      ...data,
      _sync: {
        age,
        timestamp: new Date(parseInt(timestamp)).toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    return NextResponse.json(
      { error: 'Erro na sincronização de dados' },
      { status: 500 }
    )
  }
}