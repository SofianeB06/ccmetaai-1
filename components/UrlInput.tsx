
import React, { useState, useRef } from 'react';
import { useTranslation } from '../i18n.tsx';

interface UrlInputProps {
  onUrlsSubmit: (urls: string[]) => void;
  onFileSubmit: (file: File) => void;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onUrlsSubmit, onFileSubmit, disabled }) => {
  const { t } = useTranslation();
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitText = () => {
    if (textInput.trim() === '') return;
    const urls = textInput.split('\n').map(url => url.trim()).filter(url => url !== '');
    onUrlsSubmit(urls);
    setTextInput('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSubmit(event.target.files[0]);
      if(fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="url-textarea" className="block text-sm font-medium text-bggray-700 dark:text-bggray-300 mb-1">
          {t('enterUrls')}
        </label>
        <textarea
          id="url-textarea"
          rows={5}
          className="w-full p-3 border border-bggray-300 dark:border-bggray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-bggray-700 dark:text-white disabled:opacity-50"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="https://example.com/page1&#x0a;https://example.com/page2"
          disabled={disabled}
        />
        <button
          onClick={handleSubmitText}
          disabled={disabled || textInput.trim() === ''}
          className="mt-3 w-full sm:w-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('addUrls')}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-bggray-300 dark:border-bggray-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-white dark:bg-bggray-800 text-sm text-bggray-500 dark:text-bggray-400">{t('or')}</span>
        </div>
      </div>

      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-bggray-700 dark:text-bggray-300 mb-1">
          {t('importFromCsv')}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-bggray-300 dark:border-bggray-600 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-bggray-400 dark:text-bggray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-bggray-600 dark:text-bggray-400">
              <label
                htmlFor="file-upload-input"
                className={`relative cursor-pointer bg-white dark:bg-bggray-800 rounded-md font-medium text-primary-600 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 dark:focus-within:ring-offset-bggray-800 focus-within:ring-primary-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{t('uploadFile')}</span>
                <input id="file-upload-input" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} ref={fileInputRef} disabled={disabled} />
              </label>
              <p className="pl-1">{t('orDragAndDrop')}</p>
            </div>
            <p className="text-xs text-bggray-500 dark:text-bggray-500">{t('csvHint')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
