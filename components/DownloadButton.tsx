
import React from 'react';

interface DownloadButtonProps {
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick, tooltip, children, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      title={tooltip}
    >
      {children}
    </button>
  );
};
