
import React from 'react';
import { AppLog } from '../types';
import { useTranslation } from '../i18n';

interface LogModalProps {
  logs: AppLog[];
  onClose: () => void;
}

const LogEntry: React.FC<{ log: AppLog }> = ({ log }) => {
  let textColor = '';
  let icon = 'ℹ️';
  switch (log.type) {
    case 'error':
      textColor = 'text-red-700 dark:text-red-400';
      icon = '❌';
      break;
    case 'success':
      textColor = 'text-green-700 dark:text-green-400';
      icon = '✅';
      break;
    case 'info':
    default:
      textColor = 'text-bggray-700 dark:text-bggray-300';
      icon = 'ℹ️';
      break;
  }

  return (
    <div className={`p-2 border-b border-bggray-200 dark:border-bggray-700 last:border-b-0 ${textColor}`}>
      <span className="mr-2">{icon}</span>
      <span className="text-xs mr-2 text-bggray-500 dark:text-bggray-400">
        [{log.timestamp.toLocaleTimeString()}]
      </span>
      <span>{log.message}</span>
    </div>
  );
};

export const LogModal: React.FC<LogModalProps> = ({ logs, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-bggray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-bggray-200 dark:border-bggray-700">
          <h3 className="text-lg font-semibold text-bggray-800 dark:text-bggray-100">{t('applicationLogs')}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-bggray-400 hover:text-bggray-600 dark:hover:text-bggray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('close') + ' logs'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex-grow">
          {logs.length === 0 ? (
            <p className="text-bggray-500 dark:text-bggray-400 text-center py-4">{t('noLogs')}</p>
          ) : (
            <div className="space-y-1">
              {logs.slice().reverse().map((log, index) => ( // Show newest logs first
                <LogEntry key={`${log.timestamp.toISOString()}-${index}`} log={log} />
              ))}
            </div>
          )}
        </div>
         <div className="p-4 border-t border-bggray-200 dark:border-bggray-700 text-right">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75"
            >
                {t('close')}
            </button>
        </div>
      </div>
    </div>
  );
};
