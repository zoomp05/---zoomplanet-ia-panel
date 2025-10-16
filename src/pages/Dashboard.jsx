import React from 'react';
import * as ApolloClient from '@apollo/client';
const { useQuery } = ApolloClient;
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;
import { Plus, Folder, GitBranch, Users, Star, Activity } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { LoadingSpinner } from '../components/common/LoadingScreen';
import { GET_DASHBOARD_DATA } from '../apollo/project';
import { typeLabels, typeClasses } from '../constants/project';
import RecentProjects from '../components/project/RecentProjects';
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA);

  // Estadísticas
  const stats = [
    {
      label: 'Proyectos Activos',
      value: data?.projects?.totalItems || 0,
      icon: <Folder className="stats-icon" />,
      color: 'blue'
    },
    {
      label: 'Workers',
      value: data?.workers?.length || 0,
      icon: <Users className="stats-icon" />,
      color: 'green'
    },
    {
      label: 'Commits Totales',
      value: '256',
      icon: <GitBranch className="stats-icon" />,
      color: 'purple'
    },
    {
      label: 'Tareas Completadas',
      value: '89',
      icon: <Activity className="stats-icon" />,
      color: 'orange'
    }
  ];

  if (loading) {
    return (
     
        <div className="dashboard-loading">
          <LoadingSpinner size="large" />
        </div>
      
    );
  }

  if (error) {
    return (
        <div className="dashboard-error">
          <h2>Error al cargar el dashboard</h2>
          <p>{error.message}</p>
        </div>
      
    );
  }

  const workers = data?.workers || [];

  console.log('workers ', workers);

  return (
    <>
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-subtitle">Bienvenido a tu espacio de trabajo</p>
          </div>
          <button
            className="create-project-button"
            onClick={() => navigate('/projects/create')}
          >
            <Plus size={20} />
            Nuevo Proyecto
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Projects Section */}
          <div className="projects-section">
            <RecentProjects />
          </div>

          {/* Workers Section */}
          <div className="dashboard-sidebar">
            <div className="workers-section">
              <h2>Workers Activos</h2>
              <div className="workers-list">
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <div key={worker.id} className="worker-card">
                      <div className="worker-header">
                        <Star className="worker-icon" size={16} />
                        <h4>{worker.name}</h4>
                      </div>
                      <p className="worker-model">{worker.model}</p>
                      <p className="worker-instructions">{worker.instructions}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-workers-message">
                    No hay workers activos
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;