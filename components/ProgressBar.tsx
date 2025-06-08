
import React from 'react';
import { useTranslation } from '../i18n';

interface ProgressBarProps {
  progress: number;
  currentProcessingUrls?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, currentProcessingUrls }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-bggray-200 dark:bg-bggray-700 rounded-full h-6 shadow-inner overflow-hidden">
      <div
        className="bg-primary-600 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300 ease-out"
        style={{ width: `${Math.max(progress, 5)}%` }} // Ensure minimum width for text visibility
      >
        {progress.toFixed(0)}%
      </div>
      {currentProcessingUrls && currentProcessingUrls.length > 0 && progress < 100 && (
         <p className="text-xs text-bggray-600 dark:text-bggray-300 mt-1 text-center">
           {t('processing')} <span className="font-semibold truncate inline-block max-w-sm align-bottom">
             {currentProcessingUrls.length === 1 ? currentProcessingUrls[0] : `${currentProcessingUrls.length} URLs`}
           </span>
         </p>
      )}
       {progress === 100 && (!currentProcessingUrls || currentProcessingUrls.length === 0) && (
         <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center font-semibold">
           {t('allProcessed')}
         </p>
      )}
    </div>
  );
};
