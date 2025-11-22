import { NextResponse } from "next/server";
import { dbStore } from '@/lib/db-store';

export async function GET() {
  const requestTimestamp = Date.now()
  console.log(`🔵 GET /atual executando [${requestTimestamp}] (PostgreSQL)`);
  
  try {
    // Buscar dados diretamente do PostgreSQL com timestamp único
    console.log(`🔍 [${requestTimestamp}] Forçando busca fresh do PostgreSQL...`)
    const currentData = await dbStore.getCurrentData();
    
    if (currentData) {
      console.log(`✅ [${requestTimestamp}] Dados encontrados no PostgreSQL:`, {
        id: currentData.id,
        timestamp: currentData.timestamp,
        temperatura: currentData.temperatura
      });
      
      // Retornar no formato esperado pelo frontend
      return NextResponse.json({
        id: currentData.id,
        temperatura: currentData.temperatura,
        umidade: currentData.umidade,
        luminosidade: currentData.luminosidade,
        movimento: currentData.movimento,
        alerta_ar: currentData.alerta_ar,
        alerta_luz: currentData.alerta_luz,
        data_hora: currentData.timestamp,
        esp32_timestamp: currentData.esp32_timestamp,
        _fetched_at: new Date().toISOString(),
        _request_id: requestTimestamp
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Request-ID': requestTimestamp.toString()
        }
      });
    }
    
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