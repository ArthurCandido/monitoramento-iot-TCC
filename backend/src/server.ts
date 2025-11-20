import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db, initializeDatabase, closeDatabase } from './db.init';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inicializar banco de dados
initializeDatabase();

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  const status = db.prepare('SELECT esp32_conectado FROM status_sistema LIMIT 1').get() as any;
  res.json({ 
    status: 'ok', 
    esp32_conectado: status?.esp32_conectado || 0,
    timestamp: new Date().toISOString()
  });
});

// Gravar dados do ESP32
app.post('/api/gravar', (req: Request, res: Response) => {
  try {
    const { temperatura, umidade, luminosidade, movimento } = req.body;

    if (temperatura === undefined || umidade === undefined || luminosidade === undefined || movimento === undefined) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const insert = db.prepare(`
      INSERT INTO leituras (temperatura, umidade, luminosidade, movimento)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = insert.run(temperatura, umidade, luminosidade, movimento);

    // Atualizar status do sistema
    db.prepare(`
      UPDATE status_sistema SET esp32_conectado = 1, ultima_leitura = CURRENT_TIMESTAMP
    `).run();

    // Verificar alertas
    const config = db.prepare('SELECT * FROM configuracao LIMIT 1').get() as any;
    
    if (temperatura > config.limite_temp_max) {
      db.prepare(`
        INSERT INTO alertas (tipo, mensagem) VALUES (?, ?)
      `).run('TEMPERATURA_ALTA', `Temperatura acima do limite: ${temperatura}°C`);
    }

    if (movimento === 1) {
      db.prepare(`
        INSERT INTO alertas (tipo, mensagem) VALUES (?, ?)
      `).run('MOVIMENTO', 'Movimento detectado');
    }

    res.json({ sucesso: true, id: result.lastInsertRowid });
  } catch (erro: any) {
    console.error('[API] Erro ao gravar:', erro.message);
    res.status(500).json({ erro: 'Erro ao gravar dados' });
  }
});

// Obter leitura atual
app.get('/api/atual', (req: Request, res: Response) => {
  try {
    const leitura = db.prepare(`
      SELECT * FROM leituras ORDER BY timestamp DESC LIMIT 1
    `).get();
    res.json(leitura || {});
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Obter histórico com paginação
app.get('/api/historico', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const leituras = db.prepare(`
      SELECT * FROM leituras ORDER BY timestamp DESC LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = (db.prepare('SELECT COUNT(*) as count FROM leituras').get() as any).count;

    res.json({ leituras, total, limit, offset });
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Obter alertas
app.get('/api/alertas', (req: Request, res: Response) => {
  try {
    const alertas = db.prepare(`
      SELECT * FROM alertas ORDER BY data_alerta DESC LIMIT 50
    `).all();
    res.json(alertas);
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Atualizar status de alerta
app.put('/api/alertas/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare(`
      UPDATE alertas SET resolvido = 1, data_resolucao = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id);
    res.json({ sucesso: true });
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Obter estatísticas
app.get('/api/estatisticas', (req: Request, res: Response) => {
  try {
    const stats = db.prepare(`
      SELECT 
        AVG(temperatura) as temp_media,
        MAX(temperatura) as temp_max,
        MIN(temperatura) as temp_min,
        AVG(umidade) as umidade_media,
        AVG(luminosidade) as luminosidade_media
      FROM leituras
      WHERE timestamp > datetime('now', '-1 hour')
    `).get();
    res.json(stats);
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Obter configuração
app.get('/api/configuracao', (req: Request, res: Response) => {
  try {
    const config = db.prepare('SELECT * FROM configuracao LIMIT 1').get();
    res.json(config);
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Atualizar configuração
app.put('/api/configuracao', (req: Request, res: Response) => {
  try {
    const { limite_temp_max, limite_temp_min, limite_umidade_max, limite_umidade_min, limite_luminosidade } = req.body;
    
    db.prepare(`
      UPDATE configuracao SET 
        limite_temp_max = ?, 
        limite_temp_min = ?, 
        limite_umidade_max = ?, 
        limite_umidade_min = ?, 
        limite_luminosidade = ?
      WHERE id = 1
    `).run(limite_temp_max, limite_temp_min, limite_umidade_max, limite_umidade_min, limite_luminosidade);

    res.json({ sucesso: true });
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Limpar dados antigos
app.delete('/api/leituras/antigas', (req: Request, res: Response) => {
  try {
    const dias = req.query.dias || 7;
    const result = db.prepare(`
      DELETE FROM leituras WHERE timestamp < datetime('now', '-' || ? || ' days')
    `).run(dias);
    res.json({ deletados: (result as any).changes });
  } catch (erro: any) {
    res.status(500).json({ erro: erro.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⛔ Encerrando servidor...');
  closeDatabase();
  process.exit(0);
});
