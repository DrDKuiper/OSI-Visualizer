@echo off
REM OSI Visualizer - Script de Teste para Windows
REM Execute como Administrador para funcionar corretamente

echo 🧪 OSI Visualizer - Teste Automatizado (Windows)
echo ===============================================

REM Verificar se está na raiz do projeto
if not exist "README.md" (
    echo ❌ Execute este script na raiz do projeto OSI-Visualizer
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Diretório backend não encontrado
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Diretório frontend não encontrado
    pause
    exit /b 1
)

echo ℹ️  Iniciando testes...

REM 1. Verificar Python
echo.
echo ℹ️  1. Verificando Python...
python --version >nul 2>&1
if %errorlevel% == 0 (
    python --version
    echo ✅ Python encontrado
    set PYTHON_CMD=python
) else (
    python3 --version >nul 2>&1
    if %errorlevel% == 0 (
        python3 --version
        echo ✅ Python3 encontrado
        set PYTHON_CMD=python3
    ) else (
        echo ❌ Python não encontrado. Instale Python 3.8+
        pause
        exit /b 1
    )
)

REM 2. Verificar Node.js
echo.
echo ℹ️  2. Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% == 0 (
    node --version
    echo ✅ Node.js encontrado
) else (
    echo ❌ Node.js não encontrado. Instale Node.js 16+
    pause
    exit /b 1
)

REM 3. Verificar npm
npm --version >nul 2>&1
if %errorlevel% == 0 (
    npm --version
    echo ✅ npm encontrado
) else (
    echo ❌ npm não encontrado
    pause
    exit /b 1
)

REM 4. Testar Backend
echo.
echo ℹ️  3. Testando Backend...
cd backend

if exist "requirements.txt" (
    echo ℹ️  Instalando dependências Python...
    %PYTHON_CMD% -m pip install -r requirements.txt >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Dependências Python instaladas
    ) else (
        echo ⚠️  Erro ao instalar dependências Python
    )
) else (
    echo ❌ requirements.txt não encontrado
)

echo ℹ️  Testando imports Python...
%PYTHON_CMD% -c "import flask, scapy, flask_cors; print('Imports OK')" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Imports Python OK
) else (
    echo ❌ Erro nos imports Python
)

cd ..

REM 5. Testar Frontend
echo.
echo ℹ️  4. Testando Frontend...
cd frontend

if exist "package.json" (
    echo ℹ️  Instalando dependências Node.js...
    npm install >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Dependências Node.js instaladas
    ) else (
        echo ⚠️  Erro ao instalar dependências Node.js
    )
) else (
    echo ❌ package.json não encontrado
)

echo ℹ️  Testando build do frontend...
npm run build >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Build do frontend OK
    if exist "dist" rmdir /s /q dist >nul 2>&1
) else (
    echo ❌ Erro no build do frontend
)

cd ..

REM 6. Verificar portas
echo.
echo ℹ️  5. Verificando portas...
netstat -an | findstr :5000 >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  Porta 5000 já está em uso
) else (
    echo ✅ Porta 5000 disponível
)

netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  Porta 3000 já está em uso
) else (
    echo ✅ Porta 3000 disponível
)

REM 7. Verificar privilégios de administrador
echo.
echo ℹ️  6. Verificando privilégios...
net session >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Executando como Administrador
) else (
    echo ⚠️  NÃO está executando como Administrador
    echo ⚠️  A captura de pacotes pode não funcionar
)

REM 8. Verificar arquivos essenciais
echo.
echo ℹ️  7. Verificando estrutura do projeto...

set files=README.md backend\app.py backend\capture.py backend\requirements.txt frontend\package.json frontend\src\App.js frontend\src\main.jsx frontend\vite.config.js

for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ Arquivo encontrado: %%f
    ) else (
        echo ❌ Arquivo ausente: %%f
    )
)

REM 9. Resumo
echo.
echo 📊 RESUMO DOS TESTES
echo ===================
echo.
echo ℹ️  Para executar manualmente:
echo.
echo Backend (execute como Administrador):
echo   cd backend
echo   %PYTHON_CMD% app.py
echo.
echo Frontend (em outro terminal):
echo   cd frontend
echo   npm run dev
echo.
echo Acesse: http://localhost:3000
echo.
echo ℹ️  Para gerar tráfego de teste:
echo   curl http://httpbin.org/get
echo   ping google.com
echo   nslookup github.com
echo.
echo ✅ Testes automatizados concluídos!
echo ℹ️  Consulte TESTING.md para testes manuais detalhados
echo.
pause
