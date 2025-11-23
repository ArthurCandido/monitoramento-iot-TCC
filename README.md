# 🏠 Sistema de Monitoramento IoT Multi-Laboratório - TCC

Sistema completo de monitoramento em tempo real para ambientes acadêmicos utilizando ESP32 e sensores IoT. 
Apresenta dashboard web responsivo com sistema de seleção de laboratórios, visualizações ao vivo, análise histórica, 
alertas automáticos inteligentes e documentação API integrada para otimização energética.

## 🎯 Visão Geral

Este projeto implementa uma solução IoT abrangente para monitoramento de economia de energia em laboratórios acadêmicos, 
detectando desperdícios como ar condicionado e luzes funcionando sem presença humana. O sistema suporta múltiplos 
laboratórios (E100-E107) com interface intuitiva para seleção e monitoramento.

## 🔧 Stack Tecnológica

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI/UX**: React 18, TailwindCSS, Radix UI
- **Componentes**: Shadcn/ui, Lucide React Icons
- **Gráficos**: Recharts para visualizações de dados
- **Estado**: React Context API, LocalStorage

### Backend
- **Runtime**: Node.js + Express.js
- **Banco**: PostgreSQL (Neon Database)
- **ORM**: SQL direto com conexões pooled
- **Documentação**: Swagger UI integrado

### Hardware & IoT
- **Microcontrolador**: ESP32 DevKit V1
- **Sensores**: DHT11 (temp/umidade), LDR (luz), PIR (movimento)
- **Comunicação**: HTTP/REST API via WiFi
- **Protótipo**: Laboratório E105 (único ativo)

## 📊 Funcionalidades Principais

### 🏢 Sistema Multi-Laboratório
- **8 Laboratórios**: E100 a E107 (Bloco E)
- **Seleção Intuitiva**: Interface de cards na primeira visita
- **Persistência**: Lembra laboratório selecionado
- **Troca Rápida**: Botão de reset na sidebar
- **Status Visual**: Badges indicando laboratórios ativos/inativos

### 📈 Dashboard Inteligente
- **Monitoramento Real-time**: Dados atualizados a cada 3 segundos
- **Métricas Visuais**: Cards com temperatura, umidade, luz e movimento
- **Gráficos Interativos**: Histórico temporal com zoom e tooltips
- **Indicadores de Status**: Conexão, alertas ativos, última atualização

### 🚨 Sistema de Alertas Avançado
- **Lógica Temporal**: Alertas só após 20 segundos sem movimento
- **Detecção Inteligente**: Ar condicionado e luzes sem presença
- **Histórico Completo**: Log de todos os alertas com timestamps
- **Estatísticas**: Contadores por tipo de alerta
- **Reset Manual**: Limpar alertas ativos

### 🎨 Interface Moderna
- **Design Responsivo**: Mobile-first, adaptável a qualquer tela
- **Tema Escuro/Claro**: Suporte automático ao sistema
- **Componentes Acessíveis**: Padrões WCAG com Radix UI
- **Navegação Intuitiva**: Sidebar com seções organizadas
- **Loading States**: Indicadores visuais durante carregamento

### 📚 Documentação Integrada
- **Swagger UI**: Documentação interativa da API
- **Endpoints Testáveis**: Interface para testar requisições
- **Esquemas Detalhados**: Modelos de dados e respostas
- **Exemplos Práticos**: Código e payloads de exemplo

## 🏗️ Arquitetura do Sistema

```
📁 io-t-dashboard-frontend/
├── 📁 app/                     # Next.js App Router
│   ├── 📄 globals.css          # Estilos globais TailwindCSS
│   ├── 📄 layout.tsx           # Layout principal da aplicação
│   ├── 📄 page.tsx             # Página principal com roteamento
│   └── 📁 docs/                # Documentação Swagger integrada
│
├── 📁 components/              # Componentes React reutilizáveis
│   ├── 📄 lab-selector.tsx     # Tela inicial seleção laboratórios
│   ├── 📄 labs-view.tsx        # Interface gerenciamento laboratórios
│   ├── 📄 dashboard-view.tsx   # Dashboard principal
│   ├── 📄 sensors-view.tsx     # Visualização detalhada sensores
│   ├── 📄 history-view.tsx     # Gráficos históricos
│   ├── 📄 alerts-view.tsx      # Gerenciamento de alertas
│   ├── 📄 sidebar.tsx          # Navegação lateral
│   ├── 📄 no-data-view.tsx     # Labs inativos
│   └── 📁 ui/                  # Componentes base Shadcn/ui
│
├── 📁 contexts/                # Gerenciamento de Estado
│   └── 📄 lab-context.tsx      # Contexto laboratórios
│
├── 📁 hooks/                   # React Hooks personalizados
│   ├── 📄 use-alert-system.ts  # Lógica alertas inteligentes
│   └── 📄 use-toast.ts         # Sistema notificações
│
├── 📁 lib/                     # Utilitários
│   └── 📄 utils.ts             # Helpers e funções auxiliares
│
├── 📁 backend/                 # Código ESP32 e documentação
│   ├── 📄 ESP32_code.ino       # Firmware ESP32
│   ├── 📄 server.ts            # Servidor Node.js/Express
│   ├── 📄 DATABASE_GUIDE.md    # Guia configuração banco
│   └── 📁 database/            # Scripts SQL
│
└── 📁 public/                  # Assets estáticos
```

## 🚀 Configuração e Execução

### Pré-requisitos
- **Node.js** >= 20.3.0
- **pnpm** ou npm
- **PostgreSQL** (recomendado: Neon Database)
- **ESP32** com sensores conectados

### 🔧 Instalação Frontend

1. **Clone o repositório**
```bash
git clone https://github.com/ArthurCandido/monitoramento-iot-TCC.git
cd monitoramento-iot-TCC
```

2. **Instale dependências**
```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install --legacy-peer-deps
```

3. **Configure variáveis de ambiente**
```bash
# Crie .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
```

4. **Execute em desenvolvimento**
```bash
pnpm dev
# ou
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

### 🗄️ Configuração Backend

1. **Configure o banco PostgreSQL**
```sql
-- Execute o schema em database/schema.sql
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    temperatura DECIMAL(5,2),
    umidade DECIMAL(5,2),
    luminosidade INTEGER,
    movimento VARCHAR(50),
    alerta_ar VARCHAR(200),
    alerta_luz VARCHAR(200),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Configure variáveis do servidor**
```bash
cd backend
# Configure as credenciais do banco em server.ts
```

3. **Execute o servidor**
```bash
cd backend
npm install
npm run dev
```

### 🔌 Configuração ESP32

1. **Instale bibliotecas Arduino IDE**
```
- WiFi
- HTTPClient  
- ArduinoJson
- DHT sensor library
```

2. **Configure rede e endpoint**
```cpp
// Em ESP32_code.ino
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";
String serverName = "http://SEU_IP:3000/api/gravar";
```

3. **Esquema de Conexões**
```
ESP32 Pinout:
├── DHT11
│   ├── VCC → 3.3V
│   ├── GND → GND  
│   └── DATA → GPIO 22
├── LDR (Divisor Tensão)
│   ├── VCC → 3.3V
│   ├── GND → GND (via resistor 10kΩ)
│   └── ANALOG → GPIO 34 (ADC)
├── PIR HC-SR501
│   ├── VCC → 5V
│   ├── GND → GND
│   └── OUT → GPIO 23
└── LED (opcional)
    ├── ANODO → GPIO 2 (via resistor 330Ω)
    └── CATODO → GND
```

## 🔗 API Reference

### Endpoints Principais

#### `GET /api/atual`
Retorna dados mais recentes dos sensores
```json
{
  "temperatura": 24.5,
  "umidade": 65.2,
  "luminosidade": 1200,
  "movimento": "Detectado",
  "alerta_ar": "OK",
  "alerta_luz": "Ambiente bem iluminado",
  "data_hora": "2024-01-15T10:30:00.000Z"
}
```

#### `GET /api/historico`
Retorna histórico de dados (últimas 100 entradas)
```json
[
  {
    "temperatura": 23.8,
    "luminosidade": 800,
    "data_hora": "2024-01-15T10:25:00.000Z"
  }
]
```

#### `POST /api/gravar`
Recebe dados do ESP32
```json
{
  "temp": 24.5,
  "umid": 65.2,
  "luz": 1200,
  "mov": "Detectado",
  "alertaAr": "OK",
  "alertaLuz": "OK"
}
```

### Documentação Interativa
Acesse `http://localhost:3000/docs` para interface Swagger completa com:
- Modelos de dados detalhados
- Códigos de resposta
- Exemplos interativos
- Teste de endpoints

## 🎓 Contexto Acadêmico

### Objetivo do TCC
Desenvolver sistema IoT para **otimização energética** em ambientes acadêmicos, detectando:
- ❄️ **Ar condicionado** funcionando sem presença
- 💡 **Iluminação** acesa desnecessariamente
- 📊 **Padrões de uso** para tomada de decisões
- 🔋 **Economia de energia** através de alertas automáticos

### Laboratórios Monitorados
- **E100-E107**: Laboratórios Bloco E (UTFPR-CM)
- **E105**: Laboratório piloto com protótipo ativo
- **Futuro**: Expansão para outros blocos

### Tecnologias Demonstradas
- **IoT (Internet das Coisas)**: Comunicação sensor-servidor
- **Sistemas Embarcados**: Programação ESP32
- **Desenvolvimento Web**: Stack moderna React/Next.js
- **Banco de Dados**: PostgreSQL com otimizações
- **APIs RESTful**: Documentação e boas práticas
- **UX/UI Design**: Interface responsiva e acessível

## 📈 Métricas e Alertas

### Tipos de Alerta
1. **Ar Condicionado**: Detectado sem movimento por >20s
2. **Iluminação**: Luzes acesas sem presença detectada
3. **Movimento**: Log de atividade para análise

### Lógica de Detecção
```typescript
// Exemplo da lógica de alertas
if (movimento === "Não detectado" && tempoSemMovimento > 20) {
  if (temperatura < temperaturaIdeal) {
    alert("Ar condicionado funcionando sem presença");
  }
  if (luminosidade > limiteEconomia) {
    alert("Luzes acesas desnecessariamente");
  }
}
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Inicia servidor desenvolvimento
pnpm build        # Build para produção  
pnpm start        # Inicia servidor produção
pnpm lint         # Executa ESLint
pnpm type-check   # Verificação TypeScript

# Backend
cd backend
npm run dev       # Servidor Express development
npm run build     # Build backend
npm start         # Servidor produção
```

## 📋 Roadmap

### ✅ Implementado
- [x] Dashboard multi-laboratório
- [x] Alertas inteligentes temporais
- [x] Interface responsiva completa
- [x] Documentação API Swagger
- [x] Sistema persistência laboratórios
- [x] Gráficos históricos interativos

### 🚧 Em Desenvolvimento
- [ ] Notificações push/email
- [ ] Relatórios automáticos PDF
- [ ] API analytics avançados
- [ ] Mobile app nativo

### 🔮 Futuro
- [ ] Machine Learning para previsões
- [ ] Integração sistemas UTFPR
- [ ] Expansão outros blocos
- [ ] Dashboard administrativo

## 🤝 Contribuições

Este é um projeto acadêmico (TCC), mas sugestões são bem-vindas:

1. **Fork** o projeto
2. **Crie** branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push** para branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** Pull Request

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Arthur Candido**  
🎓 Bacharelando em Ciência da Computação - UTFPR-CM  
📧 Email: [arthurarcelo24@gmail.com]  
🐙 GitHub: [@ArthurCandido](https://github.com/ArthurCandido)  
💼 LinkedIn: [Arthur Candido](https://linkedin.com/in/arthur-candido)

---

<div align="center">

### 🏆 **TCC 2024/2025 - UTFPR Campo Mourão**
*Sistema IoT para Otimização Energética em Ambientes Acadêmicos*

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue)
![ESP32](https://img.shields.io/badge/ESP32-IoT-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

**⭐ Se este projeto te ajudou, deixe uma estrela!**

</div>
