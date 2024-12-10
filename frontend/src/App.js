import React, { useEffect, useState } from "react";
import LayerView from "./components/LayerView";
import PacketTable from "./components/PacketTable";

function App() {
    const [packets, setPackets] = useState([]);

    useEffect(() => {
        fetch("/api/packets")
            .then(response => response.json())
            .then(data => setPackets(data))
            .catch(err => console.error("Erro ao buscar pacotes:", err));
    }, []);

    return (
        <div className="App">
            <h1>Modelo OSI - Visualizador de Pacotes</h1>
            <LayerView />
            <PacketTable packets={packets} />
        </div>
    );
}

export default App;