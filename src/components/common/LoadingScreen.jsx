import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner">
          <svg viewBox="0 0 50 50" className="spinner">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>
        <div className="loading-text">{message}</div>
      </div>
    </div>
  );
};

// Variante más pequeña para cargas dentro de componentes
export const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <svg viewBox="0 0 50 50" className="spinner">
        <circle
          className="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
};

export default LoadingScreen;