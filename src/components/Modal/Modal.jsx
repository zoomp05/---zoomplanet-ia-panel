// /src/components/Modal/Modal.js
import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="main-modal-overlay">
      <div className="main-modal">
        <button className="main-modal-close" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
