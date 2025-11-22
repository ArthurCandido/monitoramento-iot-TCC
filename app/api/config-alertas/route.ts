import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    
    // Validar configurações
    if (!config.temperaturaLimite || !config.luminosidadeLimite || !config.tempoSemMovimento) {
      return NextResponse.json(
        { error: 'Configurações incompletas' }, 
        { status: 400 }
      )
    }
    
    // Salvar no processo para ser usado pelos alertas
    process.env.ALERT_TEMP_LIMITE = String(config.temperaturaLimite)
    process.env.ALERT_LUZ_LIMITE = String(config.luminosidadeLimite) 
    process.env.ALERT_TEMPO_SEM_MOVIMENTO = String(config.tempoSemMovimento)
    process.env.ALERT_CONFIG_UPDATED = String(Date.now())
    
    console.log('✅ Configurações de alerta atualizadas:', {
      temperaturaLimite: config.temperaturaLimite,
      luminosidadeLimite: config.luminosidadeLimite,
      tempoSemMovimento: config.tempoSemMovimento
    })
    
    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      config: config,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar configurações',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Buscar configurações atuais do processo
    const config = {
      temperaturaLimite: parseInt(process.env.ALERT_TEMP_LIMITE || '23'),
      luminosidadeLimite: parseInt(process.env.ALERT_LUZ_LIMITE || '2500'),
      tempoSemMovimento: parseInt(process.env.ALERT_TEMPO_SEM_MOVIMENTO || '300'),
      lastUpdated: process.env.ALERT_CONFIG_UPDATED || null
    }
    
    return NextResponse.json({
      success: true,
      config: config,
      message: 'Configurações atuais do backend'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar configurações'
    }, { status: 500 })
  }
}