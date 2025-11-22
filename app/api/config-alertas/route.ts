import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tempoSemMovimento } = body
    
    // Validar entrada
    if (!tempoSemMovimento || typeof tempoSemMovimento !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Campo tempoSemMovimento é obrigatório e deve ser um número'
      }, { status: 400 })
    }
    
    if (tempoSemMovimento < 10 || tempoSemMovimento > 300) {
      return NextResponse.json({
        success: false,
        error: 'tempoSemMovimento deve estar entre 10 e 300 segundos'
      }, { status: 400 })
    }
    
    // Salvar configuração em process.env (valores de temperatura e luminosidade são fixos)
    process.env.ALERT_TEMPO_SEM_MOVIMENTO = tempoSemMovimento.toString()
    // Valores fixos do sistema
    process.env.ALERT_TEMP_LIMITE = '23'
    process.env.ALERT_LUZ_LIMITE = '2500'
    process.env.ALERT_CONFIG_UPDATED = String(Date.now())
    
    console.log('💾 Configurações de alerta salvas:', {
      tempoSemMovimento,
      temperaturaLimite: 23, // fixo
      luminosidadeLimite: 2500 // fixo
    })
    
    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      config: {
        tempoSemMovimento: tempoSemMovimento,
        temperaturaLimite: 23, // sempre fixo
        luminosidadeLimite: 2500 // sempre fixo
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Obter configuração do process.env com valores padrão
    const tempoSemMovimento = parseInt(process.env.ALERT_TEMPO_SEM_MOVIMENTO || '20')
    
    // Valores sempre fixos
    const temperaturaLimite = 23
    const luminosidadeLimite = 2500
    
    return NextResponse.json({
      success: true,
      config: {
        tempoSemMovimento,
        temperaturaLimite, // sempre fixo
        luminosidadeLimite // sempre fixo
      },
      meta: {
        isConfigurable: {
          tempoSemMovimento: true,
          temperaturaLimite: false,
          luminosidadeLimite: false
        },
        defaults: {
          tempoSemMovimento: 20
        },
        lastUpdated: process.env.ALERT_CONFIG_UPDATED || null
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}