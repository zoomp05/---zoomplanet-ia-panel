import React from 'react';

const ZoomyDashboard = () => {
  return (
    <div className="zoomy-dashboard">
      <h1>Dashboard de Zoomy</h1>
      <p>Este es el panel principal de Zoomy donde podrás visualizar estadísticas y métricas importantes.</p>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Usuarios Activos</h3>
          <div className="metric">248</div>
          <p>Último día</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Proyectos</h3>
          <div className="metric">56</div>
          <p>Proyectos activos</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Consultas IA</h3>
          <div className="metric">1,204</div>
          <p>Último mes</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Rendimiento</h3>
          <div className="metric">98.7%</div>
          <p>Tiempo de actividad</p>
        </div>
      </div>
      
      <div className="dashboard-charts">
        <div className="chart">
          <h3>Actividad Reciente</h3>
          <div className="chart-placeholder">
            [Gráfico de Actividad]
          </div>
        </div>
        
        <div className="chart">
          <h3>Distribución de Recursos</h3>
          <div className="chart-placeholder">
            [Gráfico de Distribución]
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomyDashboard;