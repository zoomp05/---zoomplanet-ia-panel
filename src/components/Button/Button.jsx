// /src/components/Button/Button.js
import React from 'react';
import './Button.css';

const Button = ({ onClick, children, loading }) => {
  return (
    <button className="main-button" onClick={onClick} disabled={loading}>
      {loading ? <div className="loader"></div> : children}
    </button>
  );
};

export default Button;
