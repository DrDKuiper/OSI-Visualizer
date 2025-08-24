from scapy.all import sniff, IP, TCP, UDP, ICMP, ARP
import time
import threading
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Cache for packets
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
    """Convert packet to dictionary with detailed information."""
    try:
        layers = analyze_osi_layers(packet)
        
        # Basic packet info
        packet_info = {
            "id": packet_id,
            "timestamp": datetime.now().isoformat(),
            "summary": packet.summary(),
            "size": len(packet),
            "layers": layers
        }
        
        # Network layer info
        if packet.haslayer(IP):
            packet_info.update({
                "src_ip": packet[IP].src,
                "dst_ip": packet[IP].dst,
                "protocol": packet[IP].proto,
                "ttl": packet[IP].ttl
            })
        
        # Transport layer info
        if packet.haslayer(TCP):
            packet_info.update({
                "src_port": packet[TCP].sport,
                "dst_port": packet[TCP].dport,
                "flags": packet[TCP].flags
            })
        elif packet.haslayer(UDP):
            packet_info.update({
                "src_port": packet[UDP].sport,
                "dst_port": packet[UDP].dport
            })
        
        # ARP specific info
        if packet.haslayer(ARP):
            packet_info.update({
                "arp_op": packet[ARP].op,
                "src_mac": packet[ARP].hwsrc,
                "dst_mac": packet[ARP].hwdst
            })
        
        return packet_info
        
    except Exception as e:
        logger.error(f"Error processing packet: {str(e)}")
        return {
            "id": packet_id,
            "timestamp": datetime.now().isoformat(),
            "summary": "Error processing packet",
            "error": str(e),
            "layers": {}
        }

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
            return packet_cache['packets'][:count]
    
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