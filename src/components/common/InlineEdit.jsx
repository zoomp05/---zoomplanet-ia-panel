import React, { useState, useEffect, useRef } from 'react';
import './InlineEdit.css';

export const InlineEdit = ({
  type = 'text',
  value,
  onChange,
  isModified = false,
  options = [],
  defaultLabel = '',
  className = '',
  onBlur,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('value ', value);
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onBlur) onBlur();
  };

  const getDisplayValue = () => {
    if (type === 'password') return '••••••••';
    
    if (type === 'select') {
      if (!value) return 'Seleccione...';
      
      const option = options.find(opt => opt.value === value);
      if (option) return option.label;
      
      return defaultLabel || value;
    }

    return value || '';
  };

  const renderInput = () => {
    const commonProps = {
      ref: inputRef,
      value: editValue || '',
      onChange: handleChange,
      onBlur: () => {
        setIsEditing(false);
        if (onBlur) onBlur();
      },
      className: `inline-edit-input ${type} ${isModified ? 'modified' : ''}`
    };  

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Seleccione una opción</option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      case 'password':
        return <input {...commonProps} type="password" />;
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  const containerClassName = `inline-edit ${className} ${isModified ? 'modified' : ''} ${isEditing ? 'editing' : ''}`;
  const displayClassName = `inline-edit-display ${type} ${isModified ? 'modified' : ''}`;

  return (
    <div className={containerClassName}>
      {isEditing ? (
        renderInput()
      ) : (
        <div 
          className={displayClassName}
          onClick={handleEdit}
          role="button"
          tabIndex={0}
        >
          {getDisplayValue()}
        </div>
      )}
    </div>
  );
};