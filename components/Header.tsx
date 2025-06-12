
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../i18n.tsx';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onViewLogs: () => void;
  logCount: number;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode, onViewLogs, logCount }) => {
  const { t } = useTranslation();
  return (
    <header className="bg-white dark:bg-bggray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-500">
            <path d="M12.47 4.5A2.94 2.94 0 0 0 10 6.24V17.7a2.47 2.47 0 0 0-1.07-2.14c-.9-.63-1.93-.45-2.43.48-.52.96.15 2.18 1.1 2.81.87.58 1.9.6 2.4.04.5-.57-.15-1.8-1.1-2.43-.87-.58-1.9-.6-2.4-.04a1 1 0 0 0-.48 1.36c.33.64.96.96 1.63.96h2.29a2.47 2.47 0 0 0 2.47-2.47V6.8a2.94 2.94 0 0 0 2.47-2.3 2.94 2.94 0 0 0-2.47-3A2.94 2.94 0 0 0 10 3.77a2.94 2.94 0 0 0-2.47-2.3 2.94 2.94 0 0 0-2.47 3c0 .32.05.64.14.93"/>
            <path d="M14 10.23V17.7a2.47 2.47 0 0 1-1.07-2.14c-.9-.63-1.93-.45-2.43.48-.52.96.15 2.18 1.1 2.81.87.58 1.9.6 2.4.04.5-.57-.15-1.8-1.1-2.43-.87-.58-1.9-.6-2.4-.04a1 1 0 0 1-.48 1.36c.33.64.96.96 1.63.96h2.29a2.47 2.47 0 0 1 2.47-2.47V6.18"/>
           </svg>
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-500">CCMeta.ai</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onViewLogs}
            className="relative p-2 rounded-full hover:bg-bggray-100 dark:hover:bg-bggray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
            aria-label={t('viewLogs')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bggray-600 dark:text-bggray-300">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {logCount > 0 && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                {/* Visual indicator, no number to keep it clean */}
              </span>
            )}
          </button>
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};
