import React from 'react';
// Usamos el patrón de namespace para importar desde react-router
import * as ReactRouter from 'react-router';
const { useNavigate } = ReactRouter;
import './Subtitle.css';

const ButtonPlus = ({ onClick }) => {
  return (
    <button 
      className="button-plus"
      onClick={onClick}
      aria-label="Create new project"
    >
      +
    </button>
  );
};

const Subtitle = ({ title = "Projects", route = "/projects/create" }) => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate(route);
  };

  return (
    <div className="subtitle-container">
      <h2 className="subtitle-text">{title}</h2>
      <ButtonPlus onClick={handleCreateNew} />
    </div>
  );
};

export default Subtitle;