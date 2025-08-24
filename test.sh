#!/bin/bash

# OSI Visualizer - Script de Teste Automatizado
# Execute este script para testar o projeto automaticamente

echo "🧪 OSI Visualizer - Teste Automatizado"
echo "====================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Verificar se está na raiz do projeto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Execute este script na raiz do projeto OSI-Visualizer"
    exit 1
fi

print_info "Iniciando testes..."

# 1. Verificar Python
echo ""
print_info "1. Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python encontrado: $PYTHON_VERSION"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    print_success "Python encontrado: $PYTHON_VERSION"
    PYTHON_CMD="python"
else
    print_error "Python não encontrado. Instale Python 3.8+"
    exit 1
fi

# 2. Verificar Node.js
echo ""
print_info "2. Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js encontrado: $NODE_VERSION"
else
    print_error "Node.js não encontrado. Instale Node.js 16+"
    exit 1
fi

# 3. Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm encontrado: $NPM_VERSION"
else
    print_error "npm não encontrado"
    exit 1
fi

# 4. Testar dependências do Backend
echo ""
print_info "3. Testando dependências do Backend..."
cd backend

if [ -f "requirements.txt" ]; then
    print_info "Instalando dependências Python..."
    $PYTHON_CMD -m pip install -r requirements.txt > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Dependências Python instaladas"
    else
        print_warning "Erro ao instalar dependências Python"
    fi
else
    print_error "requirements.txt não encontrado"
fi

# Testar imports
print_info "Testando imports Python..."
$PYTHON_CMD -c "import flask, scapy, flask_cors; print('Imports OK')" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Imports Python OK"
else
    print_error "Erro nos imports Python"
fi

cd ..

# 5. Testar dependências do Frontend
echo ""
print_info "4. Testando dependências do Frontend..."
cd frontend

if [ -f "package.json" ]; then
    print_info "Instalando dependências Node.js..."
    npm install > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Dependências Node.js instaladas"
    else
        print_warning "Erro ao instalar dependências Node.js"
    fi
else
    print_error "package.json não encontrado"
fi

# Testar build
print_info "Testando build do frontend..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Build do frontend OK"
    rm -rf dist 2>/dev/null
else
    print_error "Erro no build do frontend"
fi

cd ..

# 6. Testar servidor backend
echo ""
print_info "5. Testando servidor backend..."

# Verificar se a porta 5000 está livre
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Porta 5000 já está em uso"
else
    print_success "Porta 5000 disponível"
fi

# Iniciar backend em background (precisa de privilégios)
cd backend
print_info "Iniciando backend... (pode pedir privilégios de administrador)"

if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    # Linux/macOS
    sudo $PYTHON_CMD app.py &
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    print_warning "No Windows, execute como Administrador: python app.py"
    $PYTHON_CMD app.py &
else
    print_warning "SO não reconhecido, tentando executar normalmente..."
    $PYTHON_CMD app.py &
fi

BACKEND_PID=$!
sleep 3

# Testar se o backend respondeu
curl -s http://127.0.0.1:5000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Backend está respondendo"
    
    # Testar endpoint de pacotes
    curl -s http://127.0.0.1:5000/api/packets > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Endpoint de pacotes OK"
    else
        print_warning "Endpoint de pacotes com problemas (pode ser permissão)"
    fi
else
    print_error "Backend não está respondendo"
fi

# Parar backend
kill $BACKEND_PID 2>/dev/null
cd ..

# 7. Testar frontend
echo ""
print_info "6. Testando servidor frontend..."
cd frontend

# Verificar se a porta 3000 está livre
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Porta 3000 já está em uso"
else
    print_success "Porta 3000 disponível"
fi

cd ..

# 8. Verificar arquivos essenciais
echo ""
print_info "7. Verificando estrutura do projeto..."

essential_files=(
    "README.md"
    "backend/app.py"
    "backend/capture.py"
    "backend/requirements.txt"
    "frontend/package.json"
    "frontend/src/App.js"
    "frontend/src/main.jsx"
    "frontend/vite.config.js"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Arquivo encontrado: $file"
    else
        print_error "Arquivo ausente: $file"
    fi
done

# 9. Resumo dos testes
echo ""
echo "📊 RESUMO DOS TESTES"
echo "==================="

print_info "Para executar manualmente:"
echo ""
echo "Backend (como administrador):"
echo "  cd backend"
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  sudo python app.py"
else
    echo "  python app.py  # Execute como Administrador"
fi
echo ""
echo "Frontend (em outro terminal):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:3000"

echo ""
print_info "Para gerar tráfego de teste:"
echo "  curl http://httpbin.org/get"
echo "  ping google.com"
echo "  nslookup github.com"

echo ""
print_success "Testes automatizados concluídos!"
print_info "Consulte TESTING.md para testes manuais detalhados"
