
import React from 'react';
import { ProcessedUrl } from '../types';
import { UrlRow } from './UrlRow';
import { useTranslation } from '../i18n';

interface UrlProcessTableProps {
  urls: ProcessedUrl[];
  onDeleteUrl: (id: string) => void;
  onDownloadScrapedText: (urlData: ProcessedUrl) => void;
  onRetryUrl: (id: string) => void;
  onRegenerateUrl: (id: string) => void;
}

export const UrlProcessTable: React.FC<UrlProcessTableProps> = ({ urls, onDeleteUrl, onDownloadScrapedText, onRetryUrl, onRegenerateUrl }) => {
  const { t } = useTranslation();
  if (urls.length === 0) {
    return (
      <div className="text-center py-10 text-bggray-500 dark:text-bggray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-bggray-400 dark:text-bggray-500">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-xl font-semibold">{t('noUrls')}</p>
        <p>{t('addUrlsToStart')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-bggray-800 shadow-xl rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-bggray-200 dark:divide-bggray-700">
        <thead className="bg-bggray-50 dark:bg-bggray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-bggray-500 dark:text-bggray-300 uppercase tracking-wider">{t('url')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-bggray-500 dark:text-bggray-300 uppercase tracking-wider">{t('status')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-bggray-500 dark:text-bggray-300 uppercase tracking-wider">{t('framework')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-bggray-500 dark:text-bggray-300 uppercase tracking-wider">{t('proposals')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-bggray-500 dark:text-bggray-300 uppercase tracking-wider">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-bggray-800 divide-y divide-bggray-200 dark:divide-bggray-700">
          {urls.map(urlData => (
          <UrlRow
            key={urlData.id}
            urlData={urlData}
            onDelete={onDeleteUrl}
            onDownloadScrapedText={onDownloadScrapedText}
            onRetry={onRetryUrl}
            onRegenerate={onRegenerateUrl}
          />
          ))}
        </tbody>
      </table>
    </div>
  );
};
