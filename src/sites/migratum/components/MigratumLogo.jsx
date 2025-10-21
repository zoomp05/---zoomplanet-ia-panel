import React from "react";
import logoImage from "../assets/img/Logo1_LetraBlanca.png";

/**
 * Componente Logo para Migratum
 * Muestra el logo con letra blanca para fondos oscuros
 * 
 * @param {Object} props
 * @param {string} props.size - Tamaño del logo: 'small', 'medium', 'large'
 * @param {string} props.height - Altura personalizada del logo
 * @param {string} props.width - Ancho personalizado del logo
 */
const MigratumLogo = ({ size = 'medium', height, width, style = {} }) => {
  // Definir tamaños predefinidos
  const sizeMap = {
    small: { height: '28px', width: 'auto' },
    medium: { height: '40px', width: 'auto' },
    large: { height: '60px', width: 'auto' }
  };

  // Obtener dimensiones
  const dimensions = height || width 
    ? { height, width: width || 'auto' }
    : sizeMap[size] || sizeMap.medium;

  return (
    <img
      src={logoImage}
      alt="Migratum Logo"
      style={{
        ...dimensions,
        objectFit: 'contain',
        ...style
      }}
    />
  );
};

export default MigratumLogo;
