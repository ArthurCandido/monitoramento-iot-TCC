-- ============================================================
-- BANCO DE DADOS IoT DASHBOARD - ESQUEMA SQL
-- ============================================================
-- Database: SQLite (dados.db)
-- Propósito: Armazenar dados de sensores IoT da sala inteligente
-- ============================================================

-- ============================================================
-- TABELA 1: LEITURAS (Dados dos Sensores)
-- ============================================================
CREATE TABLE IF NOT EXISTS leituras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,                    -- ID único da leitura
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,           -- Data e hora da leitura
    temperatura REAL NOT NULL,                              -- Temperatura em °C
    umidade REAL NOT NULL,                                  -- Umidade relativa %
    luminosidade INTEGER NOT NULL,                          -- Luminosidade em lux (0-4095)
    movimento TEXT NOT NULL,                                -- "Detectado" ou "Não detectado"
    alerta_ar TEXT DEFAULT 'OK',                            -- Status do ar condicionado
    alerta_luz TEXT DEFAULT 'OK',                           -- Status da iluminação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP          -- Timestamp de criação
);

-- Índices para melhor performance nas queries
CREATE INDEX IF NOT EXISTS idx_leituras_data_hora ON leituras(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_leituras_created_at ON leituras(created_at DESC);

-- Exemplo de dados:
-- | id | data_hora           | temperatura | umidade | luminosidade | movimento   | alerta_ar | alerta_luz |
-- |----|---------------------|-------------|---------|--------------|-------------|-----------|------------|
-- | 1  | 2024-11-19 10:30:45 | 22.5        | 45.2    | 350          | Detectado   | OK        | OK         |
-- | 2  | 2024-11-19 10:31:45 | 22.6        | 45.1    | 360          | Detectado   | LIGADO    | OK         |
-- | 3  | 2024-11-19 10:32:45 | 22.7        | 45.0    | 370          | Não detecta | OK        | LIGADO     |


-- ============================================================
-- TABELA 2: ALERTAS (Histórico de Alertas)
-- ============================================================
CREATE TABLE IF NOT EXISTS alertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,                    -- ID único do alerta
    tipo TEXT NOT NULL,                                     -- Tipo: 'AR_CONDICIONADO', 'ILUMINACAO', 'MOVIMENTO'
    mensagem TEXT NOT NULL,                                 -- Descrição do alerta
    severidade TEXT DEFAULT 'warning',                      -- 'info', 'warning', 'error', 'critical'
    leitura_id INTEGER,                                     -- Referência à leitura que gerou o alerta
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,        -- Quando o alerta foi criado
    resolvido BOOLEAN DEFAULT 0,                            -- 0 = ativo, 1 = resolvido
    FOREIGN KEY(leitura_id) REFERENCES leituras(id)         -- Integridade referencial
);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data_criacao DESC);

-- Exemplo de dados:
-- | id | tipo          | mensagem              | severidade | resolvido | data_criacao        |
-- |----|---------------|-----------------------|------------|-----------|---------------------|
-- | 1  | AR_CONDICION  | AC ligado...          | warning    | 0         | 2024-11-19 10:31:45 |
-- | 2  | ILUMINACAO    | Luz ambiente baixa... | warning    | 1         | 2024-11-19 10:32:45 |


-- ============================================================
-- TABELA 3: CONFIGURAÇÃO (Configurações do Sistema)
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,                    -- ID único da configuração
    chave TEXT UNIQUE NOT NULL,                             -- Nome da config (ex: 'temp_minima', 'temp_maxima')
    valor TEXT NOT NULL,                                    -- Valor armazenado
    tipo TEXT DEFAULT 'string',                             -- Tipo: 'string', 'number', 'boolean'
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP     -- Quando foi atualizado
);

-- Exemplo de dados:
-- | chave           | valor | tipo    |
-- |-----------------|-------|---------|
-- | temp_minima     | 18    | number  |
-- | temp_maxima     | 28    | number  |
-- | umidade_minima  | 30    | number  |
-- | umidade_maxima  | 70    | number  |
-- | luz_minima      | 200   | number  |


-- ============================================================
-- TABELA 4: STATUS_SISTEMA (Status geral do sistema)
-- ============================================================
CREATE TABLE IF NOT EXISTS status_sistema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,                    -- ID (sempre 1)
    conexao_esp32 BOOLEAN DEFAULT 0,                        -- 1 = conectado, 0 = desconectado
    ultima_leitura DATETIME,                                -- Último dado recebido
    total_leituras INTEGER DEFAULT 0,                       -- Contador de leituras
    uptime_horas REAL DEFAULT 0,                            -- Tempo online em horas
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP     -- Atualizado constantemente
);

-- Exemplo de dados:
-- | id | conexao_esp32 | ultima_leitura      | total_leituras | uptime_horas |
-- |----|---------------|---------------------|----------------|--------------|
-- | 1  | 1             | 2024-11-19 10:32:45 | 1250           | 48.5         |


-- ============================================================
-- HABILITAR FOREIGN KEYS (IMPORTANTE!)
-- ============================================================
PRAGMA foreign_keys = ON;
