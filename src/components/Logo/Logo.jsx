import React from "react";
import "./Logo.css";
import defaultImage from "./Logo.png"; // Importa la imagen local

export default function Logo({ src }) {
  const defaultSrc = defaultImage;
  
  return (
    <img
      src={src || defaultSrc}
      alt="Not Found"
      className="logo"
    />
  );
}