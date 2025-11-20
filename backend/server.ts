import express, { Express, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.100'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ============================================================
// DATABASE SETUP
// ============================================================

const db = new sqlite3.Database('./dados.db', (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite');
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
db.serialize(() => {
    // Tabela principal de leituras
    db.run(`CREATE TABLE IF NOT EXISTS leituras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        temperatura REAL NOT NULL,
        umidade REAL NOT NULL,
        luminosidade INTEGER NOT NULL,
        movimento TEXT NOT NULL,
        alerta_ar TEXT DEFAULT 'OK',
        alerta_luz TEXT DEFAULT 'OK',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Índices para melhor performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_leituras_data_hora ON leituras(data_hora DESC)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_leituras_created_at ON leituras(created_at DESC)`);

    // Tabela de alertas (histórico completo)
    db.run(`CREATE TABLE IF NOT EXISTS alertas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        mensagem TEXT NOT NULL,
        severidade TEXT DEFAULT 'warning',
        leitura_id INTEGER,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolvido BOOLEAN DEFAULT 0,
        FOREIGN KEY(leitura_id) REFERENCES leituras(id)
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data_criacao DESC)`);

    // Tabela de configuração
    db.run(`CREATE TABLE IF NOT EXISTS configuracao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        tipo TEXT DEFAULT 'string',
        data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de status do sistema
    db.run(`CREATE TABLE IF NOT EXISTS status_sistema (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conexao_esp32 BOOLEAN DEFAULT 0,
        ultima_leitura DATETIME,
        total_leituras INTEGER DEFAULT 0,
        uptime_horas REAL DEFAULT 0,
        data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('✅ Tabelas criadas/verificadas com sucesso');
});

// ============================================================
// TYPES & INTERFACES
// ============================================================

interface SensorData {
    temp: number;
    umid: number;
    luz: number;
    mov: string;
    alertaAr: string;
    alertaLuz: string;
}

interface SensorReading {
    id: number;
    data_hora: string;
    temperatura: number;
    umidade: number;
    luminosidade: number;
    movimento: string;
    alerta_ar: string;
    alerta_luz: string;
}

interface Alert {
    id: number;
    tipo: string;
    mensagem: string;
    severidade: string;
    data_criacao: string;
    resolvido: boolean;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function dbRun(sql: string, params: any[] = []): Promise<{ id: number }> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function dbGet(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

// Log de operações importantes
function logOperation(type: string, message: string, data?: any) {
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`[${timestamp}] ${type}: ${message}`, data || '');
}

// ============================================================
// API ROUTES
// ============================================================

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 1. POST /api/gravar - ESP32 envia os dados
app.post('/api/gravar', async (req: Request, res: Response) => {
    try {
        const { temp, umid, luz, mov, alertaAr, alertaLuz } = req.body as SensorData;

        // Validação dos dados
        if (temp === undefined || umid === undefined || luz === undefined) {
            return res.status(400).json({
                error: 'Dados incompletos',
                required: ['temp', 'umid', 'luz', 'mov', 'alertaAr', 'alertaLuz']
            });
        }

        // Insere a leitura no banco
        const sql = `INSERT INTO leituras (temperatura, umidade, luminosidade, movimento, alerta_ar, alerta_luz) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

        const result = await dbRun(sql, [temp, umid, luz, mov, alertaAr, alertaLuz]);

        // Se há alerta, registra na tabela de alertas
        if (alertaAr !== 'OK') {
            await dbRun(
                `INSERT INTO alertas (tipo, mensagem, severidade, leitura_id) 
                 VALUES (?, ?, ?, ?)`,
                ['AR_CONDICIONADO', alertaAr, 'warning', result.id]
            );
        }

        if (alertaLuz !== 'OK') {
            await dbRun(
                `INSERT INTO alertas (tipo, mensagem, severidade, leitura_id) 
                 VALUES (?, ?, ?, ?)`,
                ['ILUMINACAO', alertaLuz, 'warning', result.id]
            );
        }

        // Atualiza status do sistema
        await dbRun(
            `UPDATE status_sistema SET conexao_esp32 = 1, ultima_leitura = CURRENT_TIMESTAMP, total_leituras = total_leituras + 1 WHERE id = 1`
        );

        logOperation('INFO', 'Dados recebidos do ESP32', {
            id: result.id,
            temp,
            umid,
            luz,
            movimento: mov
        });

        res.json({
            success: true,
            message: 'Dados gravados com sucesso',
            id: result.id
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao gravar dados', err);
        res.status(500).json({
            error: 'Erro ao processar dados',
            details: (err as Error).message
        });
    }
});

// 2. GET /api/atual - Pega a última leitura (dados atuais)
app.get('/api/atual', async (req: Request, res: Response) => {
    try {
        const sql = `SELECT * FROM leituras ORDER BY id DESC LIMIT 1`;
        const row = await dbGet(sql);

        if (!row) {
            return res.json({
                message: 'Nenhuma leitura disponível',
                data: null
            });
        }

        res.json(row);

    } catch (err) {
        logOperation('ERROR', 'Erro ao buscar leitura atual', err);
        res.status(500).json({
            error: 'Erro ao buscar dados',
            details: (err as Error).message
        });
    }
});

// 3. GET /api/historico - Pega o histórico (últimas 100 leituras)
app.get('/api/historico', async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

        const sql = `SELECT * FROM leituras ORDER BY id DESC LIMIT ? OFFSET ?`;
        const rows = await dbAll(sql, [limit, offset]);

        res.json({
            total: rows.length,
            data: rows.reverse() // Retorna do mais antigo para o novo
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao buscar histórico', err);
        res.status(500).json({
            error: 'Erro ao buscar histórico',
            details: (err as Error).message
        });
    }
});

// 4. GET /api/historico/completo - Pega histórico com agregação
app.get('/api/historico/completo', async (req: Request, res: Response) => {
    try {
        const dias = req.query.dias ? parseInt(req.query.dias as string) : 7;

        const sql = `
            SELECT 
                DATE(data_hora) as data,
                ROUND(AVG(temperatura), 2) as temp_media,
                MAX(temperatura) as temp_max,
                MIN(temperatura) as temp_min,
                ROUND(AVG(umidade), 2) as umidade_media,
                ROUND(AVG(luminosidade), 0) as luz_media,
                COUNT(*) as total_leituras
            FROM leituras
            WHERE data_hora > datetime('now', '-${dias} days')
            GROUP BY DATE(data_hora)
            ORDER BY data DESC
        `;

        const rows = await dbAll(sql);

        res.json({
            periodo_dias: dias,
            total_resultados: rows.length,
            data: rows
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao buscar histórico completo', err);
        res.status(500).json({
            error: 'Erro ao buscar histórico completo',
            details: (err as Error).message
        });
    }
});

// 5. GET /api/alertas - Pega os alertas do sistema
app.get('/api/alertas', async (req: Request, res: Response) => {
    try {
        const resolvido = req.query.resolvido ? req.query.resolvido === 'true' : false;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

        const sql = `
            SELECT * FROM alertas 
            WHERE resolvido = ? 
            ORDER BY data_criacao DESC 
            LIMIT ?
        `;

        const rows = await dbAll(sql, [resolvido ? 1 : 0, limit]);

        res.json({
            total: rows.length,
            data: rows
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao buscar alertas', err);
        res.status(500).json({
            error: 'Erro ao buscar alertas',
            details: (err as Error).message
        });
    }
});

// 6. POST /api/alertas/:id/resolver - Marca alerta como resolvido
app.post('/api/alertas/:id/resolver', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const sql = `UPDATE alertas SET resolvido = 1 WHERE id = ?`;
        await dbRun(sql, [id]);

        logOperation('INFO', 'Alerta marcado como resolvido', { id });

        res.json({
            success: true,
            message: 'Alerta resolvido'
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao resolver alerta', err);
        res.status(500).json({
            error: 'Erro ao resolver alerta',
            details: (err as Error).message
        });
    }
});

// 7. GET /api/estatisticas - Retorna estatísticas gerais
app.get('/api/estatisticas', async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_leituras,
                ROUND(AVG(temperatura), 2) as temperatura_media,
                MAX(temperatura) as temperatura_maxima,
                MIN(temperatura) as temperatura_minima,
                ROUND(AVG(umidade), 2) as umidade_media,
                ROUND(AVG(luminosidade), 0) as luminosidade_media,
                SUM(CASE WHEN alerta_ar != 'OK' THEN 1 ELSE 0 END) as alertas_ar,
                SUM(CASE WHEN alerta_luz != 'OK' THEN 1 ELSE 0 END) as alertas_luz
            FROM leituras
            WHERE data_hora > datetime('now', '-7 days')
        `;

        const stats = await dbGet(sql);

        res.json({
            periodo: 'últimos 7 dias',
            estatisticas: stats
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao buscar estatísticas', err);
        res.status(500).json({
            error: 'Erro ao buscar estatísticas',
            details: (err as Error).message
        });
    }
});

// 8. DELETE /api/leituras - Deleta leituras antigas (mantém os últimos N dias)
app.delete('/api/leituras', async (req: Request, res: Response) => {
    try {
        const dias = req.query.dias ? parseInt(req.query.dias as string) : 30;

        const sql = `DELETE FROM leituras WHERE data_hora < datetime('now', '-${dias} days')`;
        const result = await dbRun(sql);

        logOperation('INFO', 'Limpeza de dados antiga realizada', { dias });

        res.json({
            success: true,
            message: `Dados com mais de ${dias} dias deletados`
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao deletar leituras', err);
        res.status(500).json({
            error: 'Erro ao deletar leituras',
            details: (err as Error).message
        });
    }
});

// 9. GET /api/sistema/status - Status do sistema
app.get('/api/sistema/status', async (req: Request, res: Response) => {
    try {
        const sql = `SELECT * FROM status_sistema WHERE id = 1`;
        const status = await dbGet(sql);

        if (!status) {
            // Cria status inicial
            await dbRun(
                `INSERT INTO status_sistema (conexao_esp32, total_leituras) VALUES (0, 0)`
            );
            const newStatus = await dbGet(sql);
            return res.json(newStatus);
        }

        res.json({
            ...status,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        logOperation('ERROR', 'Erro ao buscar status do sistema', err);
        res.status(500).json({
            error: 'Erro ao buscar status',
            details: (err as Error).message
        });
    }
});

// ============================================================
// ERROR HANDLING & SERVER START
// ============================================================

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method
    });
});

// Error Handler
app.use((err: any, req: Request, res: Response) => {
    logOperation('ERROR', 'Erro não tratado', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    logOperation('START', `🚀 Servidor rodando em http://localhost:${PORT}`);
    logOperation('INFO', 'Aguardando conexão do ESP32...');
});

export default app;
