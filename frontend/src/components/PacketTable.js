import React from "react";

function PacketTable({ packets }) {
    return (
        <div>
            <h2>Pacotes</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pacote</th>
                    </tr>
                </thead>
                <tbody>
                    {packets.length > 0 ? (
                        packets.map(packet => (
                            <tr key={packet.id}>
                                <td>{packet.id}</td>
                                <td>{packet.packet}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">Nenhum pacote encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PacketTable;