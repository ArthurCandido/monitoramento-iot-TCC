# 🏠 Monitoramento IoT - TCC

Sistema completo de monitoramento ambiental em tempo real utilizando ESP32 e sensores IoT. 
Apresenta dashboard web responsivo com visualizações ao vivo, análise histórica e alertas 
automáticos para temperatura, umidade, luminosidade e movimento.

## 🔧 Stack Tecnológica

- **Frontend**: Next.js 14, TypeScript, React, TailwindCSS
- **Backend**: Node.js, Express, SQLite
- **Hardware**: ESP32, DHT11, LDR, PIR
- **Comunicação**: HTTP/REST API
- **Visualização**: Recharts, Lucide Icons

## 📊 Funcionalidades

- ✅ **Dashboard em tempo real** - Monitoramento ao vivo dos sensores
- 📈 **Gráficos históricos** - Análise de dados temporais
- 🚨 **Alertas inteligentes** - Notificações automáticas de anomalias
- 📱 **Interface responsiva** - Compatível com mobile e desktop
- 🎨 **Tema escuro/claro** - Interface moderna e personalizável
- 🏠 **Detecção inteligente** - Ar condicionado e luzes sem presença

## 🏗️ Estrutura do Projeto

```
io-t-dashboard-frontend/
├── app/                    # Páginas Next.js (App Router)
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e stores de dados
├── backend/              # Código ESP32 e documentação
├── hooks/                # React Hooks customizados
└── public/               # Arquivos estáticos
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 20.9.0
- npm ou yarn
- ESP32 configurado com sensores

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/ArthurCandido/monitoramento-iot-TCC.git
cd monitoramento-iot-TCC
```

2. **Instale as dependências**
```bash
npm install --legacy-peer-deps
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

### Configuração do ESP32

1. Abra o arquivo `backend/ESP32_code.ino` no Arduino IDE
2. Configure sua rede WiFi:
```cpp
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA";
String serverName = "http://SEU_IP:3000/api/gravar";
```
3. Conecte os sensores conforme o diagrama (veja documentação)
4. Faça o upload para o ESP32

## 🔌 Esquema de Conexões

| Sensor | Pino ESP32 | Função |
|--------|------------|--------|
| DHT11 | GPIO 22 | Temperatura/Umidade |
| LDR | GPIO 34 | Luminosidade (ADC) |
| PIR | GPIO 23 | Movimento (Digital) |
| LED | GPIO 2 | Feedback Visual |

## 📡 API Endpoints

- `GET /api/atual` - Dados atuais dos sensores
- `GET /api/historico` - Dados históricos
- `POST /api/gravar` - Receber dados do ESP32

### Formato dos Dados ESP32
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

## 🎓 Projeto TCC

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia/Tecnologia, demonstrando a aplicação prática de:

- Internet das Coisas (IoT)
- Sistemas embarcados
- Desenvolvimento web moderno
- Análise de dados em tempo real
- Interface homem-máquina

## 📸 Screenshots

![Dashboard](docs/dashboard.png)
*Dashboard principal com dados em tempo real*

![Sensores](docs/sensores.png)
*Visualização detalhada dos sensores*

## 🤝 Contribuição

Sugestões e melhorias são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature
3. Commit suas mudanças
4. Fazer push para a branch
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Arthur Candido**
- GitHub: [@ArthurCandido](https://github.com/ArthurCandido)
- Email: [seu-email@exemplo.com]

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!