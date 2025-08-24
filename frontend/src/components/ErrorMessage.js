import React from "react";

function ErrorMessage({ message, onRetry }) {
    return (
        <div className="error-message">
            <div className="error-content">
                <span className="error-icon">⚠️</span>
                <div className="error-text">
                    <h3>Erro na Captura de Pacotes</h3>
                    <p>{message}</p>
                    <button onClick={onRetry} className="btn btn-primary">
                        🔄 Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorMessage;
