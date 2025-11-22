import { NextResponse } from "next/server";
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const requestTimestamp = Date.now()
  const uniqueId = Math.random().toString(36).substring(7)
  console.log(`🔵 GET /atual [${uniqueId}] executando [${requestTimestamp}] (PostgreSQL direto)`);
  
  try {
    // Usar sql direto como no histórico
    console.log(`🔍 [${uniqueId}] Query direta no PostgreSQL...`)
    
    const result = await sql`
      SELECT 
        id,
        temperatura,
        umidade, 
        luminosidade,
        movimento,
        alerta_ar,
        alerta_luz,
        timestamp,
        esp32_timestamp,
        NOW() as query_time
      FROM sensor_data 
      ORDER BY timestamp DESC, id DESC 
      LIMIT 1;
    `
    
    console.log(`✅ [${uniqueId}] Query executada:`, {
      rowCount: result.rowCount,
      latestId: result.rows[0]?.id,
      queryTime: result.rows[0]?.query_time
    })
    
    if (result.rows.length === 0) {
      console.log(`❌ [${uniqueId}] Nenhum dado encontrado`)
      return NextResponse.json({
        error: "Nenhum dado disponível",
        message: "Aguardando dados do ESP32"
      }, { status: 404 });
    }
    
    const row = result.rows[0]
    const response = {
      id: row.id,
      temperatura: parseFloat(row.temperatura),
      umidade: parseFloat(row.umidade),
      luminosidade: row.luminosidade,
      movimento: row.movimento,
      alerta_ar: row.alerta_ar,
      alerta_luz: row.alerta_luz,
      data_hora: row.timestamp,
      esp32_timestamp: row.esp32_timestamp,
      _fetched_at: new Date().toISOString(),
      _request_id: requestTimestamp,
      _unique_id: uniqueId
    }
    
    console.log(`✅ [${uniqueId}] Retornando dados:`, {
      id: response.id,
      timestamp: response.data_hora,
      temperatura: response.temperatura
    });
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Request-ID': requestTimestamp.toString(),
        'X-Unique-ID': uniqueId,
        'Vary': 'X-Request-ID'
      }
    });
    
    // Sem dados disponíveis
    console.log("❌ Nenhum dado disponível no PostgreSQL");
    return NextResponse.json({
      error: "Nenhum dado disponível",
      message: "Aguardando dados do ESP32"
    }, { status: 404 });
    
  } catch (error) {
    console.log("💥 Erro ao buscar dados:", error);
    return NextResponse.json({ 
      error: "Erro no banco de dados", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}