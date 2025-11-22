import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔵 GET /atual FUNCIONANDO!");
  
  // TESTE DIRETO - sempre retorna dados
  return NextResponse.json({
    temperatura: 27.3,
    umidade: 44,
    luminosidade: 9000,
    movimento: "Nenhum", 
    alerta_ar: "OK",
    alerta_luz: "OK",
    data_hora: new Date().toISOString(),
    id: 999,
    _status: "FUNCIONANDO"
  });
}