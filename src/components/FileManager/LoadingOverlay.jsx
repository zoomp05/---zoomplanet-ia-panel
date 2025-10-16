import React from 'react';
import { Loader } from 'lucide-react';

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="file-manager-loading-overlay">
      <Loader className="animate-spin" size={24} />
    </div>
  );
};

export default LoadingOverlay;
