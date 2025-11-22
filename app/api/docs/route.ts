import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/docs:
 *   get:
 *     tags: [Documentation]
 *     summary: Retorna a especificação Swagger da API
 *     description: Documentação completa de todas as rotas da API do sistema IoT
 *     responses:
 *       200:
 *         description: Especificação Swagger em formato JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'IoT Dashboard API',
    version: '1.0.0',
    description: `
# API do Sistema de Monitoramento IoT

Este sistema monitora sensores ESP32 em tempo real e fornece alertas inteligentes para economia de energia.

## Características principais:
- 🌡️ Monitoramento de temperatura, umidade, luminosidade e movimento
- 🚨 Alertas automáticos para economia de energia  
- 📊 Armazenamento histórico em PostgreSQL
- ⚡ Cache busting para dados em tempo real
- 🔧 Configurações dinâmicas de alertas

## Fluxo de dados:
1. **ESP32** → Envia dados a cada 5 segundos para \`/api/gravar\`
2. **PostgreSQL** → Armazena dados com limpeza automática
3. **Frontend** → Consulta \`/api/atual\` e \`/api/historico\` a cada 3 segundos
4. **Alertas** → Sistema detecta desperdícios usando configurações dinâmicas

## Tecnologias:
- **Next.js 14** com App Router
- **PostgreSQL** (Neon) para persistência
- **Vercel** para hospedagem serverless
- **ESP32** com sensores DHT11, LDR, PIR
    `,
    contact: {
      name: 'Sistema IoT TCC',
      url: 'https://github.com/ArthurCandido/monitoramento-iot-TCC'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://monitoramento-iot-tcc.vercel.app',
      description: 'Servidor de produção'
    },
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento'
    }
  ],
  tags: [
    {
      name: 'ESP32 Data',
      description: 'Endpoints para recebimento e recuperação de dados dos sensores'
    },
    {
      name: 'Alerts',
      description: 'Sistema de alertas e configurações'
    },
    {
      name: 'System',
      description: 'Status e informações do sistema'
    },
    {
      name: 'Database',
      description: 'Operações de banco de dados'
    },
    {
      name: 'Documentation',
      description: 'Documentação da API'
    }
  ],
  paths: {
    '/api/gravar': {
      post: {
        tags: ['ESP32 Data'],
        summary: 'Recebe dados dos sensores ESP32',
        description: `
Endpoint principal para recebimento de dados dos sensores IoT.

### Funcionalidades:
- ✅ Validação de dados de entrada
- 🗃️ Armazenamento em PostgreSQL  
- 🚨 Processamento de alertas em tempo real
- 🧹 Limpeza automática de dados antigos

### Lógica de alertas:
- **Ar condicionado**: Se temperatura < limite configurado + sem movimento por X segundos
- **Luzes acesas**: Se luminosidade > limite configurado + sem movimento por X segundos

### Cache e performance:
- Sem cache (dados sempre frescos)
- Auto-limpeza mantém apenas últimas 1000 entradas
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['temperatura', 'umidade', 'luminosidade', 'movimento'],
                properties: {
                  temperatura: {
                    type: 'number',
                    minimum: -40,
                    maximum: 100,
                    example: 25.5,
                    description: 'Temperatura em °C (sensor DHT11)'
                  },
                  umidade: {
                    type: 'number', 
                    minimum: 0,
                    maximum: 100,
                    example: 65.0,
                    description: 'Umidade relativa em % (sensor DHT11)'
                  },
                  luminosidade: {
                    type: 'number',
                    minimum: 0,
                    maximum: 4095,
                    example: 1500,
                    description: 'Luminosidade em lux (sensor LDR)'
                  },
                  movimento: {
                    type: 'string',
                    enum: ['SIM', 'NÃO'],
                    example: 'SIM',
                    description: 'Detecção de movimento (sensor PIR)'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Dados salvos com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Dados salvos com sucesso' },
                    id: { type: 'number', example: 1234 },
                    alertas: {
                      type: 'object',
                      properties: {
                        alerta_ar: { type: 'string', example: 'OK' },
                        alerta_luz: { type: 'string', example: 'Luz pode ter ficado ligada sem ninguém na sala' }
                      }
                    },
                    timestamp: { type: 'string', example: '2025-11-21T23:45:30.123Z' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Dados inválidos' },
                    details: { type: 'string', example: 'Temperatura deve estar entre -40 e 100°C' }
                  }
                }
              }
            }
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Erro interno do servidor' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/atual': {
      get: {
        tags: ['ESP32 Data'],
        summary: 'Retorna os dados mais recentes dos sensores',
        description: `
Busca o registro mais recente dos sensores com cache busting agressivo.

### Cache busting:
- Parâmetros únicos de timestamp
- Headers no-cache para bypass do Vercel Edge CDN
- Dados sempre atualizados em tempo real

### Uso típico:
Frontend consulta este endpoint a cada 3 segundos para atualizar dashboard
        `,
        parameters: [
          {
            name: 't',
            in: 'query',
            description: 'Timestamp para cache busting',
            schema: { type: 'integer' },
            example: 1700598330123
          },
          {
            name: 'bust',
            in: 'query', 
            description: 'String aleatória para cache busting',
            schema: { type: 'string' },
            example: 'a1b2c3'
          }
        ],
        responses: {
          200: {
            description: 'Dados mais recentes dos sensores',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number', example: 1234 },
                    temperatura: { type: 'number', example: 25.5 },
                    umidade: { type: 'number', example: 65.0 },
                    luminosidade: { type: 'number', example: 1500 },
                    movimento: { type: 'string', example: 'SIM' },
                    alerta_ar: { type: 'string', example: 'OK' },
                    alerta_luz: { type: 'string', example: 'Luz pode ter ficado ligada sem ninguém na sala' },
                    data_hora: { type: 'string', example: '2025-11-21T23:45:30.123Z' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Nenhum dado encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Nenhum dado encontrado' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/historico': {
      get: {
        tags: ['ESP32 Data'],
        summary: 'Retorna histórico de dados para gráficos',
        description: `
Retorna os últimos 50 registros para construção de gráficos temporais.

### Dados otimizados:
- Apenas temperatura, luminosidade e timestamp
- Ordenado por data (mais antigo → mais recente)
- Usado para gráficos de linha no dashboard
        `,
        parameters: [
          {
            name: 't',
            in: 'query',
            description: 'Timestamp para cache busting',
            schema: { type: 'integer' }
          },
          {
            name: 'bust', 
            in: 'query',
            description: 'String aleatória para cache busting',
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Array com histórico de dados',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          temperatura: { type: 'number', example: 25.5 },
                          luminosidade: { type: 'number', example: 1500 },
                          data_hora: { type: 'string', example: '2025-11-21T23:45:30.123Z' }
                        }
                      }
                    },
                    count: { type: 'number', example: 50 }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/config-alertas': {
      get: {
        tags: ['Alerts'],
        summary: 'Retorna configurações atuais dos alertas',
        description: 'Busca os limites configurados para alertas de economia de energia'
      },
      post: {
        tags: ['Alerts'], 
        summary: 'Atualiza configurações dos alertas',
        description: `
Define novos limites para os alertas de economia de energia.

### Como funciona:
- Salva configurações em \`process.env\` (compartilhado entre instâncias serverless)
- Aplicado imediatamente no endpoint \`/api/gravar\`
- Permite customização dinâmica dos limites sem redeploy
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['temperaturaLimite', 'luminosidadeLimite', 'tempoSemMovimento'],
                properties: {
                  temperaturaLimite: {
                    type: 'number',
                    minimum: 15,
                    maximum: 30,
                    example: 23,
                    description: 'Temperatura limite para alerta de ar condicionado (°C)'
                  },
                  luminosidadeLimite: {
                    type: 'number',
                    minimum: 1000,
                    maximum: 4000,
                    example: 2500,
                    description: 'Luminosidade limite para alerta de luzes (lux)'
                  },
                  tempoSemMovimento: {
                    type: 'number',
                    minimum: 30,
                    maximum: 1800,
                    example: 300,
                    description: 'Tempo sem movimento para disparar alerta (segundos)'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Configurações salvas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Configurações salvas com sucesso' },
                    config: {
                      type: 'object',
                      properties: {
                        temperaturaLimite: { type: 'number', example: 23 },
                        luminosidadeLimite: { type: 'number', example: 2500 },
                        tempoSemMovimento: { type: 'number', example: 300 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/system-status': {
      get: {
        tags: ['System'],
        summary: 'Status completo do sistema',
        description: `
Verifica saúde de todos os componentes do sistema IoT.

### Verificações:
- 🗃️ **PostgreSQL**: Conectividade e contagem de registros
- 📡 **ESP32**: Última transmissão e tempo desde último dado
- ⚡ **API**: Uptime e responsividade
- 🕐 **Tempo real**: Detecta se dados estão frescos (≤30s) ou antigos

### Estados ESP32:
- **connected**: Último dado ≤ 30 segundos
- **stale**: Último dado 30s - 2 minutos  
- **disconnected**: Último dado > 2 minutos
        `,
        responses: {
          200: {
            description: 'Status detalhado do sistema',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        database: {
                          type: 'object',
                          properties: {
                            status: { type: 'string', enum: ['connected', 'error'], example: 'connected' },
                            lastCheck: { type: 'string', example: '2025-11-21T23:45:30.123Z' },
                            totalRecords: { type: 'number', example: 1000 },
                            lastRecord: { type: 'string', example: '2025-11-21T23:45:25.000Z' }
                          }
                        },
                        esp32: {
                          type: 'object', 
                          properties: {
                            status: { type: 'string', enum: ['connected', 'stale', 'disconnected'], example: 'connected' },
                            lastDataReceived: { type: 'string', example: '2025-11-21T23:45:25.000Z' },
                            secondsSinceLastData: { type: 'number', example: 15 }
                          }
                        },
                        api: {
                          type: 'object',
                          properties: {
                            status: { type: 'string', example: 'operational' },
                            uptime: { type: 'string', example: '1234s' },
                            timestamp: { type: 'string', example: '2025-11-21T23:45:30.123Z' }
                          }
                        }
                      }
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        responseTime: { type: 'string', example: '45ms' },
                        timestamp: { type: 'string', example: '2025-11-21T23:45:30.123Z' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/cleanup': {
      post: {
        tags: ['Database'],
        summary: 'Executa limpeza manual do banco de dados',
        description: `
Remove registros antigos mantendo apenas as últimas 1000 entradas.

### Uso:
- Executado automaticamente a cada inserção em \`/api/gravar\`
- Pode ser chamado manualmente para manutenção
- Otimiza performance e uso de storage
        `,
        responses: {
          200: {
            description: 'Limpeza executada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Limpeza executada com sucesso' },
                    deletedCount: { type: 'number', example: 50 },
                    remainingCount: { type: 'number', example: 1000 }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/init-db': {
      post: {
        tags: ['Database'],
        summary: 'Inicializa o banco de dados',
        description: `
Cria a tabela \`registros_iot\` se não existir.

### Schema da tabela:
\`\`\`sql
CREATE TABLE IF NOT EXISTS registros_iot (
  id SERIAL PRIMARY KEY,
  temperatura REAL NOT NULL,
  umidade REAL NOT NULL,
  luminosidade REAL NOT NULL,
  movimento VARCHAR(3) NOT NULL,
  alerta_ar TEXT,
  alerta_luz TEXT,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`
        `,
        responses: {
          200: {
            description: 'Banco inicializado com sucesso'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      SensorData: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'ID único do registro' },
          temperatura: { type: 'number', description: 'Temperatura em °C' },
          umidade: { type: 'number', description: 'Umidade relativa em %' },
          luminosidade: { type: 'number', description: 'Luminosidade em lux' },
          movimento: { type: 'string', enum: ['SIM', 'NÃO'], description: 'Detecção de movimento' },
          alerta_ar: { type: 'string', description: 'Status do alerta de ar condicionado' },
          alerta_luz: { type: 'string', description: 'Status do alerta de luzes' },
          data_hora: { type: 'string', format: 'date-time', description: 'Timestamp do registro' }
        }
      },
      AlertConfig: {
        type: 'object',
        properties: {
          temperaturaLimite: { type: 'number', minimum: 15, maximum: 30 },
          luminosidadeLimite: { type: 'number', minimum: 1000, maximum: 4000 },
          tempoSemMovimento: { type: 'number', minimum: 30, maximum: 1800 }
        }
      },
      SystemStatus: {
        type: 'object',
        properties: {
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['connected', 'error'] },
              totalRecords: { type: 'number' },
              lastRecord: { type: 'string', format: 'date-time' }
            }
          },
          esp32: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['connected', 'stale', 'disconnected'] },
              lastDataReceived: { type: 'string', format: 'date-time' },
              secondsSinceLastData: { type: 'number' }
            }
          }
        }
      }
    }
  }
}

export async function GET() {
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json'
    }
  })
}