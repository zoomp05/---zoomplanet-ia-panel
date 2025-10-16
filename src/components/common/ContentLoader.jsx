import React from 'react';
import './LoadingScreen.css';

export const ContentLoader = ({ type = 'text', lines = 1, height = 20 }) => {
  const getWidth = (index) => {
    // Varía el ancho para texto más natural
    if (type === 'text') {
      return index === lines - 1 ? '70%' : '100%';
    }
    return '100%';
  };

  return (
    <div className="content-loader">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{
            height: `${height}px`,
            width: getWidth(index),
            marginBottom: '8px'
          }}
        />
      ))}
    </div>
  );
};

// Componente para cargar tarjetas
export const CardLoader = ({ count = 1 }) => {
  return (
    <div className="card-loader" style={{ display: 'flex', gap: '16px' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            width: '300px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div
            className="skeleton"
            style={{ height: '150px', marginBottom: '16px' }}
          />
          <div
            className="skeleton"
            style={{ height: '24px', width: '70%', marginBottom: '8px' }}
          />
          <div
            className="skeleton"
            style={{ height: '16px', width: '100%', marginBottom: '8px' }}
          />
          <div
            className="skeleton"
            style={{ height: '16px', width: '90%' }}
          />
        </div>
      ))}
    </div>
  );
};

export default ContentLoader;