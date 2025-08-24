#!/usr/bin/env python3
"""
OSI Visualizer - Script de Teste Python
Testa funcionalidades específicas do backend
"""

import sys
import os
import time
import json
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

def print_colored(text, color='white'):
    colors = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'purple': '\033[95m',
        'cyan': '\033[96m',
        'white': '\033[97m',
        'end': '\033[0m'
    }
    print(f"{colors.get(color, '')}{text}{colors['end']}")

def test_imports():
    """Testa se todas as dependências podem ser importadas"""
    print_colored("🧪 Testando imports...", 'blue')
    
    imports_to_test = [
        'flask',
        'flask_cors', 
        'scapy.all',
        'datetime',
        'threading',
        'logging'
    ]
    
    success_count = 0
    for module in imports_to_test:
        try:
            __import__(module)
            print_colored(f"✅ {module}", 'green')
            success_count += 1
        except ImportError as e:
            print_colored(f"❌ {module}: {e}", 'red')
    
    print_colored(f"Imports: {success_count}/{len(imports_to_test)}", 'cyan')
    return success_count == len(imports_to_test)

def test_scapy_permissions():
    """Testa se o Scapy pode capturar pacotes"""
    print_colored("🔒 Testando permissões do Scapy...", 'blue')
    
    try:
        from scapy.all import sniff
        # Tenta capturar 1 pacote com timeout de 3 segundos
        packets = sniff(count=1, timeout=3)
        if packets:
            print_colored("✅ Scapy pode capturar pacotes", 'green')
            return True
        else:
            print_colored("⚠️  Nenhum pacote capturado (rede inativa?)", 'yellow')
            return True
    except Exception as e:
        print_colored(f"❌ Erro no Scapy: {e}", 'red')
        print_colored("💡 Execute como administrador/sudo", 'yellow')
        return False

def test_flask_server():
    """Testa se o servidor Flask pode iniciar"""
    print_colored("🌐 Testando servidor Flask...", 'blue')
    
    try:
        # Muda para o diretório backend
        backend_dir = Path(__file__).parent / 'backend'
        if not backend_dir.exists():
            print_colored("❌ Diretório backend não encontrado", 'red')
            return False
        
        os.chdir(backend_dir)
        
        # Inicia o servidor em background
        print_colored("🚀 Iniciando servidor...", 'cyan')
        process = subprocess.Popen([
            sys.executable, 'app.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Aguarda o servidor iniciar
        time.sleep(3)
        
        # Testa o health endpoint
        try:
            with urllib.request.urlopen('http://127.0.0.1:5000/api/health', timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get('status') == 'healthy':
                    print_colored("✅ Servidor Flask OK", 'green')
                    result = True
                else:
                    print_colored("❌ Health check falhou", 'red')
                    result = False
        except urllib.error.URLError as e:
            print_colored(f"❌ Servidor não respondeu: {e}", 'red')
            result = False
        except Exception as e:
            print_colored(f"❌ Erro inesperado: {e}", 'red')
            result = False
        
        # Para o servidor
        process.terminate()
        process.wait(timeout=5)
        
        return result
        
    except Exception as e:
        print_colored(f"❌ Erro ao testar servidor: {e}", 'red')
        return False

def test_api_endpoints():
    """Testa os endpoints da API"""
    print_colored("🔌 Testando endpoints da API...", 'blue')
    
    try:
        # Inicia servidor temporário
        backend_dir = Path(__file__).parent / 'backend'
        os.chdir(backend_dir)
        
        process = subprocess.Popen([
            sys.executable, 'app.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        time.sleep(3)
        
        endpoints_to_test = [
            ('/api/health', 'Health check'),
            ('/api/packets', 'Pacotes'),
            ('/api/packets?cache=false', 'Pacotes sem cache'),
            ('/api/packets?count=5', 'Pacotes com limit')
        ]
        
        success_count = 0
        for endpoint, description in endpoints_to_test:
            try:
                url = f'http://127.0.0.1:5000{endpoint}'
                with urllib.request.urlopen(url, timeout=10) as response:
                    if response.status == 200:
                        print_colored(f"✅ {description}: {endpoint}", 'green')
                        success_count += 1
                    else:
                        print_colored(f"❌ {description}: HTTP {response.status}", 'red')
            except Exception as e:
                print_colored(f"❌ {description}: {e}", 'red')
        
        process.terminate()
        process.wait(timeout=5)
        
        print_colored(f"Endpoints: {success_count}/{len(endpoints_to_test)}", 'cyan')
        return success_count == len(endpoints_to_test)
        
    except Exception as e:
        print_colored(f"❌ Erro ao testar endpoints: {e}", 'red')
        return False

def test_packet_analysis():
    """Testa análise de pacotes"""
    print_colored("📊 Testando análise de pacotes...", 'blue')
    
    try:
        # Importa função de análise
        sys.path.append(str(Path(__file__).parent / 'backend'))
        from capture import analyze_osi_layers, packet_to_dict
        
        # Cria um pacote mock para teste
        from scapy.all import IP, TCP, Ether
        
        # Simula um pacote HTTP
        packet = Ether()/IP(src="192.168.1.1", dst="192.168.1.100")/TCP(sport=1234, dport=80)
        
        # Testa análise de camadas
        layers = analyze_osi_layers(packet)
        print_colored(f"✅ Análise de camadas: {layers}", 'green')
        
        # Testa conversão para dict
        packet_dict = packet_to_dict(packet, 1)
        print_colored(f"✅ Conversão para dict: {len(packet_dict)} campos", 'green')
        
        return True
        
    except Exception as e:
        print_colored(f"❌ Erro na análise de pacotes: {e}", 'red')
        return False

def generate_test_traffic():
    """Gera tráfego de rede para teste"""
    print_colored("🚦 Gerando tráfego de teste...", 'blue')
    
    import threading
    
    def make_requests():
        test_urls = [
            'http://httpbin.org/get',
            'https://jsonplaceholder.typicode.com/posts/1',
            'http://httpbin.org/json'
        ]
        
        for url in test_urls:
            try:
                with urllib.request.urlopen(url, timeout=5) as response:
                    print_colored(f"✅ Requisição para {url}", 'green')
            except Exception as e:
                print_colored(f"❌ Erro em {url}: {e}", 'red')
    
    # Executa em thread separada
    thread = threading.Thread(target=make_requests)
    thread.start()
    thread.join(timeout=10)
    
    print_colored("✅ Tráfego de teste gerado", 'green')

def run_all_tests():
    """Executa todos os testes"""
    print_colored("🧪 OSI Visualizer - Testes Python", 'purple')
    print_colored("=" * 40, 'purple')
    
    tests = [
        ("Imports", test_imports),
        ("Permissões Scapy", test_scapy_permissions),
        ("Análise de Pacotes", test_packet_analysis),
        ("Servidor Flask", test_flask_server),
        ("Endpoints API", test_api_endpoints)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print_colored(f"\n📋 {test_name}:", 'cyan')
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_colored(f"❌ Erro no teste {test_name}: {e}", 'red')
            results[test_name] = False
    
    # Resumo
    print_colored("\n📊 RESUMO DOS TESTES:", 'purple')
    print_colored("=" * 20, 'purple')
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        color = 'green' if result else 'red'
        print_colored(f"{test_name}: {status}", color)
    
    print_colored(f"\nResultado: {passed}/{total} testes passaram", 'cyan')
    
    if passed == total:
        print_colored("🎉 Todos os testes passaram!", 'green')
        print_colored("💡 Execute 'python test_traffic.py' para gerar tráfego", 'yellow')
    else:
        print_colored("⚠️  Alguns testes falharam. Verifique as dependências e permissões.", 'yellow')

if __name__ == '__main__':
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print_colored("\n⚠️  Testes interrompidos pelo usuário", 'yellow')
    except Exception as e:
        print_colored(f"\n❌ Erro inesperado: {e}", 'red')
