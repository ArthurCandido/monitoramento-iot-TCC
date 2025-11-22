-- Tabela principal para dados dos sensores IoT
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    temperatura DECIMAL(5,2) NOT NULL,
    umidade DECIMAL(5,2) NOT NULL, 
    luminosidade INTEGER NOT NULL,
    movimento VARCHAR(20) NOT NULL,
    alerta_ar VARCHAR(20) DEFAULT 'OK',
    alerta_luz VARCHAR(20) DEFAULT 'OK',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    esp32_timestamp BIGINT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_latest ON sensor_data(id DESC);

-- Comentários para documentação
COMMENT ON TABLE sensor_data IS 'Dados dos sensores ESP32 - temperatura, umidade, luminosidade e movimento';
COMMENT ON COLUMN sensor_data.temperatura IS 'Temperatura em graus Celsius';
COMMENT ON COLUMN sensor_data.umidade IS 'Umidade relativa em percentual';
COMMENT ON COLUMN sensor_data.luminosidade IS 'Valor ADC do sensor de luz (0-4095)';
COMMENT ON COLUMN sensor_data.movimento IS 'Status do sensor PIR: Detectado ou Nenhum';
COMMENT ON COLUMN sensor_data.esp32_timestamp IS 'Timestamp original do ESP32 em millis';