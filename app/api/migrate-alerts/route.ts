import { NextResponse } from 'next/server'
import postgres from 'postgres'

// Conexão com PostgreSQL
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30
})

export async function POST() {
  try {
    console.log('🔧 Executando migração para campos de alerta maiores...')
    
    // Alterar o tamanho dos campos de alerta
    await sql`
      ALTER TABLE sensor_data 
      ALTER COLUMN alerta_ar TYPE VARCHAR(200),
      ALTER COLUMN alerta_luz TYPE VARCHAR(200);
    `
    
    console.log('✅ Migração concluída - campos de alerta expandidos')
    
    // Verificar a estrutura atualizada
    const tableInfo = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'sensor_data' 
      AND column_name IN ('alerta_ar', 'alerta_luz');
    `
    
    return NextResponse.json({
      success: true,
      message: 'Migração executada com sucesso',
      details: 'Campos alerta_ar e alerta_luz expandidos para VARCHAR(200)',
      tableStructure: tableInfo
    })
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao executar migração',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verificar estrutura atual da tabela
    const tableInfo = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'sensor_data' 
      ORDER BY ordinal_position;
    `
    
    return NextResponse.json({
      success: true,
      message: 'Estrutura da tabela sensor_data',
      columns: tableInfo
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar estrutura da tabela',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}