// src/modules/marketing/pages/analytics.jsx
import React from 'react';

const Analytics = () => {
  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Marketing Analytics</h1>
        <p>Análisis detallado del rendimiento de campañas de marketing</p>
      </div>
      
      <div className="analytics-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Campañas Activas</h3>
            <div className="metric-value">0</div>
            <p>campañas en ejecución</p>
          </div>
          
          <div className="analytics-card">
            <h3>Impresiones Totales</h3>
            <div className="metric-value">0</div>
            <p>impresiones este mes</p>
          </div>
          
          <div className="analytics-card">
            <h3>CTR Promedio</h3>
            <div className="metric-value">0%</div>
            <p>tasa de clics</p>
          </div>
          
          <div className="analytics-card">
            <h3>Conversiones</h3>
            <div className="metric-value">0</div>
            <p>conversiones este mes</p>
          </div>
        </div>
        
        <div className="analytics-section">
          <h2>Gráficos de Rendimiento</h2>
          <div className="chart-placeholder">
            <p>📊 Los gráficos de analytics se implementarán aquí</p>
            <p>Esta página está siendo desarrollada...</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .analytics-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-header h1 {
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .page-header p {
          color: #666;
          font-size: 16px;
        }
        
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .analytics-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .analytics-card h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        
        .analytics-card p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
        
        .analytics-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .analytics-section h2 {
          color: #1a1a1a;
          margin-bottom: 20px;
        }
        
        .chart-placeholder {
          text-align: center;
          padding: 60px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }
        
        .chart-placeholder p {
          color: #666;
          font-size: 16px;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default Analytics;
