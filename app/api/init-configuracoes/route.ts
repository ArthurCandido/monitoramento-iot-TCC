import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔧 Criando tabela de configurações no PostgreSQL...')

    // Criar tabela de configurações
    await sql`
      CREATE TABLE IF NOT EXISTS configuracoes_alertas (
        id SERIAL PRIMARY KEY,
        temperatura_limite DECIMAL(4,1) NOT NULL DEFAULT 23.0,
        luminosidade_limite INTEGER NOT NULL DEFAULT 2500,
        tempo_sem_movimento INTEGER NOT NULL DEFAULT 20,
        atualizado_em TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    console.log('✅ Tabela de configurações criada!')

    // Inserir configuração padrão se não existir
    const existing = await sql`SELECT COUNT(*) as count FROM configuracoes_alertas`
    
    if (parseInt(existing.rows[0].count) === 0) {
      await sql`
        INSERT INTO configuracoes_alertas (
          temperatura_limite,
          luminosidade_limite,
          tempo_sem_movimento
        )
        VALUES (23.0, 2500, 20)
      `
      console.log('✅ Configurações padrão inseridas!')
    }

    // Verificar configurações atuais
    const current = await sql`
      SELECT * FROM configuracoes_alertas ORDER BY id DESC LIMIT 1
    `

    return NextResponse.json({
      success: true,
      message: 'Tabela de configurações criada com sucesso',
      currentConfig: current.rows[0]
    })
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar tabela',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
