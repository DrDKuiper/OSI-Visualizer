import React from "react";

function LayerView() {
    const layers = [
        "Física",
        "Enlace",
        "Rede",
        "Transporte",
        "Sessão",
        "Apresentação",
        "Aplicação",
    ];

    return (
        <div className="layer-view">
            {layers.map((layer, index) => (
                <div key={index} className="layer">
                    {layer}
                </div>
            ))}
        </div>
    );
}

export default LayerView;