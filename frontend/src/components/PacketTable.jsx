import React from 'react';

export default function PacketTable({ packets, onSelect, selectedId }) {
  if (!packets?.length) return <p className="text-muted">Nenhum pacote.</p>;
  return (
    <table className="table table-sm table-dark table-striped align-middle">
      <thead>
        <tr>
          <th>#</th><th>Origem</th><th>Destino</th><th>Proto</th><th>Tam</th><th>Resumo</th>
        </tr>
      </thead>
      <tbody>
        {packets.map(p => (
          <tr key={p.id} className={p.id===selectedId? 'table-primary': ''} style={{cursor:'pointer'}} onClick={()=>onSelect?.(p)}>
            <td>{p.id}</td>
            <td>{p.src_ip || '-'}</td>
            <td>{p.dst_ip || '-'}</td>
            <td>{p.protocol || '-'}</td>
            <td>{p.size}</td>
            <td style={{maxWidth:260, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{p.summary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
