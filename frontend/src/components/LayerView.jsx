import React from 'react';

const LAYERS = [
  { number: 7, name: 'Aplicação', key: 'application', desc: 'HTTP, DNS, FTP', color: '#e74c3c', icon: '🌐' },
  { number: 6, name: 'Apresentação', key: 'presentation', desc: 'Criptografia, Formatação', color: '#f39c12', icon: '🔒' },
  { number: 5, name: 'Sessão', key: 'session', desc: 'Gerencia sessões', color: '#f1c40f', icon: '🔗' },
  { number: 4, name: 'Transporte', key: 'transport', desc: 'TCP, UDP', color: '#27ae60', icon: '🚛' },
  { number: 3, name: 'Rede', key: 'network', desc: 'IP, ICMP, ARP', color: '#3498db', icon: '🌍' },
  { number: 2, name: 'Enlace', key: 'data_link', desc: 'Ethernet, MAC', color: '#9b59b6', icon: '🔌' },
  { number: 1, name: 'Física', key: 'physical', desc: 'Meio físico', color: '#34495e', icon: '⚡' }
];

export default function LayerView({ packet }) {
  const getActivity = (layer, pkt) => pkt?.layers?.[layer.key] || null;
  return (
    <div className="layer-view">
      <h2>
        Modelo OSI
        {packet && (
          <small style={{ fontSize: '0.7em', marginLeft: '1rem', color: '#a0a0a0' }}>
            Pacote #{packet.id}
          </small>
        )}
      </h2>
      <div className="layers-container">
        {LAYERS.map(layer => {
          const activity = getActivity(layer, packet);
          const isActive = !!activity;
          return (
            <div
              key={layer.number}
              className={`layer ${isActive ? 'active' : ''}`}
            >
              <div className="layer-header">
                <span className="layer-icon">{layer.icon}</span>
                <div className="layer-info">
                  <span className="layer-number">L{layer.number}</span>
                  <span className="layer-name">{layer.name}</span>
                </div>
                {isActive && <span className="activity-dot" />}
              </div>
              <div className="layer-description">{layer.desc}</div>
              {activity && (
                <div className="layer-activity">
                  <strong>Protocolo:</strong> {activity}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!packet && (
        <div className="layer-help">
          🔍 Selecione um pacote para destacar as camadas utilizadas
        </div>
      )}
      {packet && (
        <div className="packet-summary">
          <h3>� Análise Técnica Detalhada - Pacote #{packet.id}</h3>
          
          {/* Security Assessment Panel */}
          {packet.security_assessment && (
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #4fc3f7', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <h4 style={{ color: '#4fc3f7', marginBottom: '0.8rem' }}>🛡️ Avaliação de Segurança</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>Nível de Risco:</strong>
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: packet.security_assessment.risk_level === 'high' ? '#dc3545' : 
                                   packet.security_assessment.risk_level === 'medium' ? '#ffc107' : '#28a745',
                    color: packet.security_assessment.risk_level === 'medium' ? '#212529' : 'white'
                  }}>
                    {packet.security_assessment.risk_level?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div>
                  <strong>Criptografia:</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#4fc3f7' }}>
                    {packet.security_assessment.encryption_status || 'unknown'}
                  </span>
                </div>
                <div>
                  <strong>Indicadores:</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#ffc107' }}>
                    {packet.security_assessment.security_indicators?.length || 0}
                  </span>
                </div>
              </div>
              
              {packet.security_assessment.security_indicators?.length > 0 && (
                <div style={{ marginTop: '0.8rem' }}>
                  <strong style={{ color: '#ff6b35' }}>⚠️ Indicadores de Segurança:</strong>
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {packet.security_assessment.security_indicators.map((indicator, index) => (
                      <span key={index} style={{ 
                        backgroundColor: '#ff6b35', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem' 
                      }}>
                        {indicator.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Network Information Panel */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #28a745', 
              borderRadius: '8px', 
              padding: '1rem' 
            }}>
              <h4 style={{ color: '#28a745', marginBottom: '0.8rem' }}>📡 Origem</h4>
              <p><strong>IP:</strong> {packet.src_ip}</p>
              <p><strong>Porta:</strong> {packet.src_port || '—'}</p>
              {packet.src_hostname && (
                <p><strong>Hostname:</strong> <span style={{ color: '#4fc3f7' }}>{packet.src_hostname}</span></p>
              )}
              {packet.src_geo && (
                <div style={{ fontSize: '0.85em', color: '#a0a0a0', marginTop: '0.5rem' }}>
                  <p>📍 {packet.src_geo.city}, {packet.src_geo.region}, {packet.src_geo.country}</p>
                  <p>🏢 {packet.src_geo.isp}</p>
                  <p>🌐 ASN: {packet.src_geo.as}</p>
                </div>
              )}
            </div>
            
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #ffc107', 
              borderRadius: '8px', 
              padding: '1rem' 
            }}>
              <h4 style={{ color: '#ffc107', marginBottom: '0.8rem' }}>🎯 Destino</h4>
              <p><strong>IP:</strong> {packet.dst_ip}</p>
              <p><strong>Porta:</strong> {packet.dst_port || '—'}</p>
              {packet.dst_hostname && (
                <p><strong>Hostname:</strong> <span style={{ color: '#4fc3f7' }}>{packet.dst_hostname}</span></p>
              )}
              {packet.dst_geo && (
                <div style={{ fontSize: '0.85em', color: '#a0a0a0', marginTop: '0.5rem' }}>
                  <p>📍 {packet.dst_geo.city}, {packet.dst_geo.region}, {packet.dst_geo.country}</p>
                  <p>🏢 {packet.dst_geo.isp}</p>
                  <p>🌐 ASN: {packet.dst_geo.as}</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details Panel */}
          {packet.technical_details && (
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #9b59b6', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <h4 style={{ color: '#9b59b6', marginBottom: '0.8rem' }}>⚙️ Detalhes Técnicos</h4>
              
              {packet.technical_details.tcp && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ color: '#4fc3f7' }}>🚛 TCP</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.9em' }}>
                    <p><strong>Seq:</strong> {packet.technical_details.tcp.sequence_number}</p>
                    <p><strong>Ack:</strong> {packet.technical_details.tcp.acknowledgment_number}</p>
                    <p><strong>Window:</strong> {packet.technical_details.tcp.window_size}</p>
                    {packet.technical_details.tcp.flags_analysis && (
                      <>
                        <p><strong>Estado:</strong> {packet.technical_details.tcp.connection_state}</p>
                        <p><strong>Flags:</strong> {packet.technical_details.tcp.flags_analysis.flags_present?.join(', ')}</p>
                        {packet.technical_details.tcp.flags_analysis.security_concern && (
                          <p style={{ color: '#dc3545' }}><strong>⚠️ Suspeita:</strong> Sim</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {packet.technical_details.ip && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ color: '#4fc3f7' }}>🌍 IP</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.9em' }}>
                    <p><strong>Versão:</strong> IPv{packet.technical_details.ip.version}</p>
                    <p><strong>TTL:</strong> {packet.ttl}</p>
                    <p><strong>Tamanho:</strong> {packet.technical_details.ip.total_length} bytes</p>
                    <p><strong>ID:</strong> {packet.technical_details.ip.identification}</p>
                    <p><strong>DF:</strong> {packet.technical_details.ip.flags?.dont_fragment ? 'Sim' : 'Não'}</p>
                    <p><strong>MF:</strong> {packet.technical_details.ip.flags?.more_fragments ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payload Analysis Panel */}
          {packet.payload_analysis && (
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #ff6b35', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <h4 style={{ color: '#ff6b35', marginBottom: '0.8rem' }}>📦 Análise de Payload</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>Tamanho:</strong>
                  <p style={{ color: '#4fc3f7' }}>{packet.payload_analysis.size} bytes</p>
                </div>
                <div>
                  <strong>Entropia:</strong>
                  <p style={{ color: packet.payload_analysis.entropy > 7.5 ? '#dc3545' : '#28a745' }}>
                    {packet.payload_analysis.entropy?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <strong>Texto Legível:</strong>
                  <p style={{ color: packet.payload_analysis.has_readable_content ? '#28a745' : '#6c757d' }}>
                    {packet.payload_analysis.has_readable_content ? 'Sim' : 'Não'}
                  </p>
                </div>
                <div>
                  <strong>Hash MD5:</strong>
                  <p style={{ color: '#a0a0a0', fontFamily: 'monospace', fontSize: '0.8em' }}>
                    {packet.payload_analysis.hash_md5}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Protocol Stack Panel */}
          {packet.protocol_analysis && (
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #17a2b8', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <h4 style={{ color: '#17a2b8', marginBottom: '0.8rem' }}>🔗 Stack de Protocolos</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {packet.protocol_analysis.protocol_stack?.map((protocol, index) => (
                  <React.Fragment key={index}>
                    <span style={{ 
                      backgroundColor: '#17a2b8', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.9em' 
                    }}>
                      {protocol}
                    </span>
                    {index < packet.protocol_analysis.protocol_stack.length - 1 && (
                      <span style={{ color: '#a0a0a0' }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Network Metrics Panel */}
          {packet.network_metrics && (
            <div style={{ 
              backgroundColor: '#1a1a2e', 
              border: '1px solid #6f42c1', 
              borderRadius: '8px', 
              padding: '1rem' 
            }}>
              <h4 style={{ color: '#6f42c1', marginBottom: '0.8rem' }}>📊 Métricas de Rede</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>Overhead:</strong>
                  <p style={{ color: '#4fc3f7' }}>{packet.network_metrics.overhead_bytes} bytes</p>
                </div>
                <div>
                  <strong>Eficiência:</strong>
                  <p style={{ color: '#28a745' }}>{packet.network_metrics.efficiency?.toFixed(1)}%</p>
                </div>
                <div>
                  <strong>Profundidade:</strong>
                  <p style={{ color: '#ffc107' }}>{packet.network_metrics.protocol_stack_depth} camadas</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Summary Panel */}
          <div style={{ 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid #2a2a48',
            backgroundColor: '#1a1a2e',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <h4 style={{ color: '#e0e0e0', marginBottom: '0.8rem' }}>📋 Resumo Básico</h4>
            <p><strong>Tamanho Total:</strong> {packet.size} bytes</p>
            <p><strong>Timestamp:</strong> {new Date(packet.timestamp).toLocaleString()}</p>
            <p><strong>Resumo:</strong> <span style={{ color: '#a0a0a0' }}>{packet.summary}</span></p>
            {packet.flags && (
              <p><strong>TCP Flags:</strong> <span style={{ color: '#4fc3f7' }}>{packet.flags}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}