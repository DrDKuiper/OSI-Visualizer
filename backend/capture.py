import threading
from scapy.all import sniff, IP, TCP, UDP, ICMP, ARP, Raw, DNS, DHCP
import time
from datetime import datetime
import logging
import socket
import requests
import json
import ipaddress
import hashlib
import base64


def make_json_serializable(obj):
    """Recursively convert objects to JSON-serializable structures."""
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [make_json_serializable(v) for v in obj]
    return str(obj)

def dns_lookup(ip_address):
    """Perform reverse DNS lookup for an IP address."""
    try:
        hostname = socket.gethostbyaddr(ip_address)[0]
        return hostname
    except (socket.herror, socket.gaierror):
        return None

def get_ip_info(ip_address):
    """Get geolocation and ISP information for an IP address."""
    try:
        # Using ip-api.com for geolocation (free tier)
        response = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=2)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                return {
                    'country': data.get('country'),
                    'region': data.get('regionName'),
                    'city': data.get('city'),
                    'isp': data.get('isp'),
                    'org': data.get('org'),
                    'timezone': data.get('timezone')
                }
    except (requests.RequestException, json.JSONDecodeError):
        pass
    return None

def is_private_ip(ip):
    """Check if IP is private/local."""
    try:
        ip_obj = ipaddress.ip_address(ip)
        return ip_obj.is_private
    except:
        return False

def analyze_tcp_flags(flags):
    """Analyze TCP flags and return detailed information."""
    flag_map = {
        'F': 'FIN', 'S': 'SYN', 'R': 'RST', 'P': 'PSH',
        'A': 'ACK', 'U': 'URG', 'E': 'ECE', 'C': 'CWR'
    }
    
    flag_info = {
        'raw': str(flags),
        'flags': [],
        'connection_state': 'unknown',
        'security_concern': False
    }
    
    for flag_char, flag_name in flag_map.items():
        if flag_char in str(flags):
            flag_info['flags'].append(flag_name)
    
    # Determine connection state
    if 'SYN' in flag_info['flags'] and 'ACK' not in flag_info['flags']:
        flag_info['connection_state'] = 'connection_initiation'
    elif 'SYN' in flag_info['flags'] and 'ACK' in flag_info['flags']:
        flag_info['connection_state'] = 'connection_response'
    elif 'ACK' in flag_info['flags'] and len(flag_info['flags']) == 1:
        flag_info['connection_state'] = 'established'
    elif 'FIN' in flag_info['flags']:
        flag_info['connection_state'] = 'connection_termination'
    elif 'RST' in flag_info['flags']:
        flag_info['connection_state'] = 'connection_reset'
        flag_info['security_concern'] = True
    
    return flag_info

def detect_protocol_details(packet):
    """Detect detailed protocol information and potential security issues."""
    details = {
        'protocol_stack': [],
        'application_protocol': None,
        'encryption_status': 'unknown',
        'security_indicators': [],
        'payload_info': {},
        'network_behavior': []
    }
    
    # Build protocol stack
    if packet.haslayer('Ether'):
        details['protocol_stack'].append('Ethernet')
    if packet.haslayer(IP):
        details['protocol_stack'].append(f"IPv{packet[IP].version}")
    if packet.haslayer(TCP):
        details['protocol_stack'].append('TCP')
    elif packet.haslayer(UDP):
        details['protocol_stack'].append('UDP')
    elif packet.haslayer(ICMP):
        details['protocol_stack'].append('ICMP')
    
    # Analyze application layer
    if packet.haslayer(TCP):
        port = packet[TCP].dport
        sport = packet[TCP].sport
        
        if port == 443 or sport == 443:
            details['application_protocol'] = 'HTTPS'
            details['encryption_status'] = 'encrypted'
        elif port == 80 or sport == 80:
            details['application_protocol'] = 'HTTP'
            details['encryption_status'] = 'plaintext'
            details['security_indicators'].append('unencrypted_web_traffic')
        elif port == 22 or sport == 22:
            details['application_protocol'] = 'SSH'
            details['encryption_status'] = 'encrypted'
        elif port == 21 or sport == 21:
            details['application_protocol'] = 'FTP'
            details['encryption_status'] = 'plaintext'
            details['security_indicators'].append('insecure_file_transfer')
        elif port == 23 or sport == 23:
            details['application_protocol'] = 'Telnet'
            details['encryption_status'] = 'plaintext'
            details['security_indicators'].append('insecure_terminal_access')
        elif port == 25 or sport == 25:
            details['application_protocol'] = 'SMTP'
            details['encryption_status'] = 'potentially_plaintext'
        elif port == 53 or sport == 53:
            details['application_protocol'] = 'DNS'
        elif port in [993, 995] or sport in [993, 995]:
            details['application_protocol'] = 'Secure Email'
            details['encryption_status'] = 'encrypted'
        elif port in [3389] or sport in [3389]:
            details['application_protocol'] = 'RDP'
            details['security_indicators'].append('remote_desktop_access')
    
    elif packet.haslayer(UDP):
        port = packet[UDP].dport
        sport = packet[UDP].sport
        
        if port == 53 or sport == 53:
            details['application_protocol'] = 'DNS'
        elif port in [67, 68] or sport in [67, 68]:
            details['application_protocol'] = 'DHCP'
        elif port == 123 or sport == 123:
            details['application_protocol'] = 'NTP'
        elif port == 161 or sport == 161:
            details['application_protocol'] = 'SNMP'
    
    # Analyze payload
    if packet.haslayer(Raw):
        payload = packet[Raw].load
        details['payload_info'] = {
            'size': len(payload),
            'entropy': calculate_entropy(payload),
            'contains_strings': has_readable_strings(payload)
        }
        
        # Check for suspicious patterns
        if details['payload_info']['entropy'] > 7.5:
            details['security_indicators'].append('high_entropy_payload')
    
    return details

def calculate_entropy(data):
    """Calculate Shannon entropy of data."""
    if not data:
        return 0
    
    entropy = 0
    for x in range(256):
        p_x = float(data.count(bytes([x]))) / len(data)
        if p_x > 0:
            entropy += - p_x * (p_x.bit_length() - 1)
    return entropy

def has_readable_strings(data, min_length=4):
    """Check if payload contains readable strings."""
    try:
        text = data.decode('utf-8', errors='ignore')
        readable_chars = sum(1 for c in text if c.isprintable())
        return readable_chars / len(text) > 0.7 if text else False
    except:
        return False

def analyze_network_behavior(packet, src_ip, dst_ip):
    """Analyze network behavior patterns."""
    behaviors = []
    
    if packet.haslayer(IP):
        # Check for suspicious TTL values
        ttl = packet[IP].ttl
        if ttl < 32:
            behaviors.append('low_ttl_detected')
        elif ttl > 128:
            behaviors.append('high_ttl_detected')
        
        # Check for fragmentation
        if packet[IP].flags.MF or packet[IP].frag > 0:
            behaviors.append('fragmented_packet')
    
    if packet.haslayer(TCP):
        # Check for port scanning indicators
        flags = str(packet[TCP].flags)
        if 'S' in flags and 'A' not in flags:
            behaviors.append('syn_scan_attempt')
        elif flags == 'F':
            behaviors.append('fin_scan_attempt')
        elif flags == 'X':
            behaviors.append('xmas_scan_attempt')
    
    return behaviors

logger = logging.getLogger(__name__)

# Single cache object (removed duplicate definition)
packet_cache = {
    'packets': [],
    'last_update': None,
    'lock': threading.Lock()
}

def analyze_osi_layers(packet):
    """Analyze packet and determine OSI layer information."""
    layers = {
        'physical': 'Ethernet/WiFi',  # Layer 1
        'data_link': None,            # Layer 2
        'network': None,              # Layer 3
        'transport': None,            # Layer 4
        'session': None,              # Layer 5
        'presentation': None,         # Layer 6
        'application': None           # Layer 7
    }
    
    # Layer 2 - Data Link
    if packet.haslayer('Ether'):
        layers['data_link'] = 'Ethernet'
    elif packet.haslayer('ARP'):
        layers['data_link'] = 'ARP'
    
    # Layer 3 - Network
    if packet.haslayer(IP):
        layers['network'] = f"IP (v{packet[IP].version})"
    elif packet.haslayer('IPv6'):
        layers['network'] = 'IPv6'
    elif packet.haslayer(ARP):
        layers['network'] = 'ARP'
    
    # Layer 4 - Transport
    if packet.haslayer(TCP):
        layers['transport'] = f"TCP (Port: {packet[TCP].dport})"
    elif packet.haslayer(UDP):
        layers['transport'] = f"UDP (Port: {packet[UDP].dport})"
    elif packet.haslayer(ICMP):
        layers['transport'] = 'ICMP'
    
    # Layer 7 - Application (simplified detection)
    if packet.haslayer(TCP):
        port = packet[TCP].dport
        if port == 80 or packet[TCP].sport == 80:
            layers['application'] = 'HTTP'
        elif port == 443 or packet[TCP].sport == 443:
            layers['application'] = 'HTTPS'
        elif port == 21 or packet[TCP].sport == 21:
            layers['application'] = 'FTP'
        elif port == 22 or packet[TCP].sport == 22:
            layers['application'] = 'SSH'
        elif port == 25 or packet[TCP].sport == 25:
            layers['application'] = 'SMTP'
        elif port == 53 or packet[TCP].sport == 53:
            layers['application'] = 'DNS'
    elif packet.haslayer(UDP):
        port = packet[UDP].dport
        if port == 53 or packet[UDP].sport == 53:
            layers['application'] = 'DNS'
        elif port == 67 or port == 68:
            layers['application'] = 'DHCP'
    
    return layers

def packet_to_dict(packet, packet_id):
    """Convert packet to dictionary with comprehensive technical analysis."""
    try:
        layers = analyze_osi_layers(packet)
        protocol_details = detect_protocol_details(packet)
        
        # Basic packet info with enhanced metadata
        packet_info = {
            "id": packet_id,
            "timestamp": datetime.now().isoformat(),
            "summary": packet.summary(),
            "size": len(packet),
            "layers": layers,
            "protocol_analysis": protocol_details,
            "security_assessment": {
                "risk_level": "low",
                "security_indicators": protocol_details['security_indicators'],
                "encryption_status": protocol_details['encryption_status']
            },
            "technical_details": {},
            "network_metrics": {}
        }
        
        # Enhanced Network layer analysis
        if packet.haslayer(IP):
            ip_layer = packet[IP]
            packet_info.update({
                "src_ip": ip_layer.src,
                "dst_ip": ip_layer.dst,
                "protocol": ip_layer.proto,
                "ttl": ip_layer.ttl
            })
            
            # Detailed IP analysis
            packet_info["technical_details"]["ip"] = {
                "version": ip_layer.version,
                "header_length": ip_layer.ihl * 4,
                "type_of_service": ip_layer.tos,
                "total_length": ip_layer.len,
                "identification": ip_layer.id,
                "flags": {
                    "dont_fragment": bool(ip_layer.flags.DF),
                    "more_fragments": bool(ip_layer.flags.MF)
                },
                "fragment_offset": ip_layer.frag,
                "checksum": ip_layer.chksum
            }
            
            # Network behavior analysis
            behaviors = analyze_network_behavior(packet, ip_layer.src, ip_layer.dst)
            if behaviors:
                packet_info["security_assessment"]["network_behaviors"] = behaviors
                if any(b in ['syn_scan_attempt', 'fin_scan_attempt'] for b in behaviors):
                    packet_info["security_assessment"]["risk_level"] = "medium"
        
        # Enhanced Transport layer analysis
        if packet.haslayer(TCP):
            tcp_layer = packet[TCP]
            tcp_analysis = analyze_tcp_flags(tcp_layer.flags)
            
            packet_info.update({
                "src_port": int(tcp_layer.sport),
                "dst_port": int(tcp_layer.dport),
                "flags": str(tcp_layer.flags)
            })
            
            # Detailed TCP analysis
            packet_info["technical_details"]["tcp"] = {
                "sequence_number": tcp_layer.seq,
                "acknowledgment_number": tcp_layer.ack,
                "window_size": tcp_layer.window,
                "checksum": tcp_layer.chksum,
                "urgent_pointer": tcp_layer.urgptr,
                "flags_analysis": tcp_analysis,
                "connection_state": tcp_analysis['connection_state']
            }
            
            # Security assessment for TCP
            if tcp_analysis['security_concern']:
                packet_info["security_assessment"]["risk_level"] = "high"
            
            # DNS lookup and geolocation for external IPs
            if packet.haslayer(IP):
                src_ip = packet[IP].src
                dst_ip = packet[IP].dst
                
                if src_ip and not is_private_ip(src_ip):
                    src_hostname = dns_lookup(src_ip)
                    if src_hostname:
                        packet_info["src_hostname"] = src_hostname
                    src_geo = get_ip_info(src_ip)
                    if src_geo:
                        packet_info["src_geo"] = src_geo
                
                if dst_ip and not is_private_ip(dst_ip):
                    dst_hostname = dns_lookup(dst_ip)
                    if dst_hostname:
                        packet_info["dst_hostname"] = dst_hostname
                    dst_geo = get_ip_info(dst_ip)
                    if dst_geo:
                        packet_info["dst_geo"] = dst_geo
                    
        elif packet.haslayer(UDP):
            udp_layer = packet[UDP]
            packet_info.update({
                "src_port": int(udp_layer.sport),
                "dst_port": int(udp_layer.dport)
            })
            
            # Detailed UDP analysis
            packet_info["technical_details"]["udp"] = {
                "length": udp_layer.len,
                "checksum": udp_layer.chksum
            }
            
        elif packet.haslayer(ICMP):
            icmp_layer = packet[ICMP]
            packet_info["technical_details"]["icmp"] = {
                "type": icmp_layer.type,
                "code": icmp_layer.code,
                "checksum": icmp_layer.chksum,
                "id": getattr(icmp_layer, 'id', None)
            }
        
        # ARP specific info
        if packet.haslayer(ARP):
            packet_info.update({
                "arp_op": str(packet[ARP].op),
                "src_mac": str(packet[ARP].hwsrc),
                "dst_mac": str(packet[ARP].hwdst)
            })
        
        # Payload analysis
        if packet.haslayer(Raw):
            payload = packet[Raw].load
            packet_info["payload_analysis"] = {
                "size": len(payload),
                "entropy": calculate_entropy(payload),
                "has_readable_content": has_readable_strings(payload),
                "hash_md5": hashlib.md5(payload).hexdigest()[:16]  # First 16 chars
            }
            
            # Security assessment based on payload
            entropy = packet_info["payload_analysis"]["entropy"]
            if entropy > 7.5:
                packet_info["security_assessment"]["security_indicators"].append("high_entropy_payload")
                if packet_info["security_assessment"]["risk_level"] == "low":
                    packet_info["security_assessment"]["risk_level"] = "medium"
        
        # Calculate network metrics
        packet_info["network_metrics"] = {
            "overhead_bytes": len(packet) - (len(packet[Raw].load) if packet.haslayer(Raw) else 0),
            "efficiency": (len(packet[Raw].load) / len(packet) * 100) if packet.haslayer(Raw) else 0,
            "protocol_stack_depth": len(protocol_details['protocol_stack'])
        }
        
        # Final risk assessment
        risk_factors = len(packet_info["security_assessment"]["security_indicators"])
        if risk_factors >= 3:
            packet_info["security_assessment"]["risk_level"] = "high"
        elif risk_factors >= 1:
            packet_info["security_assessment"]["risk_level"] = "medium"
        
        return make_json_serializable(packet_info)
        
    except Exception as e:
        logger.error(f"Error processing packet {packet_id}: {str(e)}")
        return make_json_serializable({
            "id": packet_id,
            "timestamp": datetime.now().isoformat(),
            "summary": "Error processing packet",
            "size": len(packet) if packet else 0,
            "error": str(e)
        })

def capture_packets(count=10, timeout=10):
    """Capture network packets with timeout."""
    try:
        logger.info(f"Starting packet capture (count: {count}, timeout: {timeout}s)")
        packets = sniff(count=count, timeout=timeout)
        
        packet_list = []
        for i, packet in enumerate(packets, 1):
            packet_dict = packet_to_dict(packet, i)
            packet_list.append(packet_dict)
        
        # Update cache
        with packet_cache['lock']:
            packet_cache['packets'] = packet_list
            packet_cache['last_update'] = datetime.now()
        
        logger.info(f"Captured {len(packet_list)} packets")
        return packet_list
        
    except Exception as e:
        logger.error(f"Error capturing packets: {str(e)}")
        return []

def get_cached_packets(count=10, max_age_seconds=30):
    """Get cached packets if they're recent enough, otherwise capture new ones."""
    with packet_cache['lock']:
        now = datetime.now()
        
        # Check if cache is valid
        if (packet_cache['last_update'] and 
            (now - packet_cache['last_update']).seconds < max_age_seconds and
            packet_cache['packets']):
            logger.info(f"Returning {len(packet_cache['packets'])} cached packets")
            # Força serialização dos pacotes do cache (recursivo)
            return [make_json_serializable(pkt) for pkt in packet_cache['packets'][:count]]
    
    # Cache is stale or empty, capture new packets
    return capture_packets(count)

def start_background_capture(interval=30, count=10):
    """Start background packet capture to keep cache fresh."""
    def capture_loop():
        while True:
            try:
                capture_packets(count)
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Background capture error: {str(e)}")
                time.sleep(5)  # Wait before retrying
    
    thread = threading.Thread(target=capture_loop, daemon=True)
    thread.start()
    logger.info("Background packet capture started")