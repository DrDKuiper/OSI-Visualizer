
# 🌐 OSI Visualizer

Um visualizador interativo do modelo OSI que captura e analisa pacotes de rede em tempo real, proporcionando uma experiência educativa e visual para entender como os dados fluem através das camadas do modelo OSI.

## ✨ Características

- **📊 Visualização em Tempo Real**: Captura e exibe pacotes de rede automaticamente
- **🏗️ Modelo OSI Interativo**: Visualização das 7 camadas com indicadores de atividade
- **🔍 Análise Detalhada**: Informações completas sobre protocolos, endereços e portas
- **🎯 Filtragem Inteligente**: Filtre pacotes por protocolo
- **📱 Design Responsivo**: Interface moderna que funciona em desktop e mobile
- **⚡ Performance Otimizada**: Sistema de cache para melhor performance
- **🎨 Interface Moderna**: Design elegante com gradientes e animações

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **Scapy**: Biblioteca para captura e análise de pacotes
- **Flask-CORS**: Suporte para CORS
- **Python-dotenv**: Gerenciamento de variáveis de ambiente

### Frontend
- **React 18**: Interface de usuário moderna
- **Vite**: Build tool rápido e moderno
- **CSS3**: Estilização avançada com gradientes e animações
- **ES6+**: JavaScript moderno

## 📋 Pré-requisitos

- **Python 3.8+**: Para executar o backend
- **Node.js 16+**: Para o desenvolvimento frontend
- **npm ou yarn**: Gerenciador de pacotes
- **Privilégios de administrador**: Necessário para captura de pacotes de rede

## 🚀 Instalação e Configuração

### 📂 Backend Setup

1. **Navegue até o diretório backend:**
   ```bash
   cd backend
   ```

2. **Crie um ambiente virtual (recomendado):**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente (opcional):**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

5. **Execute o servidor Flask:**
   ```bash
   python app.py
   ```
   
   O backend estará rodando em `http://127.0.0.1:5000`

### 🎨 Frontend Setup

1. **Navegue até o diretório frontend:**
   ```bash
   cd frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   
   O frontend estará disponível em `http://localhost:3000`

## 📖 Como Usar

1. **Acesse a aplicação** em `http://localhost:3000`
2. **Aguarde a captura automática** de pacotes da rede
3. **Clique em um pacote** na tabela para ver as camadas OSI ativas
4. **Use os controles** para:
   - Pausar/continuar a atualização automática
   - Ajustar o intervalo de refresh
   - Filtrar pacotes por protocolo
   - Ordenar por diferentes critérios

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (Backend)

```env
DEBUG=True                # Modo debug do Flask
PORT=5000                # Porta do servidor
PACKET_COUNT=10          # Número de pacotes por captura
CACHE_TIMEOUT=30         # Timeout do cache em segundos
```

### Personalização do Frontend

- **Intervalo de refresh**: Configurável na interface (2s, 5s, 10s, 30s)
- **Tema**: Modifique `src/styles.css` para personalizar cores e layout
- **Protocolos**: Adicione novos protocolos em `LayerView.js`

## 🏗️ Arquitetura

```
OSI-Visualizer/
├── backend/                 # API Flask
│   ├── app.py              # Servidor principal
│   ├── capture.py          # Lógica de captura de pacotes
│   ├── requirements.txt    # Dependências Python
│   └── .env.example       # Configurações de exemplo
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.js        # Componente principal
│   │   ├── main.jsx      # Ponto de entrada
│   │   └── styles.css    # Estilos CSS
│   ├── public/           # Arquivos estáticos
│   ├── package.json      # Configuração npm
│   └── vite.config.js    # Configuração Vite
└── README.md            # Este arquivo
```

## 🔍 API Endpoints

### `GET /api/packets`
Retorna lista de pacotes capturados

**Parâmetros de consulta:**
- `cache`: `true|false` - Usar cache (padrão: true)
- `count`: `number` - Número de pacotes (padrão: 10)

**Resposta:**
```json
{
  "packets": [...],
  "count": 10,
  "timestamp": "2025-01-01T12:00:00"
}
```

### `GET /api/health`
Health check do serviço

## 🚨 Solução de Problemas

### Erro de Permissão na Captura de Pacotes
```bash
# Linux/macOS - Execute como sudo
sudo python app.py

# Windows - Execute como Administrador
```

### Porta 5000 em Uso
```bash
# Mude a porta no .env
PORT=5001
```

### Problemas de CORS
- Verifique se o Flask-CORS está instalado
- Confirme a configuração do proxy no Vite

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] **Histórico de Pacotes**: Armazenamento persistente
- [ ] **Exportação**: Export para CSV/JSON
- [ ] **Filtros Avançados**: Por IP, porta, tempo
- [ ] **Estatísticas**: Gráficos de tráfego
- [ ] **Modo Dark**: Tema escuro
- [ ] **WebSocket**: Updates em tempo real
- [ ] **Docker**: Containerização

## ⚠️ Avisos Importantes

- **Privilégios**: A captura de pacotes requer privilégios administrativos
- **Rede**: O aplicativo captura pacotes da interface de rede ativa
- **Performance**: Muitos pacotes podem afetar a performance
- **Privacidade**: Use apenas em redes próprias ou com permissão

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Inspirado por ferramentas de visualização de rede educacionais
- Baseado no modelo OSI da ISO
- Construído com React e Flask
- Ícones e emojis para melhor experiência visual

---

**Desenvolvido com ❤️ para educação em redes de computadores**
