import React from 'react';
import { useQuery } from '@apollo/client';
import { Clock, ChevronRight, Folder } from 'lucide-react';

import { LoadingSpinner } from '@components/common/LoadingScreen';
import { ContextualLink } from '@components/common/ContextualLink';
import { GET_RECENT_PROJECTS } from '../../apollo/project';
import { typeLabels, typeClasses } from '../../constants/project';

import './css/RecentProjects.css';

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
        <ContextualLink to="projects" className="view-all-link">
          Ver todos
          <ChevronRight size={16} />
        </ContextualLink>
      </div>

      <div className="recent-projects-list">
        {projects.map((project) => (
          <ContextualLink
            key={project.id}
            to={`${project.id}`}
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
          </ContextualLink>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;