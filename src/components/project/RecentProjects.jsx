import React from 'react';
import { useQuery } from '@apollo/client';
import * as ReactRouter from 'react-router';
import { Clock, ChevronRight, Folder } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingScreen';
import { GET_RECENT_PROJECTS } from '../../apollo/project';
import { typeLabels, typeClasses } from '../../constants/project';
import './RecentProjects.css';

const RecentProjects = () => {
  const { data, loading, error } = useQuery(GET_RECENT_PROJECTS, {
    variables: { limit: 5 }
  });

  if (loading) return <LoadingSpinner size="small" />;
  if (error) return null;

  const projects = data?.projects?.items || [];

  return (
    <div className="recent-projects">
      <div className="recent-projects-header">
        <div className="recent-projects-title">
          <Clock size={16} />
          <h3>Proyectos Recientes</h3>
        </div>
        <ReactRouter.Link to="/projects" className="view-all-link">
          Ver todos
          <ChevronRight size={16} />
        </ReactRouter.Link>
      </div>

      <div className="recent-projects-list">
        {projects.map((project) => (
          <ReactRouter.Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="project-item"
          >
            <div className="project-icon">
              <Folder size={16} />
            </div>
            <div className="project-info">
              <span className="project-title">{project.title}</span>
              <div className="project-meta">
                <span className={`project-type ${typeClasses[project.type]}`}>
                  {typeLabels[project.type]}
                </span>
                <span className="project-date">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </ReactRouter.Link>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;