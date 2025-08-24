# 🧪 Guia de Testes - OSI Visualizer

Este guia fornece instruções completas para testar o OSI Visualizer em diferentes cenários.

## 📋 Pré-requisitos para Testes

### Sistema Operacional
- **Windows**: Execute como Administrador
- **Linux/macOS**: Execute com `sudo` para captura de pacotes
- **Python 3.8+** instalado
- **Node.js 16+** instalado

### Dependências
```bash
# Backend
pip install -r backend/requirements.txt

# Frontend  
cd frontend && npm install
```

## 🚀 Testes Básicos

### 1. Teste de Instalação

**Backend:**
```bash
cd backend
python -c "import scapy; import flask; print('✅ Dependências OK')"
```

**Frontend:**
```bash
cd frontend
npm run build
echo "✅ Build OK"
```

### 2. Teste de Servidor

**Inicie o Backend:**
```bash
cd backend

# Windows (como Administrador)
python app.py

# Linux/macOS
sudo python app.py
```

**Teste a API:**
```bash
# Em outro terminal
curl http://127.0.0.1:5000/api/health
# Deve retornar: {"status":"healthy","service":"osi-visualizer-backend"}

curl http://127.0.0.1:5000/api/packets
# Deve retornar JSON com pacotes
```

**Inicie o Frontend:**
```bash
cd frontend
npm run dev
# Acesse: http://localhost:3000
```

## 🔍 Testes Funcionais

### 3. Teste de Captura de Pacotes

1. **Abra o navegador** em `http://localhost:3000`
2. **Verifique se aparecem pacotes** na tabela
3. **Teste os controles:**
   - Clique em "🔄 Atualizar"
   - Pause/inicie o auto-refresh
   - Mude o intervalo de atualização

### 4. Teste de Interatividade

1. **Clique em um pacote** na tabela
2. **Verifique as camadas OSI** destacadas
3. **Teste o filtro** digitando um protocolo (ex: "TCP", "HTTP")
4. **Teste a ordenação** clicando nos cabeçalhos da tabela

### 5. Geração de Tráfego para Testes

**Gere tráfego HTTP:**
```bash
# Em um terminal separado
curl http://httpbin.org/get
curl https://jsonplaceholder.typicode.com/posts/1
ping google.com -c 5
```

**Gere tráfego DNS:**
```bash
nslookup google.com
nslookup github.com
```

## 🌐 Testes de Rede

### 6. Teste com Diferentes Protocolos

**HTTP/HTTPS:**
```bash
curl http://example.com
curl https://httpbin.org/json
```

**FTP (se disponível):**
```bash
ftp ftp.dlptest.com
# user: dlpuser@dlptest.com
# password: rNrKYTX9g7z3RgJRmxWuGHbeu
```

**SSH:**
```bash
ssh -T git@github.com
```

### 7. Teste de Performance

**Gere múltiplas requisições:**
```bash
# Bash/PowerShell
for i in {1..10}; do curl http://httpbin.org/get & done
```

**Monitore a interface:**
1. Observe se a tabela atualiza
2. Verifique se as camadas OSI respondem
3. Teste com diferentes intervalos de refresh

## 📱 Testes de Interface

### 8. Teste Responsivo

1. **Desktop**: Redimensione a janela
2. **Mobile**: Use DevTools para simular dispositivos móveis
3. **Tablet**: Teste em resoluções intermediárias

**Pontos de verificação:**
- Layout se adapta corretamente
- Botões são acessíveis
- Tabela rola horizontalmente em telas pequenas
- Camadas OSI se reorganizam

### 9. Teste de Estados

**Estado de Loading:**
1. Recarregue a página
2. Verifique o spinner de carregamento

**Estado de Erro:**
1. Pare o backend
2. Verifique a mensagem de erro
3. Teste o botão "Tentar Novamente"

**Estado Vazio:**
1. Configure para capturar 0 pacotes
2. Verifique a mensagem de "Nenhum pacote"

## 🔧 Testes de Configuração

### 10. Teste de Variáveis de Ambiente

**Crie um arquivo `.env` no backend:**
```env
DEBUG=False
PORT=5001
PACKET_COUNT=5
CACHE_TIMEOUT=60
```

**Teste com diferentes configurações:**
```bash
PORT=5001 python app.py
```

### 11. Teste de Cache

1. **Capture pacotes** com cache habilitado
2. **Desabilite o cache** (`?cache=false`)
3. **Compare os tempos** de resposta

## 🚨 Testes de Erro

### 12. Cenários de Erro

**Sem privilégios:**
```bash
# Execute sem sudo/admin
python backend/app.py
# Deve mostrar erro de permissão
```

**Porta ocupada:**
```bash
# Execute duas instâncias
python app.py  # Primeira instância
python app.py  # Segunda deve falhar
```

**Interface de rede indisponível:**
- Desconecte da rede
- Verifique como o app se comporta

## 📊 Testes de Análise

### 13. Verificação de Protocolos

**Teste protocolos específicos:**
1. Abra diferentes sites (HTTP/HTTPS)
2. Use diferentes aplicações (SSH, FTP, DNS)
3. Verifique se são detectados corretamente

**Verificação de camadas OSI:**
- **Camada 1**: Sempre ativa (Física)
- **Camada 2**: Ethernet detectado
- **Camada 3**: IP/ARP mostrados
- **Camada 4**: TCP/UDP/ICMP identificados
- **Camada 7**: HTTP/HTTPS/SSH/DNS reconhecidos

## 🔍 Debugging

### 14. Logs e Debugging

**Backend logs:**
```bash
# Verifique os logs no terminal do backend
tail -f backend.log  # se configurado
```

**Frontend debugging:**
```javascript
// No DevTools do navegador
console.log(packets);  // Verifique os dados
```

**Network tab:**
- Abra DevTools → Network
- Monitore chamadas para `/api/packets`
- Verifique tempos de resposta

## ✅ Checklist de Testes

### Funcionalidade Básica
- [ ] Backend inicia sem erros
- [ ] Frontend carrega corretamente
- [ ] API responde em `/api/health`
- [ ] Pacotes são capturados
- [ ] Interface atualiza automaticamente

### Interatividade
- [ ] Seleção de pacotes funciona
- [ ] Camadas OSI destacam corretamente
- [ ] Filtros funcionam
- [ ] Ordenação funciona
- [ ] Controles de refresh funcionam

### Interface
- [ ] Design responsivo
- [ ] Estados de loading/erro
- [ ] Animações suaves
- [ ] Cores e badges corretos

### Performance
- [ ] App responde rapidamente
- [ ] Cache funciona
- [ ] Sem vazamentos de memória
- [ ] Interface não trava

## 🎯 Testes Avançados

### 15. Teste de Stress

**Gere muito tráfego:**
```bash
# Use ferramentas como wget, curl em loop
while true; do curl http://httpbin.org/get; sleep 0.1; done
```

**Monitore:**
- Uso de CPU/RAM
- Responsividade da interface
- Precisão na captura

### 16. Teste Cross-browser

**Teste em diferentes navegadores:**
- Chrome/Chromium
- Firefox
- Safari (macOS)
- Edge (Windows)

## 🐛 Problemas Comuns

### Soluções para Erros Típicos

**"Permission denied" na captura:**
```bash
# Linux/macOS
sudo python app.py

# Windows
# Execute PowerShell como Administrador
```

**"Port already in use":**
```bash
# Mude a porta
PORT=5001 python app.py
```

**Frontend não conecta ao backend:**
- Verifique se o backend está rodando
- Confirme a configuração do proxy no Vite
- Teste a URL da API diretamente

**Pacotes não aparecem:**
- Gere tráfego manualmente
- Verifique permissões
- Teste em rede ativa

## 📝 Relatório de Testes

Após os testes, documente:

**✅ Funciona:**
- Lista do que está funcionando

**❌ Problemas encontrados:**
- Descrição dos bugs
- Passos para reproduzir
- Comportamento esperado vs atual

**🔧 Melhorias sugeridas:**
- Funcionalidades adicionais
- Otimizações de performance
- Melhorias na interface

---

**💡 Dica**: Execute os testes em ordem e documente os resultados para um relatório completo!
