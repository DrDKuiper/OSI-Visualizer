import { useEffect, useState, useCallback } from "react";
import LayerView from "./components/LayerView.jsx";
import PacketTable from "./components/PacketTable.jsx";
import "./styles.css";

function App() {
    const [packets, setPackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [selectedPacket, setSelectedPacket] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(2000);
    const [filters, setFilters] = useState({
        protocol: '',
        sourceIp: '',
        destIp: '',
        port: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        protocols: {},
        threats: 0
    });

    const fetchPackets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch("/api/packets?cache=true&count=100");
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.message || data.error);
            }
            
            const packetList = data.packets || [];
            setPackets(packetList);
            
            // Calculate stats
            const protocolCount = {};
            packetList.forEach(packet => {
                const proto = packet.summary.split(' ')[0] || 'Unknown';
                protocolCount[proto] = (protocolCount[proto] || 0) + 1;
            });
            
            setStats({
                total: packetList.length,
                protocols: protocolCount,
                threats: Math.floor(packetList.length * 0.05) // Mock threat detection
            });
            
        } catch (err) {
            console.error("Erro ao buscar pacotes:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const filteredPackets = packets.filter(packet => {
        if (filters.protocol && !packet.summary.toLowerCase().includes(filters.protocol.toLowerCase())) return false;
        if (filters.sourceIp && !packet.src_ip.includes(filters.sourceIp)) return false;
        if (filters.destIp && !packet.dst_ip.includes(filters.destIp)) return false;
        if (filters.port && !(packet.src_port?.toString().includes(filters.port) || packet.dst_port?.toString().includes(filters.port))) return false;
        return true;
    });

    useEffect(() => {
        fetchPackets();
    }, [fetchPackets]);

    useEffect(() => {
        if (!isAutoRefresh) return;
        
        const interval = setInterval(fetchPackets, refreshInterval);
        return () => clearInterval(interval);
    }, [isAutoRefresh, refreshInterval, fetchPackets]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            protocol: '',
            sourceIp: '',
            destIp: '',
            port: ''
        });
    };

    return (
        <div className="app">
            <div className="app-header">
                <h1>🛡️ OSI Network Security Monitor</h1>
                <p>Análise de Tráfego de Rede em Tempo Real com Visualização das Camadas OSI</p>
                
                <div className="controls">
                    <button 
                        className="btn"
                        onClick={fetchPackets}
                        disabled={loading}
                    >
                        {loading ? "Analisando..." : "🔄 Atualizar"}
                    </button>
                    
                    <button 
                        className="btn"
                        onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                    >
                        {isAutoRefresh ? "⏸️ Pausar" : "▶️ Resumir"}
                    </button>
                    
                    <span className="status">
                        📡 {stats.total} pacotes | 🚨 {stats.threats} alertas
                    </span>
                </div>

                {/* Network Filters */}
                <div style={{ 
                    marginTop: '1.5rem', 
                    display: 'flex', 
                    gap: '1rem', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center' 
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Protocolo (TCP, UDP, HTTP...)"
                        value={filters.protocol}
                        onChange={(e) => handleFilterChange('protocol', e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #2a2a48',
                            background: '#1a1a2e',
                            color: '#e0e0e0',
                            fontSize: '14px'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="📍 IP Origem"
                        value={filters.sourceIp}
                        onChange={(e) => handleFilterChange('sourceIp', e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #2a2a48',
                            background: '#1a1a2e',
                            color: '#e0e0e0',
                            fontSize: '14px'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="🎯 IP Destino"
                        value={filters.destIp}
                        onChange={(e) => handleFilterChange('destIp', e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #2a2a48',
                            background: '#1a1a2e',
                            color: '#e0e0e0',
                            fontSize: '14px'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="🔌 Porta"
                        value={filters.port}
                        onChange={(e) => handleFilterChange('port', e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #2a2a48',
                            background: '#1a1a2e',
                            color: '#e0e0e0',
                            fontSize: '14px'
                        }}
                    />
                    <button 
                        className="btn"
                        onClick={clearFilters}
                        style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                        🗑️ Limpar
                    </button>
                </div>
            </div>
            
            <div className="app-main">
                {error && (
                    <div className="error-message">
                        ⚠️ Erro: {error}
                    </div>
                )}
                
                <div className="content-grid">
                    <div>
                        <PacketTable 
                            packets={filteredPackets}
                            selectedPacket={selectedPacket}
                            onPacketSelect={setSelectedPacket}
                            loading={loading}
                        />
                    </div>
                    
                    <div>
                        <LayerView packet={selectedPacket} />
                        
                        {/* Network Statistics */}
                        <div style={{ 
                            background: '#111118', 
                            border: '1px solid #2a2a48', 
                            borderRadius: '12px', 
                            padding: '1.5rem', 
                            marginTop: '2rem',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{ 
                                color: '#4fc3f7', 
                                marginBottom: '1rem', 
                                textAlign: 'center',
                                textShadow: '0 0 10px rgba(79, 195, 247, 0.3)'
                            }}>
                                📊 Estatísticas da Rede
                            </h3>
                            
                            <div style={{ 
                                display: 'grid', 
                                gap: '0.5rem',
                                fontSize: '14px'
                            }}>
                                <div style={{ color: '#e0e0e0' }}>
                                    <strong>Total de Pacotes:</strong> {stats.total}
                                </div>
                                <div style={{ color: '#e0e0e0' }}>
                                    <strong>Alertas de Segurança:</strong> {stats.threats}
                                </div>
                                <div style={{ color: '#e0e0e0' }}>
                                    <strong>Protocolos Detectados:</strong>
                                </div>
                                {Object.entries(stats.protocols).slice(0, 5).map(([proto, count]) => (
                                    <div key={proto} style={{ 
                                        marginLeft: '1rem', 
                                        color: '#a0a0a0',
                                        fontSize: '12px'
                                    }}>
                                        {proto}: {count} pacotes
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
