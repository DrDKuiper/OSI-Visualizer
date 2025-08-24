import React from "react";

function LayerView({ selectedPacket }) {
    const layers = [
        {
            number: 7,
            name: "Aplicação",
            description: "HTTP, HTTPS, FTP, SSH, DNS",
            color: "#e74c3c",
            icon: "🌐"
        },
        {
            number: 6,
            name: "Apresentação",
            description: "Criptografia, Compressão",
            color: "#f39c12",
            icon: "🔒"
        },
        {
            number: 5,
            name: "Sessão",
            description: "Gerenciamento de Sessão",
            color: "#f1c40f",
            icon: "🔗"
        },
        {
            number: 4,
            name: "Transporte",
            description: "TCP, UDP",
            color: "#27ae60",
            icon: "🚛"
        },
        {
            number: 3,
            name: "Rede",
            description: "IP, ARP, ICMP",
            color: "#3498db",
            icon: "🌍"
        },
        {
            number: 2,
            name: "Enlace",
            description: "Ethernet, WiFi",
            color: "#9b59b6",
            icon: "🔌"
        },
        {
            number: 1,
            name: "Física",
            description: "Cabos, Sinais",
            color: "#34495e",
            icon: "⚡"
        }
    ];

    const getLayerActivity = (layerNumber, packet) => {
        if (!packet || !packet.layers) return null;

        const layerMap = {
            7: packet.layers.application,
            6: packet.layers.presentation,
            5: packet.layers.session,
            4: packet.layers.transport,
            3: packet.layers.network,
            2: packet.layers.data_link,
            1: packet.layers.physical
        };

        return layerMap[layerNumber];
    };

    const isLayerActive = (layerNumber, packet) => {
        const activity = getLayerActivity(layerNumber, packet);
        return activity !== null && activity !== undefined;
    };

    return (
        <div className="layer-view">
            <h2>🏗️ Modelo OSI</h2>
            <div className="layers-container">
                {layers.map((layer) => {
                    const isActive = selectedPacket && isLayerActive(layer.number, selectedPacket);
                    const activity = selectedPacket && getLayerActivity(layer.number, selectedPacket);
                    
                    return (
                        <div 
                            key={layer.number} 
                            className={`layer ${isActive ? 'active' : ''}`}
                            style={{ 
                                backgroundColor: layer.color,
                                opacity: selectedPacket ? (isActive ? 1 : 0.3) : 1
                            }}
                        >
                            <div className="layer-header">
                                <span className="layer-icon">{layer.icon}</span>
                                <div className="layer-info">
                                    <span className="layer-number">L{layer.number}</span>
                                    <span className="layer-name">{layer.name}</span>
                                </div>
                            </div>
                            
                            <div className="layer-description">
                                {layer.description}
                            </div>
                            
                            {activity && (
                                <div className="layer-activity">
                                    <strong>Detectado:</strong> {activity}
                                </div>
                            )}
                            
                            {isActive && (
                                <div className="layer-indicator">
                                    <span className="activity-dot"></span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {!selectedPacket && (
                <div className="layer-help">
                    💡 Clique em um pacote na tabela para ver as camadas ativas
                </div>
            )}
            
            {selectedPacket && (
                <div className="packet-summary">
                    <h3>📦 Pacote Selecionado #{selectedPacket.id}</h3>
                    <div className="summary-details">
                        <p><strong>Resumo:</strong> {selectedPacket.summary}</p>
                        <p><strong>Tamanho:</strong> {selectedPacket.size} bytes</p>
                        <p><strong>Timestamp:</strong> {new Date(selectedPacket.timestamp).toLocaleTimeString()}</p>
                        {selectedPacket.src_ip && (
                            <p><strong>Origem:</strong> {selectedPacket.src_ip}:{selectedPacket.src_port || 'N/A'}</p>
                        )}
                        {selectedPacket.dst_ip && (
                            <p><strong>Destino:</strong> {selectedPacket.dst_ip}:{selectedPacket.dst_port || 'N/A'}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LayerView;