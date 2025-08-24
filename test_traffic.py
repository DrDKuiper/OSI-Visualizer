#!/usr/bin/env python3
"""
OSI Visualizer - Gerador de Tráfego para Testes
Gera diferentes tipos de tráfego de rede para testar o visualizador
"""

import time
import threading
import subprocess
import urllib.request
import urllib.error
import socket
import random
import sys
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

class TrafficGenerator:
    def __init__(self):
        self.running = False
        self.threads = []
    
    def start(self):
        """Inicia a geração de tráfego"""
        self.running = True
        print_colored("🚦 Iniciando geração de tráfego...", 'blue')
        
        # Diferentes tipos de tráfego
        traffic_types = [
            ("HTTP Requests", self.generate_http_traffic),
            ("HTTPS Requests", self.generate_https_traffic),
            ("DNS Queries", self.generate_dns_traffic),
            ("ICMP Pings", self.generate_icmp_traffic),
        ]
        
        for name, func in traffic_types:
            thread = threading.Thread(target=func, name=name, daemon=True)
            thread.start()
            self.threads.append(thread)
            print_colored(f"✅ {name} iniciado", 'green')
    
    def stop(self):
        """Para a geração de tráfego"""
        self.running = False
        print_colored("⏹️  Parando geração de tráfego...", 'yellow')
    
    def generate_http_traffic(self):
        """Gera tráfego HTTP"""
        http_urls = [
            'http://httpbin.org/get',
            'http://httpbin.org/json',
            'http://httpbin.org/user-agent',
            'http://httpbin.org/headers',
            'http://example.com',
            'http://httpbin.org/status/200',
            'http://httpbin.org/delay/1'
        ]
        
        while self.running:
            try:
                url = random.choice(http_urls)
                req = urllib.request.Request(url)
                req.add_header('User-Agent', 'OSI-Visualizer-Test/1.0')
                
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = response.read()
                    print_colored(f"📡 HTTP: {url} ({len(data)} bytes)", 'cyan')
                
                time.sleep(random.uniform(2, 5))
                
            except Exception as e:
                print_colored(f"❌ HTTP Error: {e}", 'red')
                time.sleep(3)
    
    def generate_https_traffic(self):
        """Gera tráfego HTTPS"""
        https_urls = [
            'https://httpbin.org/get',
            'https://jsonplaceholder.typicode.com/posts/1',
            'https://api.github.com/zen',
            'https://httpbin.org/json',
            'https://www.google.com',
            'https://httpbin.org/uuid'
        ]
        
        while self.running:
            try:
                url = random.choice(https_urls)
                req = urllib.request.Request(url)
                req.add_header('User-Agent', 'OSI-Visualizer-Test/1.0')
                
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = response.read()
                    print_colored(f"🔒 HTTPS: {url} ({len(data)} bytes)", 'green')
                
                time.sleep(random.uniform(3, 7))
                
            except Exception as e:
                print_colored(f"❌ HTTPS Error: {e}", 'red')
                time.sleep(5)
    
    def generate_dns_traffic(self):
        """Gera consultas DNS"""
        domains = [
            'google.com',
            'github.com',
            'stackoverflow.com',
            'python.org',
            'example.com',
            'httpbin.org',
            'jsonplaceholder.typicode.com'
        ]
        
        while self.running:
            try:
                domain = random.choice(domains)
                # Resolve DNS
                ip = socket.gethostbyname(domain)
                print_colored(f"🔍 DNS: {domain} -> {ip}", 'yellow')
                
                time.sleep(random.uniform(5, 10))
                
            except Exception as e:
                print_colored(f"❌ DNS Error: {e}", 'red')
                time.sleep(8)
    
    def generate_icmp_traffic(self):
        """Gera tráfego ICMP (ping)"""
        hosts = [
            'google.com',
            '8.8.8.8',
            'github.com',
            '1.1.1.1'
        ]
        
        while self.running:
            try:
                host = random.choice(hosts)
                
                # Ping command varies by OS
                if sys.platform.startswith('win'):
                    cmd = ['ping', '-n', '1', host]
                else:
                    cmd = ['ping', '-c', '1', host]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    print_colored(f"🏓 PING: {host} - OK", 'purple')
                else:
                    print_colored(f"🏓 PING: {host} - Failed", 'red')
                
                time.sleep(random.uniform(8, 15))
                
            except Exception as e:
                print_colored(f"❌ PING Error: {e}", 'red')
                time.sleep(10)

def main():
    print_colored("🌐 OSI Visualizer - Gerador de Tráfego", 'purple')
    print_colored("=" * 40, 'purple')
    print_colored("Este script gera tráfego de rede para testar o visualizador", 'cyan')
    print_colored("Pressione Ctrl+C para parar\n", 'yellow')
    
    generator = TrafficGenerator()
    
    try:
        generator.start()
        
        print_colored("\n📊 Tráfego sendo gerado...", 'blue')
        print_colored("💡 Abra o OSI Visualizer em http://localhost:3000", 'cyan')
        print_colored("💡 Execute o backend com: cd backend && python app.py", 'cyan')
        
        # Mantém o programa rodando
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        generator.stop()
        print_colored("\n✅ Geração de tráfego interrompida", 'yellow')
        print_colored("Aguardando threads terminarem...", 'yellow')
        
        # Aguarda threads terminarem
        for thread in generator.threads:
            thread.join(timeout=2)
        
        print_colored("🎯 Finalizado!", 'green')

if __name__ == '__main__':
    main()
