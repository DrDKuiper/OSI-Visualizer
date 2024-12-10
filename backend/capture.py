from scapy.all import sniff

def capture_packets():
    def packet_to_dict(packet):
        
        return {

            "summary": packet.summary(),
            "src": packet.src if hasattr(packet, 'src') else None,
            "dst": packet.dst if hasattr(packet, 'dst') else None,
            "proto": packet.proto if hasattr(packet, 'proto') else None
        }
    
    
    packets = sniff(count=10)
    
    return [packet_to_dict(packet) for packet in packets]