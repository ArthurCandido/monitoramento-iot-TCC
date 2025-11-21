// ESP32 IoT - Versão Simplificada (Apenas Coleta de Dados)
// Todas as configurações e alertas são gerenciados pelo Dashboard

#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// ============================================================
// CONFIGURAÇÕES DE REDE
// ============================================================
const char* ssid = "";  // Configure sua rede WiFi
const char* password = "";

// URL do servidor Vercel
String serverName = "https://monitoramento-iot-tcc.vercel.app/api/gravar";

// ============================================================
// CONFIGURAÇÕES DE PINOS
// ============================================================
const int pinoPIR = 23;      // Sensor de Movimento (PIR)
const int pinoLDR = 34;      // Sensor de Luz (LDR)
const int pinoDHT = 22;      // Sensor DHT11 
const int pinoLED = 2;       // LED de status

// ============================================================
// SENSOR DHT11
// ============================================================
#define DHTTYPE DHT11
DHT dht(pinoDHT, DHTTYPE);

// ============================================================
// VARIÁVEIS DE CONTROLE
// ============================================================
unsigned long ultimaLeitura = 0;
unsigned long intervaloLeitura = 5000;  // 5 segundos (configurável pelo dashboard)

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n======= ESP32 IoT - Coletor de Dados =======");
  Serial.println("Versão: Simplificada (sem lógica de alertas)");
  
  // Configurar pinos
  pinMode(pinoPIR, INPUT);
  pinMode(pinoLED, OUTPUT);
  digitalWrite(pinoLED, LOW);
  
  // Inicializar DHT
  dht.begin();
  
  // Conectar WiFi
  conectarWiFi();
  
  // Calibração PIR
  Serial.println("🔧 Calibrando PIR (10 segundos)...");
  for(int i = 0; i < 20; i++) {
    digitalWrite(pinoLED, i % 2);
    delay(500);
  }
  digitalWrite(pinoLED, LOW);
  
  Serial.println("✅ Sistema iniciado! Coletando dados...");
  Serial.println("============================================\n");
}

// ============================================================
// CONEXÃO WIFI
// ============================================================
void conectarWiFi() {
  Serial.print("📶 Conectando WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("\n❌ Falha na conexão WiFi!");
  }
}

// ============================================================
// COLETA DE DADOS DOS SENSORES
// ============================================================
struct DadosSensores {
  float temperatura;
  float umidade;
  int luminosidade;
  bool movimento;
  unsigned long timestamp;
};

DadosSensores coletarDados() {
  DadosSensores dados;
  
  // Ler temperatura e umidade
  dados.temperatura = dht.readTemperature();
  dados.umidade = dht.readHumidity();
  
  // Ler luminosidade (0-4095)
  dados.luminosidade = analogRead(pinoLDR);
  
  // Detectar movimento
  dados.movimento = digitalRead(pinoPIR);
  
  // Timestamp
  dados.timestamp = millis();
  
  return dados;
}

// ============================================================
// ENVIO PARA SERVIDOR
// ============================================================
bool enviarDados(DadosSensores dados) {
  // Verificar conexão WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi desconectado - tentando reconectar...");
    conectarWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      return false;
    }
  }
  
  // LED indica transmissão
  digitalWrite(pinoLED, HIGH);
  
  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  http.setConnectTimeout(5000);
  http.setTimeout(5000);
  
  // Montar JSON simples
  String json = "{";
  json += "\"temp\":" + String(dados.temperatura, 2) + ",";
  json += "\"umid\":" + String(dados.umidade, 2) + ","; 
  json += "\"luz\":" + String(dados.luminosidade) + ",";
  json += "\"mov\":\"" + String(dados.movimento ? "Detectado" : "Nenhum") + "\",";
  json += "\"timestamp\":" + String(dados.timestamp);
  json += "}";
  
  Serial.println("📤 Enviando: " + json);
  
  int httpCode = http.POST(json);
  bool sucesso = (httpCode == 200 || httpCode == HTTP_CODE_OK);
  
  if (sucesso) {
    Serial.println("✅ Dados enviados com sucesso!");
  } else {
    Serial.println("❌ Erro no envio - Código: " + String(httpCode));
    String response = http.getString();
    if (response.length() > 0) {
      Serial.println("Resposta: " + response);
    }
  }
  
  http.end();
  digitalWrite(pinoLED, LOW);
  
  return sucesso;
}

// ============================================================
// VALIDAR DADOS
// ============================================================
bool validarDados(DadosSensores dados) {
  // Verificar se DHT leu corretamente
  if (isnan(dados.temperatura) || isnan(dados.umidade)) {
    Serial.println("⚠️  Erro na leitura DHT11");
    return false;
  }
  
  // Verificar ranges válidos
  if (dados.temperatura < -40 || dados.temperatura > 80) {
    Serial.println("⚠️  Temperatura fora do range válido");
    return false;
  }
  
  if (dados.umidade < 0 || dados.umidade > 100) {
    Serial.println("⚠️  Umidade fora do range válido");
    return false;
  }
  
  return true;
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================
void loop() {
  unsigned long agora = millis();
  
  // Verificar se é hora de fazer nova leitura
  if (agora - ultimaLeitura >= intervaloLeitura) {
    ultimaLeitura = agora;
    
    Serial.println("\n🔍 Coletando dados dos sensores...");
    
    // Coletar dados
    DadosSensores dados = coletarDados();
    
    // Mostrar dados coletados
    Serial.println("📊 Dados coletados:");
    Serial.println("  🌡️  Temperatura: " + String(dados.temperatura, 1) + "°C");
    Serial.println("  💧 Umidade: " + String(dados.umidade, 1) + "%");
    Serial.println("  💡 Luminosidade: " + String(dados.luminosidade));
    Serial.println("  🚶 Movimento: " + String(dados.movimento ? "SIM" : "NÃO"));
    
    // Validar dados antes de enviar
    if (validarDados(dados)) {
      // Enviar para servidor
      bool enviado = enviarDados(dados);
      
      if (enviado) {
        Serial.println("✅ Ciclo completo - aguardando próxima leitura...\n");
      } else {
        Serial.println("❌ Falha no envio - tentará novamente...\n");
      }
    } else {
      Serial.println("❌ Dados inválidos - pulando envio...\n");
    }
  }
  
  // Pequeno delay para não sobrecarregar o processador
  delay(100);
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

// Função para receber comandos de configuração via Serial (opcional)
void processarComandos() {
  if (Serial.available() > 0) {
    String comando = Serial.readString();
    comando.trim();
    
    if (comando.startsWith("intervalo:")) {
      int novoIntervalo = comando.substring(10).toInt();
      if (novoIntervalo >= 1000 && novoIntervalo <= 60000) {
        intervaloLeitura = novoIntervalo;
        Serial.println("⚙️  Intervalo alterado para: " + String(intervaloLeitura) + "ms");
      } else {
        Serial.println("❌ Intervalo deve estar entre 1000-60000ms");
      }
    }
    else if (comando == "status") {
      Serial.println("\n📋 Status do sistema:");
      Serial.println("  📶 WiFi: " + String(WiFi.status() == WL_CONNECTED ? "Conectado" : "Desconectado"));
      Serial.println("  🕐 Intervalo: " + String(intervaloLeitura) + "ms");
      Serial.println("  🔄 Uptime: " + String(millis()/1000) + "s");
    }
  }
}