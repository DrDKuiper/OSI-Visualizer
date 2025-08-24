# 🛠️ Guia de Solução - Problemas com Python/pip no Windows

## ❌ Problema Identificado

Você está enfrentando o erro: `pip não é reconhecido` e `No module named pip`

Isso indica que:
1. O Python está instalado mas incompleto
2. O pip não foi instalado junto
3. Há problemas na configuração do PATH

## 🔧 Soluções (em ordem de preferência)

### Solução 1: Reinstalar Python (Recomendado)

1. **Baixe o Python oficial:**
   - Acesse: https://www.python.org/downloads/
   - Baixe a versão mais recente (3.11+ recomendado)

2. **Durante a instalação:**
   - ✅ Marque "Add Python to PATH"
   - ✅ Marque "Install pip"
   - ✅ Escolha "Install for all users" (se for administrador)

3. **Após a instalação:**
   ```powershell
   # Feche e reabra o PowerShell
   python --version
   pip --version
   ```

### Solução 2: Instalar pip manualmente

1. **Baixe get-pip.py:**
   ```powershell
   # Navegue até uma pasta temporária
   cd C:\temp
   
   # Baixe o instalador do pip
   Invoke-WebRequest https://bootstrap.pypa.io/get-pip.py -OutFile get-pip.py
   
   # Instale o pip
   python get-pip.py
   ```

2. **Adicione ao PATH:**
   ```powershell
   # Adicione o diretório Scripts do Python ao PATH
   $env:PATH += ";C:\Python313\Scripts"
   ```

### Solução 3: Usar Microsoft Store

1. **Abra a Microsoft Store**
2. **Busque por "Python"**
3. **Instale o Python 3.11 ou superior**
4. **Teste no PowerShell:**
   ```powershell
   python --version
   pip --version
   ```

### Solução 4: Usar py launcher

1. **Teste se o py está disponível:**
   ```powershell
   py --version
   py -m pip --version
   ```

2. **Se funcionar, use assim:**
   ```powershell
   py -m pip install flask
   py -m pip install -r requirements.txt
   ```

## 🚀 Script de Instalação Automática

Execute o script `fix_python.ps1` que criei para você:

```powershell
# Execute como Administrador
.\fix_python.ps1
```

## ✅ Verificação Final

Após qualquer solução, teste:

```powershell
# Feche e reabra o PowerShell/VS Code
python --version
pip --version
pip list
```

## 📋 Próximos Passos

Quando o pip estiver funcionando:

```powershell
# 1. Navegue até o backend
cd backend

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Teste o backend
python app.py
```

## 🆘 Se nada funcionar

1. **Desinstale todas as versões do Python**
2. **Reinicie o computador**
3. **Instale o Python novamente** marcando as opções corretas
4. **Execute o VS Code como Administrador**

## 💡 Dicas Importantes

- **Sempre execute como Administrador** quando houver problemas de instalação
- **Feche e reabra o terminal** após mudanças no PATH
- **Use py em vez de python** se disponível
- **Verifique antivírus** que pode bloquear instalações

---

**Problema resolvido?** Continue com o teste do OSI Visualizer! 🎉
