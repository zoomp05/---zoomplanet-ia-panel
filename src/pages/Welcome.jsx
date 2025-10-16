import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import '../css/Welcome.css';

// Este componente representa una tarjeta para cada sitio/módulo de la aplicación
const SiteCard = ({ title, description, icon, path, color }) => {
  return (
    <Link to={path} className="site-card" style={{ backgroundColor: color }}>
      <div className="site-card-icon">
        {icon}
      </div>
      <div className="site-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
};

const Welcome = () => {
  const [sites, setSites] = useState([]);

  // Simula la carga de sitios desde una API o configuración
  useEffect(() => {
    // Aquí podrías hacer una llamada API para obtener los sitios disponibles
    // Por ahora, usaremos datos estáticos
    const availableSites = [
      {
        id: 1,
        title: 'Zoomy',
        description: 'Gestiona usuarios, roles y permisos del sistema',
        icon: <span role="img" aria-label="admin">⚙️</span>,
        path: '/zoomy',
        color: '#4a90e2'
      },
      {
        id: 2,
        title: 'Blocave',
        description: 'Generador de Sitipos Web y API',
        icon: <span role="img" aria-label="content">📄</span>,
        path: '/blocave',
        color: '#50b83c'
      },
      {
        id: 3,
        title: 'Analíticas',
        description: 'Visualiza estadísticas y reportes del sistema',
        icon: <span role="img" aria-label="analytics">📊</span>,
        path: '/analytics',
        color: '#f49342'
      },
      {
        id: 4,
        title: 'ZoomyIA',
        description: 'Accede a las herramientas de inteligencia artificial',
        icon: <span role="img" aria-label="ai">🤖</span>,
        path: '/ia',
        color: '#9c6ade'
      }
    ];
    
    setSites(availableSites);
  }, []);

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <div className="logo-container">
          <img src="/logo.svg" alt="ZoomyApi Logo" className="logo" />
        </div>
        <h1>Bienvenido a ZoomyAPI Platform</h1>
        <p>Selecciona uno de nuestros módulos para comenzar</p>
      </header>

      <main className="sites-grid">
        {sites.map(site => (
          <SiteCard
            key={site.id}
            title={site.title}
            description={site.description}
            icon={site.icon}
            path={site.path}
            color={site.color}
          />
        ))}
      </main>

      <footer className="welcome-footer">
        <p>© {new Date().getFullYear()} ZoomyAPI - Todos los derechos reservados</p>
        <div className="footer-links">
          <a href="/help">Ayuda</a>
          <a href="/terms">Términos de Servicio</a>
          <a href="/privacy">Política de Privacidad</a>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;