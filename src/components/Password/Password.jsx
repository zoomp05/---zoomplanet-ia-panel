import React, { useState } from 'react';
import { Input } from 'antd';
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

/**
 * Componente Password reutilizable con indicador de fortaleza
 * @param {Object} props - Props del componente
 * @param {string} props.placeholder - Placeholder del input
 * @param {boolean} props.showStrength - Mostrar indicador de fortaleza
 * @param {number} props.minLength - Longitud mínima requerida
 * @param {boolean} props.requireSpecialChar - Requerir caracteres especiales
 * @param {boolean} props.requireNumber - Requerir números
 * @param {boolean} props.requireUppercase - Requerir mayúsculas
 * @param {string} props.size - Tamaño del input (large, middle, small)
 * @param {Object} props.style - Estilos personalizados
 * @param {Function} props.onChange - Callback cuando cambia el valor
 * @param {string} props.value - Valor controlado
 * @param {string} props.autoComplete - Atributo autoComplete
 */
const Password = ({
  placeholder = "Contraseña",
  showStrength = false,
  minLength = 6,
  requireSpecialChar = false,
  requireNumber = false,
  requireUppercase = false,
  size = "large",
  style = {},
  onChange,
  value,
  autoComplete = "current-password",
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

  const calculateStrength = (password) => {
    if (!password) return { strength: 0, text: '' };

    let score = 0;
    const checks = {
      length: password.length >= minLength,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>\-_]/.test(password)
    };

    // Puntuación base
    if (checks.length) score += 20;
    if (checks.hasLower) score += 15;
    if (checks.hasUpper) score += 15;
    if (checks.hasNumber) score += 20;
    if (checks.hasSpecial) score += 30;

    // Determinar texto y color
    let text = '';
    let color = '';
    
    if (score < 30) {
      text = 'Muy débil';
      color = '#ff4d4f';
    } else if (score < 50) {
      text = 'Débil';
      color = '#ff7a00';
    } else if (score < 70) {
      text = 'Media';
      color = '#faad14';
    } else if (score < 90) {
      text = 'Fuerte';
      color = '#52c41a';
    } else {
      text = 'Muy fuerte';
      color = '#389e0d';
    }

    return { strength: score, text, color };
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (showStrength) {
      const { strength: newStrength, text, color } = calculateStrength(newValue);
      setStrength(newStrength);
      setStrengthText(text);
    }

    if (onChange) {
      onChange(e);
    }
  };

  const getValidationRules = () => {
    const rules = [
      { required: true, message: `Por favor ingresa tu ${placeholder.toLowerCase()}` },
      { min: minLength, message: `La contraseña debe tener al menos ${minLength} caracteres` }
    ];

    if (requireNumber) {
      rules.push({
        pattern: /\d/,
        message: 'La contraseña debe contener al menos un número'
      });
    }

    if (requireUppercase) {
      rules.push({
        pattern: /[A-Z]/,
        message: 'La contraseña debe contener al menos una mayúscula'
      });
    }

    if (requireSpecialChar) {
      rules.push({
        pattern: /[!@#$%^&*(),.?":{}|<>\-_]/,
        message: 'La contraseña debe contener al menos un carácter especial'
      });
    }

    return rules;
  };

  const suffix = (
    <span
      onClick={() => setVisible(!visible)}
      style={{ cursor: 'pointer', color: '#bfbfbf' }}
    >
      {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
    </span>
  );

  return (
    <div style={{ width: '100%' }}>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        prefix={<LockOutlined />}
        suffix={suffix}
        placeholder={placeholder}
        size={size}
        style={style}
        onChange={handleChange}
        value={value}
        autoComplete={autoComplete}
      />
      
      {showStrength && value && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '12px'
          }}>
            <div style={{
              flex: 1,
              height: '6px',
              backgroundColor: '#f0f0f0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${strength}%`,
                  backgroundColor: calculateStrength(value).color,
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            <span style={{ 
              color: calculateStrength(value).color,
              fontWeight: 'bold',
              minWidth: '70px'
            }}>
              {strengthText}
            </span>
          </div>
          
          {/* Ayuda contextual */}
          {strength < 70 && (
            <div style={{ 
              marginTop: '4px', 
              fontSize: '11px', 
              color: '#8c8c8c' 
            }}>
              Recomendado: {minLength}+ caracteres, mayúsculas, números y símbolos (incluyendo -)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Para usar como Form.Item con reglas automáticas
Password.getRules = (options = {}) => {
  const {
    minLength = 6,
    requireNumber = false,
    requireUppercase = false,
    requireSpecialChar = false,
    fieldName = 'contraseña'
  } = options;

  const rules = [
    { required: true, message: `Por favor ingresa tu ${fieldName}` },
    { min: minLength, message: `La ${fieldName} debe tener al menos ${minLength} caracteres` }
  ];

  if (requireNumber) {
    rules.push({
      pattern: /\d/,
      message: `La ${fieldName} debe contener al menos un número`
    });
  }

  if (requireUppercase) {
    rules.push({
      pattern: /[A-Z]/,
      message: `La ${fieldName} debe contener al menos una mayúscula`
    });
  }

  if (requireSpecialChar) {
    rules.push({
      pattern: /[!@#$%^&*(),.?":{}|<>\-_]/,
      message: `La ${fieldName} debe contener al menos un carácter especial`
    });
  }

  return rules;
};

export default Password;
