import React from "react";

function LoadingSpinner() {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Capturando pacotes da rede...</p>
        </div>
    );
}

export default LoadingSpinner;
