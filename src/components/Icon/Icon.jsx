import React from "react";
import "./Icon.css";

export default function Icon({ src }) {
  const defaultSrc = "https://firebasestorage.googleapis.com/v0/b/unify-v3-copy.appspot.com/o/q4hhttex6xl-241%3A45?alt=media&token=96012b1b-e8ec-4e11-bdd7-88ed8caa1a24";
  
  return (
    <img
      src={src || defaultSrc}
      alt="Not Found"
      className="icon"
    />
  );
}
