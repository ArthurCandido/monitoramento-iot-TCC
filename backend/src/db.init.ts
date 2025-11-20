import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'iot_database.db');
export const db = new Database(dbPath);

// Ativar foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  console.log('[DB] Inicializando banco de dados...');

  // Tabela de leituras dos sensores
  db.exec(`
    CREATE TABLE IF NOT EXISTS leituras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperatura REAL NOT NULL,
      umidade REAL NOT NULL,
      luminosidade INTEGER NOT NULL,
      movimento INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_leituras_timestamp ON leituras(timestamp DESC);
  `);

  // Tabela de alertas
  db.exec(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      resolvido INTEGER DEFAULT 0,
      data_alerta DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_resolucao DATETIME
    );
    CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);
  `);

  // Tabela de configuração
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracao (
      id INTEGER PRIMARY KEY,
      limite_temp_max REAL DEFAULT 30,
      limite_temp_min REAL DEFAULT 15,
      limite_umidade_max REAL DEFAULT 80,
      limite_umidade_min REAL DEFAULT 30,
      limite_luminosidade REAL DEFAULT 500,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Inserir configuração padrão se não existir
  const configExists = db.prepare('SELECT COUNT(*) as count FROM configuracao').get() as any;
  if (configExists.count === 0) {
    db.prepare(`
      INSERT INTO configuracao (
        limite_temp_max, limite_temp_min, 
        limite_umidade_max, limite_umidade_min, 
        limite_luminosidade
      ) VALUES (?, ?, ?, ?, ?)
    `).run(30, 15, 80, 30, 500);
  }

  // Tabela de status do sistema
  db.exec(`
    CREATE TABLE IF NOT EXISTS status_sistema (
      id INTEGER PRIMARY KEY,
      esp32_conectado INTEGER DEFAULT 0,
      ultima_leitura DATETIME,
      uptime_segundos INTEGER DEFAULT 0,
      versao_firmware TEXT
    );
  `);

  // Inserir status padrão se não existir
  const statusExists = db.prepare('SELECT COUNT(*) as count FROM status_sistema').get() as any;
  if (statusExists.count === 0) {
    db.prepare(`
      INSERT INTO status_sistema (esp32_conectado, uptime_segundos)
      VALUES (0, 0)
    `).run();
  }

  console.log('[DB] ✅ Banco de dados inicializado com sucesso!');
  console.log(`[DB] 📍 Localização: ${dbPath}`);
}

export function closeDatabase() {
  db.close();
  console.log('[DB] Conexão com banco de dados fechada');
}
