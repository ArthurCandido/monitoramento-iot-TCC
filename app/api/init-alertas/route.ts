import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔧 Criando tabela de alertas no PostgreSQL...')

    // Criar tabela de alertas
    await sql`
      CREATE TABLE IF NOT EXISTS alertas (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        mensagem TEXT NOT NULL,
        nivel VARCHAR(20) NOT NULL,
        laboratorio VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Criar índices para performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_alertas_timestamp ON alertas(timestamp DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_alertas_nivel ON alertas(nivel)
    `

    console.log('✅ Tabela de alertas criada com sucesso!')

    // Verificar se a tabela foi criada
    const result = await sql`
      SELECT COUNT(*) as count FROM alertas
    `

    return NextResponse.json({
      success: true,
      message: 'Tabela de alertas criada com sucesso',
      totalAlertas: result.rows[0].count
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
