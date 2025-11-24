import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔧 Adicionando colunas de duração à tabela de alertas...')

    // Adicionar colunas se não existirem
    try {
      await sql`
        ALTER TABLE alertas 
        ADD COLUMN IF NOT EXISTS timestamp_inicio TIMESTAMP,
        ADD COLUMN IF NOT EXISTS timestamp_fim TIMESTAMP,
        ADD COLUMN IF NOT EXISTS duracao_segundos INTEGER
      `
      console.log('✅ Colunas adicionadas com sucesso!')
    } catch (error) {
      console.log('⚠️ Colunas podem já existir:', error)
    }

    // Verificar estrutura da tabela
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'alertas'
      ORDER BY ordinal_position
    `

    return NextResponse.json({
      success: true,
      message: 'Migração concluída',
      columns: result.rows
    })
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro na migração',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
