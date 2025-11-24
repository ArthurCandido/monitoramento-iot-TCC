import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Buscar histórico de alertas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1000')
    const tipo = searchParams.get('tipo') as 'ar-condicionado' | 'luzes' | null
    const nivel = searchParams.get('nivel') as 'warning' | 'error' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📊 GET /api/alertas - Buscando histórico de alertas do PostgreSQL')

    // Construir query dinamicamente
    let query = 'SELECT * FROM alertas WHERE 1=1'
    const params: any[] = []
    let paramCount = 1

    if (tipo) {
      query += ` AND tipo = $${paramCount}`
      params.push(tipo)
      paramCount++
    }

    if (nivel) {
      query += ` AND nivel = $${paramCount}`
      params.push(nivel)
      paramCount++
    }

    if (startDate) {
      query += ` AND timestamp >= $${paramCount}`
      params.push(new Date(startDate).toISOString())
      paramCount++
    }

    if (endDate) {
      query += ` AND timestamp <= $${paramCount}`
      params.push(new Date(endDate).toISOString())
      paramCount++
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramCount}`
    params.push(limit)

    // Executar query
    const result = await sql.query(query, params)
    
    // Buscar total de registros
    const totalResult = await sql`SELECT COUNT(*) as total FROM alertas`
    const total = parseInt(totalResult.rows[0].total)

    console.log(`✅ Retornando ${result.rows.length} alertas de ${total} total`)

    return NextResponse.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        tipo: row.tipo,
        mensagem: row.mensagem,
        nivel: row.nivel,
        timestamp: new Date(row.timestamp).getTime(),
        laboratorio: row.laboratorio
      })),
      total: total,
      filtered: result.rows.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('❌ Erro ao buscar alertas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar alertas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo alerta
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tipo, mensagem, nivel, laboratorio, timestampInicio, timestampFim, duracaoSegundos } = body

    console.log('📝 POST /api/alertas - Criando novo alerta:', { tipo, nivel, laboratorio, duracaoSegundos })

    // Validar dados
    if (!tipo || !mensagem || !nivel || !laboratorio) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Inserir no PostgreSQL
    const result = await sql`
      INSERT INTO alertas (
        tipo, 
        mensagem, 
        nivel, 
        laboratorio, 
        timestamp, 
        timestamp_inicio, 
        timestamp_fim, 
        duracao_segundos
      )
      VALUES (
        ${tipo}, 
        ${mensagem}, 
        ${nivel}, 
        ${laboratorio}, 
        NOW(),
        ${timestampInicio ? new Date(timestampInicio).toISOString() : null},
        ${timestampFim ? new Date(timestampFim).toISOString() : null},
        ${duracaoSegundos || null}
      )
      RETURNING *
    `

    const newAlert = result.rows[0]

    console.log(`✅ Alerta criado com sucesso no PostgreSQL: ID ${newAlert.id}`)

    return NextResponse.json({
      success: true,
      data: {
        id: newAlert.id,
        tipo: newAlert.tipo,
        mensagem: newAlert.mensagem,
        nivel: newAlert.nivel,
        timestamp: new Date(newAlert.timestamp).getTime(),
        laboratorio: newAlert.laboratorio,
        duracaoSegundos: newAlert.duracao_segundos
      }
    })
  } catch (error) {
    console.error('❌ Erro ao criar alerta:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar alerta',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Deletar alerta específico
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do alerta não fornecido' },
        { status: 400 }
      )
    }

    console.log('🗑️ DELETE /api/alertas - Deletando alerta:', id)

    // Deletar do PostgreSQL
    const result = await sql`
      DELETE FROM alertas 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Alerta não encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ Alerta ${id} deletado do PostgreSQL`)

    return NextResponse.json({
      success: true,
      deleted: id
    })
  } catch (error) {
    console.error('❌ Erro ao deletar alerta:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao deletar alerta',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
