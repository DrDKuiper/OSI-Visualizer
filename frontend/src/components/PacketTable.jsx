import React from 'react';

export default function PacketTable({ packets, selectedPacket, onPacketSelect, loading }) {
  const getProtocolBadge = (summary) => {
    const protocol = summary.split(' ')[0]?.toLowerCase() || 'unknown';
    return (
      <span className={`protocol-badge protocol-${protocol}`}>
        {protocol.toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (riskLevel) => {
    const styles = {
      'low': { backgroundColor: '#28a745', color: 'white' },
      'medium': { backgroundColor: '#ffc107', color: '#212529' },
      'high': { backgroundColor: '#dc3545', color: 'white' },
      'unknown': { backgroundColor: '#6c757d', color: 'white' }
    };
    
    const style = styles[riskLevel] || styles['unknown'];
    return (
      <span className="badge" style={style}>
        {(riskLevel || 'UNKNOWN').toUpperCase()}
      </span>
    );
  };

  const getEncryptionBadge = (encryptionStatus) => {
    const styles = {
      'encrypted': { backgroundColor: '#28a745', color: 'white', text: '🔒 ENC' },
      'likely_encrypted': { backgroundColor: '#ffc107', color: '#212529', text: '🔐 PROB' },
      'plaintext': { backgroundColor: '#dc3545', color: 'white', text: '🔓 PLAIN' },
      'unknown': { backgroundColor: '#6c757d', color: 'white', text: '❓ UNK' }
    };
    
    const style = styles[encryptionStatus] || styles['unknown'];
    return (
      <span className="badge" style={style.backgroundColor && style.color ? { backgroundColor: style.backgroundColor, color: style.color } : {}}>
        {style.text}
      </span>
    );
  };

  const getSecurityIndicators = (securityAssessment) => {
    if (!securityAssessment?.security_indicators?.length) return null;
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
        {securityAssessment.security_indicators.slice(0, 2).map((indicator, index) => (
          <span key={index} className="badge" style={{ 
            backgroundColor: '#ff6b35', 
            color: 'white', 
            fontSize: '0.6rem' 
          }}>
            {indicator.replace(/_/g, ' ').substring(0, 8)}
          </span>
        ))}
        {securityAssessment.security_indicators.length > 2 && (
          <span className="badge" style={{ 
            backgroundColor: '#4fc3f7', 
            color: '#212529', 
            fontSize: '0.6rem' 
          }}>
            +{securityAssessment.security_indicators.length - 2}
          </span>
        )}
      </div>
    );
  };

  const formatProtocolStack = (protocolAnalysis) => {
    if (!protocolAnalysis?.protocol_stack) return '-';
    return protocolAnalysis.protocol_stack.slice(0, 3).join(' → ');
  };

  if (loading) {
    return (
      <div className="packet-table">
        <h2>🕵️ Interceptação de Pacotes</h2>
        <div className="loading-spinner">
          <div style={{ fontSize: '2rem' }}>⏳</div>
          <div style={{ marginTop: '1rem' }}>Capturando tráfego de rede...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="packet-table">
      <h2>🕵️ Análise Forense de Pacotes</h2>
      
      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proto</th>
              <th>Origem</th>
              <th>Destino</th>
              <th>Loc/ISP</th>
              <th>Stack</th>
              <th>Risco</th>
              <th>Cripto</th>
              <th>Payload</th>
              <th>Indicadores</th>
            </tr>
          </thead>
          <tbody>
            {packets.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: '#a0a0a0', padding: '2rem' }}>
                  📡 Nenhum pacote interceptado ainda...
                </td>
              </tr>
            ) : (
              packets.map((packet) => (
                <tr
                  key={packet.id}
                  className={selectedPacket?.id === packet.id ? 'selected' : ''}
                  onClick={() => onPacketSelect(packet)}
                >
                  <td>
                    <code style={{ color: '#4fc3f7' }}>#{packet.id}</code>
                  </td>
                  <td>
                    {getProtocolBadge(packet.summary)}
                  </td>
                  <td>
                    <code style={{ color: '#0dcaf0', fontSize: '11px' }}>
                      {packet.src_ip}
                      {packet.src_port && <><br/><small>:{packet.src_port}</small></>}
                      {packet.src_hostname && (
                        <><br/><small style={{ color: '#4fc3f7' }}>
                          {packet.src_hostname.substring(0, 12)}
                          {packet.src_hostname.length > 12 ? '...' : ''}
                        </small></>
                      )}
                    </code>
                  </td>
                  <td>
                    <code style={{ color: '#ffc107', fontSize: '11px' }}>
                      {packet.dst_ip}
                      {packet.dst_port && <><br/><small>:{packet.dst_port}</small></>}
                      {packet.dst_hostname && (
                        <><br/><small style={{ color: '#4fc3f7' }}>
                          {packet.dst_hostname.substring(0, 12)}
                          {packet.dst_hostname.length > 12 ? '...' : ''}
                        </small></>
                      )}
                    </code>
                  </td>
                  <td>
                    <div style={{ fontSize: '10px', color: '#a0a0a0' }}>
                      {packet.dst_geo && (
                        <>
                          <div>🌍 {packet.dst_geo.country}</div>
                          <div style={{ color: '#4fc3f7' }}>🏢 {packet.dst_geo.isp?.substring(0, 15)}</div>
                        </>
                      )}
                      {packet.src_geo && packet.src_geo !== packet.dst_geo && (
                        <>
                          <div style={{ marginTop: '2px' }}>↔️ {packet.src_geo.country}</div>
                        </>
                      )}
                      {!packet.dst_geo && !packet.src_geo && '-'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '10px', color: '#a0a0a0', maxWidth: '80px' }}>
                      {formatProtocolStack(packet.protocol_analysis)}
                    </div>
                  </td>
                  <td>
                    {getRiskBadge(packet.security_assessment?.risk_level)}
                  </td>
                  <td>
                    {getEncryptionBadge(packet.security_assessment?.encryption_status)}
                  </td>
                  <td>
                    <div style={{ fontSize: '10px' }}>
                      <span style={{ color: '#e0e0e0' }}>{packet.size}B</span>
                      {packet.payload_analysis && (
                        <>
                          <br/>
                          <span style={{ color: '#4fc3f7' }}>
                            E: {packet.payload_analysis.entropy?.toFixed(1)}
                          </span>
                          {packet.payload_analysis.has_readable_content && (
                            <>
                              <br/>
                              <span style={{ color: '#28a745' }}>📄 TXT</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    {getSecurityIndicators(packet.security_assessment)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {packets.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center', 
          color: '#a0a0a0', 
          fontSize: '14px' 
        }}>
          🔍 {packets.length} pacotes analisados | 
          🔒 Análise de segurança e criptografia ativa |
          Clique para detalhes técnicos
        </div>
      )}
    </div>
  );
}