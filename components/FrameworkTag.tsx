
import React from 'react';

interface FrameworkTagProps {
  frameworkName: string;
  color: string;
}

export const FrameworkTag: React.FC<FrameworkTagProps> = ({ frameworkName, color }) => {
  return (
    <span 
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color} text-white shadow-sm`}
      title={frameworkName}
    >
      {frameworkName}
    </span>
  );
};
