import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import * as ReactRouter from 'react-router';
const { Link } = ReactRouter;
import { RiRobot2Line } from 'react-icons/ri';
import { IoChevronForward } from 'react-icons/io5';
import { BiCodeAlt } from 'react-icons/bi';
import { LoadingSpinner } from '../common/LoadingScreen';
import './RecentWorkers.css';

const GET_ACTIVE_WORKERS = gql`
  query GetActiveWorkers {
    workers(active: true) {
      id
      name
      model
      instructions
      tools
    }
  }
`;

const RecentWorkers = () => {
  const { data, loading, error } = useQuery(GET_ACTIVE_WORKERS);

  if (loading) return <LoadingSpinner size="small" />;
  if (error) return null;

  const workers = data?.workers || [];

  return (
    <div className="recent-workers">
      <div className="recent-workers-header">
        <div className="recent-workers-title">
          <RiRobot2Line size={16} />
          <h3>Workers Activos</h3>
        </div>
        <Link to="/worker" className="view-all-link">
          Ver todos
          <IoChevronForward size={16} />
        </Link>
      </div>

      <div className="recent-workers-list">
        {workers.map((worker) => (
          <Link
            key={worker.id}
            to={`/worker/${worker.id}`}
            className="worker-item"
          >
            <div className="worker-icon">
              <BiCodeAlt size={16} />
            </div>
            <div className="worker-info">
              <span className="worker-title">{worker.name}</span>
              <div className="worker-meta">
                <span className={`worker-model ${worker.model.toLowerCase()}`}>
                  {worker.model.replace('_', ' ')}
                </span>
                <span className="worker-tools">
                  {worker.tools.length} herramientas
                </span>
              </div>
            </div>
          </Link>
        ))}
        
        {workers.length === 0 && (
          <div className="no-workers">
            <p>No hay workers activos</p>
            <Link to="/worker/create" className="create-worker-link">
              Crear nuevo worker
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentWorkers;