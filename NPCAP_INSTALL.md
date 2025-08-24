# 🔧 Solução para Captura de Pacotes no Windows

## ❌ Problema Identificado

```
ERROR: Sniffing and sending packets is not available at layer 2: winpcap is not installed
```

## 💡 Solução: Instalar Npcap

### Opção 1: Download Manual (Recomendado)
1. **Acesse:** https://npcap.com/#download
2. **Baixe:** Npcap (versão mais recente)
3. **Execute como Administrador**
4. **Durante a instalação:**
   - ✅ Marque "Install Npcap in WinPcap API-compatible Mode"
   - ✅ Marque "Support raw 802.11 traffic"

### Opção 2: Via Chocolatey
```powershell
# Execute como Administrador
choco install npcap
```

### Opção 3: Via Winget
```powershell
# Execute como Administrador  
winget install Insecure.Npcap
```

## 🔄 Após a Instalação

1. **Reinicie o computador** (importante!)
2. **Reinicie o backend:**
   ```powershell
   cd backend
   python app.py
   ```
3. **Teste a captura:**
   ```powershell
   Invoke-WebRequest http://127.0.0.1:5000/api/packets
   ```

## ✅ Verificação

Se tudo estiver funcionando, você verá pacotes sendo capturados:
```json
{
  "packets": [...],
  "count": 10,
  "timestamp": "..."
}
```

## 🚀 Status Atual

- ✅ **Backend**: Rodando em http://127.0.0.1:5000
- ✅ **Frontend**: Rodando em http://localhost:3000  
- ⚠️ **Captura de Pacotes**: Precisa do Npcap

## 🎯 Próximos Passos

1. Instale o Npcap
2. Reinicie o sistema
3. Reinicie o backend
4. Acesse http://localhost:3000
5. Gere tráfego de rede para ver pacotes

---

**💡 Dica**: Após instalar o Npcap, execute `python test_traffic.py` para gerar tráfego de teste!
