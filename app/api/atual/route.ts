import { NextResponse } from "next/server";
import { dataStore } from '@/lib/data-store';

export async function GET() {
  console.log("🔵 GET /atual executando");
  
  try {
    // Buscar dados diretamente do dataStore
    let currentData = dataStore.getCurrentData();
    
    // Se não tem dados, tentar recarregar do cache
    if (!currentData) {
      console.log("⚠️ Sem dados no store, tentando reload do cache...");
      const reloaded = dataStore.forceReloadCache();
      if (reloaded) {
        currentData = dataStore.getCurrentData();
      }
    }
    
    if (currentData) {
      console.log("✅ Retornando dados do store:", currentData);
      return NextResponse.json(currentData);
    }
    
    // Fallback: sem dados disponíveis
    console.log("❌ Nenhum dado disponível");
    return NextResponse.json({
      error: "Nenhum dado disponível",
      message: "Aguardando dados do ESP32"
    }, { status: 404 });
    
  } catch (error) {
    console.log("💥 Erro geral:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}