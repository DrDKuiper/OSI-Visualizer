@echo off
echo 🌐 OSI Visualizer - Abrindo no Navegador
echo ========================================

echo ℹ️  Verificando serviços...

REM Verificar se o backend está rodando
curl -s http://127.0.0.1:5000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend OK - http://127.0.0.1:5000
) else (
    echo ❌ Backend não está rodando
    echo 💡 Execute: cd backend && python app.py
)

REM Verificar se o frontend está rodando
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend OK - http://localhost:3000
) else (
    echo ❌ Frontend não está rodando
    echo 💡 Execute: cd frontend && npm run dev
)

echo.
echo 🚀 Abrindo OSI Visualizer...
start http://localhost:3000

echo.
echo 📋 URLs importantes:
echo   Frontend: http://localhost:3000
echo   Backend:  http://127.0.0.1:5000
echo   API:      http://127.0.0.1:5000/api/packets
echo.
echo 💡 Para gerar tráfego de teste: python test_traffic.py
echo.
pause
