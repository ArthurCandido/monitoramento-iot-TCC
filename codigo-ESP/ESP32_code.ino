// Código atualizado para o ESP32 com melhorias de confiabilidade

#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

// ============================================================
// CONFIGURAÇÕES DE REDE
// ============================================================
const char* ssid = "";
const char* password = "";

// URL do servidor backend (ajuste conforme seu IP)
String serverName = "/api/gravar";

// ============================================================
// CONFIGURAÇÕES DE PINOS
// ============================================================
const int pinoPIR = 23;      // Sensor de Movimento (PIR)
const int pinoLDR = 34;      // Sensor de Luz (LDR) - ADC
const int pinoDHT = 22;      // Sensor de Temperatura/Umidade (DHT11)
const int pinoLED = 2;       // LED de feedback visual

// ============================================================
// CONFIGURAÇÃO DO DHT11
// ============================================================
#define DHTTYPE DHT11
DHT dht(pinoDHT, DHTTYPE);

// ============================================================
// LIMIARES DE ALERTA
// ============================================================
const float TEMPERATURA_ALERTA = 23.0;  // °C
const int LIMIAR_LUZ_ALTA = 2000;       // Valor do LDR
const unsigned long TEMPO_SEM_MOVIMENTO = 20000;  // 20 segundos

// ============================================================
// VARIÁVEIS DE CONTROLE
// ============================================================
unsigned long ultimoMovimento = 0;
unsigned long ultimoEnvio = 0;
const long intervaloEnvio = 5000;  // 5 segundos

// Retry logic
int tentativas_wifi = 0;
const int MAX_TENTATIVAS = 5;
const unsigned long TIMEOUT_CONEXAO = 15000;  // 15 segundos

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n========== INICIANDO ESP32 IoT ==========");
  
  // Inicializa pinos
  pinMode(pinoPIR, INPUT);
  pinMode(pinoLED, OUTPUT);
  digitalWrite(pinoLED, LOW);
  
  dht.begin();

  // Conecta ao WiFi
  conectarWiFi();
  
  // Calibração do PIR
  Serial.println("▌ Calibrando sensor PIR (aguarde 20 segundos)...");
  for(int i = 0; i < 10; i++){
    digitalWrite(pinoLED, HIGH);
    delay(100);
    digitalWrite(pinoLED, LOW);
    delay(1900);
    Serial.print(".");
  }
  
  Serial.println("\n✓ Sistema pronto e monitorando!");
  Serial.println("=========================================\n");
  
  ultimoMovimento = millis();
}

// ============================================================
// CONEXÃO WIFI
// ============================================================
void conectarWiFi() {
  Serial.print("▌ Conectando ao WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  unsigned long inicio = millis();
  int contador = 0;
  
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - inicio > TIMEOUT_CONEXAO) {
      Serial.println("\n✗ Timeout na conexão WiFi!");
      return;
    }
    
    delay(500);
    Serial.print(".");
    contador++;
  }
  
  Serial.println("\n✓ WiFi conectado!");
  Serial.print("  IP: ");
  Serial.println(WiFi.localIP());
}

// ============================================================
// ENVIO DE DADOS
// ============================================================
void enviarDados(float temp, float umid, int luz, String mov, String alertaAr, String alertaLuz) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi desconectado! Tentando reconectar...");
    conectarWiFi();
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("✗ Falha na reconexão");
      return;
    }
  }

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  http.setConnectTimeout(5000);
  http.setTimeout(5000);

  // Monta o JSON
  String json = "{\"temp\":" + String(temp, 2) + 
                ",\"umid\":" + String(umid, 2) + 
                ",\"luz\":" + String(luz) + 
                ",\"mov\":\"" + mov + "\"" +
                ",\"alertaAr\":\"" + alertaAr + "\"" +
                ",\"alertaLuz\":\"" + alertaLuz + "\"}";

  Serial.println("▌ Enviando dados...");
  Serial.print("  JSON: ");
  Serial.println(json);

  int httpCode = http.POST(json);

  if (httpCode == HTTP_CODE_OK || httpCode == 200) {
    Serial.println("✓ Dados enviados com sucesso!");
    tentativas_wifi = 0;
  } else {
    Serial.print("✗ Erro HTTP: ");
    Serial.println(httpCode);
    tentativas_wifi++;
  }

  http.end();
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================
void loop() {
  // Monitora movimento continuamente
  if (digitalRead(pinoPIR) == HIGH) {
    ultimoMovimento = millis();
    digitalWrite(pinoLED, HIGH);
  } else {
    digitalWrite(pinoLED, LOW);
  }

  // Lê sensores e envia dados a cada intervaloEnvio
  if (millis() - ultimoEnvio > intervaloEnvio) {
    ultimoEnvio = millis();

    // Lê sensores
    float temp = dht.readTemperature();
    float umid = dht.readHumidity();
    int luz = analogRead(pinoLDR);

    // Valida leitura DHT
    if (isnan(temp) || isnan(umid)) {
      Serial.println("✗ Erro na leitura do DHT11!");
      return;
    }

    Serial.println("\n--- Leitura de Sensores ---");
    Serial.print("Temperatura: ");
    Serial.print(temp);
    Serial.println("°C");
    Serial.print("Umidade: ");
    Serial.print(umid);
    Serial.println("%");
    Serial.print("Luminosidade: ");
    Serial.println(luz);

    // Status de movimento
    String movStatus = (millis() - ultimoMovimento < 5000) ? "Detectado" : "Nenhum";
    
    // Lógica de alertas
    String alertaAr = "OK";
    String alertaLuz = "OK";
    
    bool semMovimento = (millis() - ultimoMovimento > TEMPO_SEM_MOVIMENTO);

    if (semMovimento) {
      if (temp < TEMPERATURA_ALERTA) {
        alertaAr = "ALERTA: Ar ligado s/ gente!";
      }
      
      if (luz > LIMIAR_LUZ_ALTA) {
        alertaLuz = "ALERTA: Luz acesa s/ gente!";
      }
    }

    // Envia os dados
    enviarDados(temp, umid, luz, movStatus, alertaAr, alertaLuz);
  }
}
