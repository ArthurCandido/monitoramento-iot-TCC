import { NextResponse } from "next/server";
import { dataStore } from '@/lib/data-store';

export async function GET() {
  console.log("🔵 GET /atual executando");
  
  try {
    // SEMPRE tentar recarregar do cache primeiro (instâncias serverless isoladas)
    console.log("🔄 Forçando reload do cache...");
    const reloaded = dataStore.forceReloadCache();
    
    let currentData = dataStore.getCurrentData();
    
    if (currentData) {
      console.log("✅ Retornando dados do store:", currentData);
      return NextResponse.json(currentData);
    }
    
    // Se não conseguiu recarregar, verificar cache de processo diretamente
    const cachedData = process.env.CACHE_CURRENT_DATA;
    const lastUpdate = process.env.CACHE_LAST_UPDATE;
    
    if (cachedData && lastUpdate) {
      console.log("📂 Lendo cache de processo direto");
      const data = JSON.parse(cachedData);
      
      const directData = {
        temperatura: data.temp,
        umidade: data.umid,
        luminosidade: data.luz,
        movimento: data.mov,
        alerta_ar: data.alertaAr || 'OK',
        alerta_luz: data.alertaLuz || 'OK',
        data_hora: new Date(parseInt(lastUpdate)).toISOString(),
        id: Date.now() // ID único baseado em timestamp
      };
      
      console.log("✅ Retornando dados direto do cache:", directData);
      return NextResponse.json(directData);
    }
    
    // Fallback: sem dados disponíveis
    console.log("❌ Nenhum dado disponível no cache");
    return NextResponse.json({
      error: "Nenhum dado disponível",
      message: "Aguardando dados do ESP32",
      debug: {
        hasCache: !!cachedData,
        hasTimestamp: !!lastUpdate,
        envKeys: Object.keys(process.env).filter(k => k.startsWith('CACHE_'))
      }
    }, { status: 404 });
    
  } catch (error) {
    console.log("💥 Erro geral:", error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}