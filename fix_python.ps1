# OSI Visualizer - Script de Correção Python/pip para Windows
# Execute como Administrador

param(
    [switch]$Force,
    [string]$PythonVersion = "3.11"
)

Write-Host "🛠️  OSI Visualizer - Correção Python/pip" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Função para escrever com cores
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Blue }

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Warning "Este script deve ser executado como Administrador"
    Write-Info "Clique com botão direito no PowerShell e escolha 'Executar como Administrador'"
    Read-Host "Pressione Enter para continuar mesmo assim ou Ctrl+C para sair"
}

Write-Info "Iniciando diagnóstico..."

# 1. Verificar instalações existentes do Python
Write-Info "1. Verificando instalações do Python..."

$pythonPaths = @()
$pythonCommands = @("python", "python3", "py")

foreach ($cmd in $pythonCommands) {
    try {
        $version = & $cmd --version 2>$null
        if ($version) {
            $path = & $cmd -c "import sys; print(sys.executable)" 2>$null
            $pythonPaths += @{Command=$cmd; Version=$version; Path=$path}
            Write-Success "$cmd encontrado: $version em $path"
        }
    }
    catch {
        Write-Warning "$cmd não encontrado"
    }
}

# 2. Verificar pip
Write-Info "2. Verificando pip..."

$pipWorking = $false
foreach ($py in $pythonPaths) {
    $cmd = $py.Command
    try {
        $pipVersion = & $cmd -m pip --version 2>$null
        if ($pipVersion) {
            Write-Success "pip funciona com $cmd`: $pipVersion"
            $pipWorking = $true
            $workingPython = $cmd
            break
        }
    }
    catch {
        Write-Warning "pip não funciona com $cmd"
    }
}

# 3. Se pip não funciona, tentar instalar
if (-not $pipWorking) {
    Write-Warning "pip não está funcionando. Tentando corrigir..."
    
    # Tentar baixar get-pip.py
    Write-Info "Baixando get-pip.py..."
    try {
        $tempDir = $env:TEMP
        $getPipPath = Join-Path $tempDir "get-pip.py"
        
        Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $getPipPath
        Write-Success "get-pip.py baixado"
        
        # Tentar instalar pip com cada versão do Python
        foreach ($py in $pythonPaths) {
            $cmd = $py.Command
            Write-Info "Tentando instalar pip com $cmd..."
            try {
                & $cmd $getPipPath
                $pipVersion = & $cmd -m pip --version 2>$null
                if ($pipVersion) {
                    Write-Success "pip instalado com sucesso usando $cmd"
                    $pipWorking = $true
                    $workingPython = $cmd
                    break
                }
            }
            catch {
                Write-Warning "Falha ao instalar pip com $cmd"
            }
        }
        
        # Limpar arquivo temporário
        Remove-Item $getPipPath -ErrorAction SilentlyContinue
    }
    catch {
        Write-Error "Erro ao baixar get-pip.py: $_"
    }
}

# 4. Se ainda não funciona, sugerir instalação do Python
if (-not $pipWorking) {
    Write-Error "Não foi possível corrigir o pip"
    Write-Info "Soluções recomendadas:"
    Write-Host "  1. Reinstalar Python de https://python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  2. Marcar 'Add Python to PATH' durante instalação" -ForegroundColor Yellow
    Write-Host "  3. Marcar 'Install pip' durante instalação" -ForegroundColor Yellow
    Write-Host "  4. Instalar Python da Microsoft Store" -ForegroundColor Yellow
    
    # Oferecer para abrir o site
    $openSite = Read-Host "Deseja abrir o site do Python? (y/n)"
    if ($openSite -eq "y" -or $openSite -eq "Y") {
        Start-Process "https://www.python.org/downloads/"
    }
    
    exit 1
}

# 5. Instalar dependências do projeto
Write-Info "3. Instalando dependências do OSI Visualizer..."

$backendPath = Join-Path (Get-Location) "backend"
$requirementsPath = Join-Path $backendPath "requirements.txt"

if (Test-Path $requirementsPath) {
    Write-Info "Instalando dependências do backend..."
    try {
        Set-Location $backendPath
        & $workingPython -m pip install -r requirements.txt
        Write-Success "Dependências instaladas com sucesso"
    }
    catch {
        Write-Error "Erro ao instalar dependências: $_"
    }
    finally {
        Set-Location ..
    }
}
else {
    Write-Warning "requirements.txt não encontrado em $requirementsPath"
}

# 6. Verificar Node.js
Write-Info "4. Verificando Node.js..."

try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if ($nodeVersion -and $npmVersion) {
        Write-Success "Node.js: $nodeVersion"
        Write-Success "npm: $npmVersion"
        
        # Instalar dependências do frontend
        $frontendPath = Join-Path (Get-Location) "frontend"
        $packageJsonPath = Join-Path $frontendPath "package.json"
        
        if (Test-Path $packageJsonPath) {
            Write-Info "Instalando dependências do frontend..."
            try {
                Set-Location $frontendPath
                npm install
                Write-Success "Dependências do frontend instaladas"
            }
            catch {
                Write-Error "Erro ao instalar dependências do frontend: $_"
            }
            finally {
                Set-Location ..
            }
        }
    }
    else {
        Write-Warning "Node.js não encontrado"
        Write-Info "Baixe em: https://nodejs.org/"
    }
}
catch {
    Write-Warning "Node.js não encontrado"
    Write-Info "Baixe em: https://nodejs.org/"
}

# 7. Teste final
Write-Info "5. Teste final..."

Write-Host "`n📊 RESUMO:" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan

if ($pipWorking) {
    Write-Success "Python/pip funcionando: $workingPython"
    
    Write-Host "`n🚀 Para executar o projeto:" -ForegroundColor Green
    Write-Host "Backend (como Administrador):" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  $workingPython app.py" -ForegroundColor White
    Write-Host "`nFrontend (outro terminal):" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host "`nAcesse: http://localhost:3000" -ForegroundColor Cyan
}
else {
    Write-Error "Problemas não resolvidos. Consulte TROUBLESHOOTING.md"
}

Write-Host "`n✅ Script concluído!" -ForegroundColor Green
Read-Host "Pressione Enter para finalizar"
