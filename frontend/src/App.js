import React, { useEffect, useState, useCallback } from "react";
import LayerView from "./components/LayerView";
import OSICard from "./components/OSICard";
import "bootstrap/dist/css/bootstrap.min.css";
import PacketTable from "./components/PacketTable";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";

function App() {
    const [packets, setPackets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [selectedPacket, setSelectedPacket] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(5000);

    const fetchPackets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch("/api/packets?cache=true&count=20");
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.message || data.error);
            }
            
            setPackets(data.packets || []);
            
        } catch (err) {
            console.error("Erro ao buscar pacotes:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchPackets();
    }, [fetchPackets]);

    // Auto refresh
    useEffect(() => {
        if (!isAutoRefresh) return;

        const interval = setInterval(fetchPackets, refreshInterval);
        return () => clearInterval(interval);
    }, [isAutoRefresh, refreshInterval, fetchPackets]);

    const handleRefreshToggle = () => {
        setIsAutoRefresh(!isAutoRefresh);
    };

    const handleManualRefresh = () => {
        fetchPackets();
    };

    const handleIntervalChange = (newInterval) => {
        setRefreshInterval(newInterval * 1000); // Convert to milliseconds
    };

    const handlePacketSelect = (packet) => {
        setSelectedPacket(selectedPacket?.id === packet.id ? null : packet);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🌐 OSI Visualizer</h1>
                <p>Analisador de Pacotes de Rede em Tempo Real</p>
                
                <div className="controls">
                    <button 
                        onClick={handleManualRefresh} 
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? "Atualizando..." : "🔄 Atualizar"}
                    </button>
                    
                    <button 
                        onClick={handleRefreshToggle}
                        className={`btn ${isAutoRefresh ? 'btn-success' : 'btn-secondary'}`}
                    >
                        {isAutoRefresh ? "⏸️ Pausar Auto-Refresh" : "▶️ Iniciar Auto-Refresh"}
                    </button>
                    
                    <select 
                        value={refreshInterval / 1000} 
                        onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                        className="interval-select"
                    >
                        <option value={2}>2s</option>
                        <option value={5}>5s</option>
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                    </select>
                </div>
            </header>

            <main className="app-main">
                {error && <ErrorMessage message={error} onRetry={fetchPackets} />}
                
                <div className="content-grid">
                    <section className="osi-section">
                        <h2 className="mb-4">Pacotes Capturados</h2>
                        {loading && packets.length === 0 ? (
                            <LoadingSpinner />
                        ) : (
                            packets.length > 0 ? (
                                packets.map((packet) => <OSICard key={packet.id} packet={packet} />)
                            ) : (
                                <div className="alert alert-info">Nenhum pacote capturado.</div>
                            )
                        )}
                    </section>
                </div>
            </main>

            <footer className="app-footer">
                <p>
                    Pacotes capturados: <strong>{packets.length}</strong> | 
                    Status: <span className={`status ${loading ? 'loading' : 'ready'}`}>
                        {loading ? 'Carregando...' : 'Pronto'}
                    </span>
                </p>
            </footer>
        </div>
    );
}

export default App;