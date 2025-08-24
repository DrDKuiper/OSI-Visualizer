import React, { useState } from "react";

function PacketTable({ packets, onPacketSelect, selectedPacket, loading }) {
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filterProtocol, setFilterProtocol] = useState('');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getProtocolFromPacket = (packet) => {
        if (packet.layers?.application) return packet.layers.application;
        if (packet.layers?.transport) return packet.layers.transport.split(' ')[0];
        if (packet.layers?.network) return packet.layers.network.split(' ')[0];
        return 'Unknown';
    };

    const getProtocolColor = (protocol) => {
        const colors = {
            'HTTP': '#e74c3c',
            'HTTPS': '#c0392b',
            'TCP': '#27ae60',
            'UDP': '#3498db',
            'ICMP': '#f39c12',
            'ARP': '#9b59b6',
            'DNS': '#e67e22',
            'SSH': '#2c3e50',
            'FTP': '#d35400'
        };
        return colors[protocol] || '#95a5a6';
    };

    const filteredAndSortedPackets = packets
        .filter(packet => {
            if (!filterProtocol) return true;
            const protocol = getProtocolFromPacket(packet);
            return protocol.toLowerCase().includes(filterProtocol.toLowerCase());
        })
        .sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            if (sortField === 'timestamp') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const formatSize = (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '⬆️' : '⬇️';
    };

    return (
        <div className="packet-table-container">
            <div className="table-header">
                <h2>📊 Pacotes Capturados</h2>
                <div className="table-controls">
                    <input
                        type="text"
                        placeholder="Filtrar por protocolo..."
                        value={filterProtocol}
                        onChange={(e) => setFilterProtocol(e.target.value)}
                        className="filter-input"
                    />
                    {loading && <span className="loading-indicator">⏳ Atualizando...</span>}
                </div>
            </div>

            {packets.length === 0 ? (
                <div className="empty-state">
                    <p>🔍 Nenhum pacote capturado ainda.</p>
                    <p>Aguarde enquanto capturamos os dados da rede...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="packet-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')} className="sortable">
                                    ID {getSortIcon('id')}
                                </th>
                                <th onClick={() => handleSort('timestamp')} className="sortable">
                                    Tempo {getSortIcon('timestamp')}
                                </th>
                                <th>Protocolo</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th onClick={() => handleSort('size')} className="sortable">
                                    Tamanho {getSortIcon('size')}
                                </th>
                                <th>Resumo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedPackets.map(packet => {
                                const protocol = getProtocolFromPacket(packet);
                                const isSelected = selectedPacket?.id === packet.id;
                                
                                return (
                                    <tr 
                                        key={packet.id} 
                                        className={`packet-row ${isSelected ? 'selected' : ''}`}
                                        onClick={() => onPacketSelect(packet)}
                                    >
                                        <td className="packet-id">#{packet.id}</td>
                                        <td className="timestamp">
                                            {formatTimestamp(packet.timestamp)}
                                        </td>
                                        <td>
                                            <span 
                                                className="protocol-badge"
                                                style={{ backgroundColor: getProtocolColor(protocol) }}
                                            >
                                                {protocol}
                                            </span>
                                        </td>
                                        <td className="address">
                                            {packet.src_ip || 'N/A'}
                                            {packet.src_port && `:${packet.src_port}`}
                                        </td>
                                        <td className="address">
                                            {packet.dst_ip || 'N/A'}
                                            {packet.dst_port && `:${packet.dst_port}`}
                                        </td>
                                        <td className="size">
                                            {formatSize(packet.size || 0)}
                                        </td>
                                        <td className="summary" title={packet.summary}>
                                            {packet.summary}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="table-footer">
                <p>
                    Exibindo <strong>{filteredAndSortedPackets.length}</strong> de <strong>{packets.length}</strong> pacotes
                    {filterProtocol && ` (filtrado por "${filterProtocol}")`}
                </p>
            </div>
        </div>
    );
}

export default PacketTable;