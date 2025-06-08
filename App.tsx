
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { UrlProcessTable } from './components/UrlProcessTable';
import { ProgressBar } from './components/ProgressBar';
import { LogModal } from './components/LogModal';
import { useDarkMode } from './hooks/useDarkMode';
import { ProcessedUrl, MarketingFramework, AppLog } from './types';
import { fetchHtml, extractTextContent } from './services/contentExtractorService';
import { detectFramework, generateMetadata } from './services/geminiService';
import { CONCURRENCY_LIMIT } from './constants';
import { parseCSV } from './utils/csvParser';
import { downloadFile } from './utils/fileDownloader';

const App: React.FC = () => {
  const [processedUrls, setProcessedUrls] = useState<ProcessedUrl[]>([]);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]); // Array of URL IDs
  const [activeIds, setActiveIds] = useState<string[]>([]); // Currently processing URL IDs
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [darkMode, toggleDarkMode] = useDarkMode();

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prevLogs => [...prevLogs, { message, type, timestamp: new Date() }]);
  }, []);
  
  const updateUrlStatus = useCallback((id: string, updates: Partial<ProcessedUrl>) => {
    setProcessedUrls(prev => 
      prev.map(urlObj => urlObj.id === id ? { ...urlObj, ...updates } : urlObj)
    );
  }, []);

  const processSingleUrl = useCallback(async (urlId: string) => {
    const urlData = processedUrls.find(u => u.id === urlId);
    if (!urlData) {
      addLog(`URL data not found for ID: ${urlId}`, 'error');
      return;
    }

    try {
      updateUrlStatus(urlId, { status: 'fetching' });
      addLog(`Fetching content for ${urlData.url}`, 'info');
      const htmlContent = await fetchHtml(urlData.url);
      updateUrlStatus(urlId, { rawHtmlContent: htmlContent, status: 'extracting' });
      addLog(`Extracting text from ${urlData.url}`, 'info');
      const textContent = extractTextContent(htmlContent, urlData.url);
      const scrapedContentFileName = `${urlData.url.replace(/[^a-zA-Z0-9]/g, '_')}_scraped.txt`;
      updateUrlStatus(urlId, { extractedText: textContent, status: 'detecting', scrapedContentFileName });
      addLog(`Detecting marketing framework for ${urlData.url}`, 'info');
      const frameworkResult = await detectFramework(textContent);
      updateUrlStatus(urlId, { 
        detectedFramework: frameworkResult.framework, 
        frameworkJustification: frameworkResult.justification,
        status: 'generating' 
      });
      addLog(`Generating metadata for ${urlData.url} using ${frameworkResult.framework} framework`, 'info');
      const metadataProposals = await generateMetadata(textContent, frameworkResult.framework, frameworkResult.justification);
      updateUrlStatus(urlId, { proposals: metadataProposals, status: 'completed' });
      addLog(`Successfully processed ${urlData.url}`, 'success');
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      updateUrlStatus(urlId, { status: 'error', error: errorMessage });
      addLog(`Error processing ${urlData.url}: ${errorMessage}`, 'error');
    } finally {
      setActiveIds(prev => prev.filter(id => id !== urlId));
    }
  }, [processedUrls, updateUrlStatus, addLog]);


  useEffect(() => {
    if (processingQueue.length === 0) return;

    const availableSlots = CONCURRENCY_LIMIT - activeIds.length;
    if (availableSlots <= 0) return;

    const nextIds = processingQueue.slice(0, availableSlots);
    if (nextIds.length > 0) {
      setActiveIds(prev => [...prev, ...nextIds]);
      setProcessingQueue(prev => prev.slice(nextIds.length));

      nextIds.forEach(id => {
        processSingleUrl(id).catch(() => {}).finally(() => {
          // removal handled in processSingleUrl finally
        });
      });
    }
  }, [processingQueue, activeIds, processSingleUrl]);

  const handleUrlsSubmit = (urls: string[]) => {
    const newProcessedUrls: ProcessedUrl[] = urls
      .filter(url => url.trim() !== "")
      .map(url => ({
        id: `${Date.now()}-${url}-${Math.random().toString(16).slice(2)}`,
        url,
        status: 'pending' as const,
      }));
    
    setProcessedUrls(prev => [...prev, ...newProcessedUrls]);
    setProcessingQueue(prev => [...prev, ...newProcessedUrls.map(u => u.id)]);
    addLog(`Added ${newProcessedUrls.length} URLs to the queue.`, 'info');
  };

  const handleFileSubmit = async (file: File) => {
    try {
      const urls = await parseCSV(file);
      handleUrlsSubmit(urls);
      addLog(`Successfully imported ${urls.length} URLs from ${file.name}`, 'success');
    } catch (error: any) {
      addLog(`Error parsing CSV file: ${error.message}`, 'error');
    }
  };

  const handleDeleteUrl = (id: string) => {
    setProcessedUrls(prev => prev.filter(url => url.id !== id));
    setProcessingQueue(prev => prev.filter(urlId => urlId !== id));
    addLog(`URL removed: ${processedUrls.find(u=>u.id === id)?.url}`, 'info');
  };

  const handleExportResults = () => {
    if (processedUrls.length === 0) {
      addLog('No data to export.', 'info');
      return;
    }
    const headers = ["URL", "Status", "Detected Framework", "Framework Justification", "Title 1", "Meta Description 1", "Title 2", "Meta Description 2", "Title 3", "Meta Description 3", "Error"];
    const rows = processedUrls.map(pUrl => [
      pUrl.url,
      pUrl.status,
      pUrl.detectedFramework || "",
      pUrl.frameworkJustification || "",
      pUrl.proposals?.[0]?.title || "",
      pUrl.proposals?.[0]?.metaDescription || "",
      pUrl.proposals?.[1]?.title || "",
      pUrl.proposals?.[1]?.metaDescription || "",
      pUrl.proposals?.[2]?.title || "",
      pUrl.proposals?.[2]?.metaDescription || "",
      pUrl.error || ""
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadFile(csvContent, 'ccmeta_ai_results.csv', 'text/csv');
    addLog('Results exported to CSV.', 'success');
  };

  const handleDownloadScrapedText = (urlData: ProcessedUrl) => {
    if (urlData.extractedText && urlData.scrapedContentFileName) {
      downloadFile(urlData.extractedText, urlData.scrapedContentFileName, 'text/plain');
      addLog(`Downloaded scraped text for ${urlData.url}`, 'success');
    } else {
      addLog(`No scraped text available for ${urlData.url}`, 'error');
    }
  };
  
  const totalUrls = processedUrls.length;
  const completedUrls = processedUrls.filter(u => u.status === 'completed' || u.status === 'error').length;
  const progress = totalUrls > 0 ? (completedUrls / totalUrls) * 100 : 0;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        onViewLogs={() => setIsLogModalOpen(true)}
        logCount={logs.length}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-bggray-800 shadow-xl rounded-lg p-6 mb-8">
          <UrlInput onUrlsSubmit={handleUrlsSubmit} onFileSubmit={handleFileSubmit} disabled={activeIds.length > 0 || processingQueue.length > 0} />
        </div>
        
        {(activeIds.length > 0 || processingQueue.length > 0 || totalUrls > 0) && (
          <div className="my-8">
            <ProgressBar progress={progress} currentProcessingUrls={processedUrls.filter(u => activeIds.includes(u.id)).map(u => u.url)} />
          </div>
        )}

        <UrlProcessTable 
          urls={processedUrls} 
          onDeleteUrl={handleDeleteUrl}
          onDownloadScrapedText={handleDownloadScrapedText}
          onRetryUrl={(urlId) => {
            const urlToRetry = processedUrls.find(u => u.id === urlId);
            if (urlToRetry) {
              updateUrlStatus(urlId, { status: 'pending', error: undefined, proposals: undefined, detectedFramework: undefined, frameworkJustification: undefined });
              setProcessingQueue(prev => [...prev, urlId]);
              addLog(`Retrying URL: ${urlToRetry.url}`, 'info');
            }
          }}
        />
        
        {processedUrls.length > 0 && (
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleExportResults}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
                >
                    Export All Results (CSV)
                </button>
            </div>
        )}

      </main>
      <footer className="text-center py-4 text-sm text-bggray-500 dark:text-bggray-400 border-t border-bggray-200 dark:border-bggray-700">
        CCMeta.ai &copy; {new Date().getFullYear()}. For demonstration purposes. Content fetching uses a public proxy and may be unreliable for some sites.
      </footer>
      {isLogModalOpen && <LogModal logs={logs} onClose={() => setIsLogModalOpen(false)} />}
    </div>
  );
};

export default App;
