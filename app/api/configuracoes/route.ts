import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Buscar configurações
export async function GET() {
  try {
    console.log('📊 GET /api/configuracoes - Buscando configurações')

    const result = await sql`
      SELECT * FROM configuracoes_alertas 
      ORDER BY id DESC 
      LIMIT 1
    `

    if (result.rows.length === 0) {
      // Retornar configurações padrão se não existir no banco
      const defaultConfig = {
        temperatura_limite: 23,
        luminosidade_limite: 2500,
        tempo_sem_movimento: 20
      }
      
      console.log('⚠️ Nenhuma configuração encontrada, retornando padrões')
      
      return NextResponse.json({
        success: true,
        data: defaultConfig,
        isDefault: true
      })
    }

    const config = result.rows[0]
    
    console.log('✅ Configurações carregadas:', config)

    return NextResponse.json({
      success: true,
      data: {
        temperatura_limite: parseFloat(config.temperatura_limite),
        luminosidade_limite: parseInt(config.luminosidade_limite),
        tempo_sem_movimento: parseInt(config.tempo_sem_movimento)
      },
      isDefault: false
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error)
    
    // Em caso de erro, retornar configurações padrão
    return NextResponse.json({
      success: true,
      data: {
        temperatura_limite: 23,
        luminosidade_limite: 2500,
        tempo_sem_movimento: 20
      },
      isDefault: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST - Atualizar configurações
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { temperatura_limite, luminosidade_limite, tempo_sem_movimento } = body

    console.log('📝 POST /api/configuracoes - Atualizando:', body)

    // Validar dados
    if (temperatura_limite === undefined || luminosidade_limite === undefined || tempo_sem_movimento === undefined) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Validar ranges
    if (temperatura_limite < 15 || temperatura_limite > 30) {
      return NextResponse.json(
        { success: false, error: 'Temperatura deve estar entre 15°C e 30°C' },
        { status: 400 }
      )
    }

    if (luminosidade_limite < 500 || luminosidade_limite > 5000) {
      return NextResponse.json(
        { success: false, error: 'Luminosidade deve estar entre 500 e 5000 lux' },
        { status: 400 }
      )
    }

    if (tempo_sem_movimento < 10 || tempo_sem_movimento > 300) {
      return NextResponse.json(
        { success: false, error: 'Tempo sem movimento deve estar entre 10 e 300 segundos' },
        { status: 400 }
      )
    }

    // Inserir nova configuração
    const result = await sql`
      INSERT INTO configuracoes_alertas (
        temperatura_limite,
        luminosidade_limite,
        tempo_sem_movimento,
        atualizado_em
      )
      VALUES (
        ${temperatura_limite},
        ${luminosidade_limite},
        ${tempo_sem_movimento},
        NOW()
      )
      RETURNING *
    `

    const newConfig = result.rows[0]

    console.log('✅ Configurações salvas:', newConfig)

    return NextResponse.json({
      success: true,
      data: {
        temperatura_limite: parseFloat(newConfig.temperatura_limite),
        luminosidade_limite: parseInt(newConfig.luminosidade_limite),
        tempo_sem_movimento: parseInt(newConfig.tempo_sem_movimento)
      },
      message: 'Configurações atualizadas com sucesso'
    })
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao salvar configurações',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
