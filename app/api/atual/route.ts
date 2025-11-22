import { NextResponse } from "next/server";

export async function GET() {
  console.log("API /atual called");
  
  const cache = process.env.CACHE_CURRENT_DATA;
  const timestamp = process.env.CACHE_LAST_UPDATE;
  
  if (cache && timestamp) {
    const data = JSON.parse(cache);
    return NextResponse.json({
      temperatura: data.temp,
      umidade: data.umid, 
      luminosidade: data.luz,
      movimento: data.mov,
      alerta_ar: "OK",
      alerta_luz: "OK",
      data_hora: new Date(parseInt(timestamp)).toISOString(),
      id: 1
    });
  }
  
  return NextResponse.json({ error: "No data" }, { status: 404 });
}