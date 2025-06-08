
import React from 'react';
import { ProcessedUrl, MarketingFramework, MetadataProposal } from '../types';
import { FRAMEWORK_DETAILS, MAX_TITLE_LENGTH, MAX_META_DESC_LENGTH } from '../constants';
import { Spinner } from './Spinner';
import { FrameworkTag } from './FrameworkTag';
import { CharCounter } from './CharCounter';
import { DownloadButton } from './DownloadButton';
import { CopyButton } from './CopyButton';

interface UrlRowProps {
  urlData: ProcessedUrl;
  onDelete: (id: string) => void;
  onDownloadScrapedText: (urlData: ProcessedUrl) => void;
  onRetry: (id: string) => void;
  onRegenerate: (id: string) => void;
}

const getStatusColor = (status: ProcessedUrl['status']): string => {
  switch (status) {
    case 'pending': return 'text-bggray-500 dark:text-bggray-400';
    case 'fetching':
    case 'extracting':
    case 'detecting':
    case 'generating':
      return 'text-blue-500 dark:text-blue-400';
    case 'completed': return 'text-green-500 dark:text-green-400';
    case 'error': return 'text-red-500 dark:text-red-400';
    default: return 'text-bggray-700 dark:text-bggray-200';
  }
};

const StatusDisplay: React.FC<{ status: ProcessedUrl['status'] }> = ({ status }) => {
  const isLoading = ['fetching', 'extracting', 'detecting', 'generating'].includes(status);
  return (
    <div className={`flex items-center space-x-2 ${getStatusColor(status)}`}>
      {isLoading && <Spinner size="small" />}
      <span className="capitalize">{status}</span>
    </div>
  );
};

const ProposalItem: React.FC<{ proposal: MetadataProposal, index: number }> = ({ proposal, index }) => {
  return (
    <div className="py-2 border-b border-bggray-200 dark:border-bggray-700 last:border-b-0">
      <div className="font-semibold text-sm text-bggray-800 dark:text-bggray-100">Proposal {index + 1}</div>
      <div className="mt-1 flex items-start space-x-2">
        <div className="flex-1">
          <p className="text-xs text-bggray-600 dark:text-bggray-300">Title:</p>
          <p className="text-sm break-words">{proposal.title}</p>
          <CharCounter count={proposal.title.length} limit={MAX_TITLE_LENGTH} />
        </div>
        <CopyButton text={proposal.title} tooltip="Copy Title" />
      </div>
      <div className="mt-1 flex items-start space-x-2">
        <div className="flex-1">
          <p className="text-xs text-bggray-600 dark:text-bggray-300">Meta Description:</p>
          <p className="text-sm break-words">{proposal.metaDescription}</p>
          <CharCounter count={proposal.metaDescription.length} limit={MAX_META_DESC_LENGTH} />
        </div>
        <CopyButton text={proposal.metaDescription} tooltip="Copy Description" />
      </div>
    </div>
  );
};

export const UrlRow: React.FC<UrlRowProps> = ({ urlData, onDelete, onDownloadScrapedText, onRetry, onRegenerate }) => {
  const { id, url, status, detectedFramework, frameworkJustification, proposals, error } = urlData;

  const frameworkDetailKey = detectedFramework && Object.values(MarketingFramework).includes(detectedFramework as MarketingFramework) 
    ? detectedFramework as MarketingFramework 
    : MarketingFramework.CUSTOM;

  const frameworkInfo = detectedFramework ? FRAMEWORK_DETAILS[frameworkDetailKey] || {...FRAMEWORK_DETAILS[MarketingFramework.CUSTOM], name: detectedFramework } : null;

  return (
    <tr className="hover:bg-bggray-50 dark:hover:bg-bggray-700/50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-bggray-900 dark:text-bggray-100 truncate max-w-xs" title={url}>{url}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusDisplay status={status} />
        {status === 'error' && error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1 max-w-xs truncate" title={error}>{error}</p>
        )}
      </td>
      <td className="px-6 py-4">
        {frameworkInfo && (
          <div className="space-y-1">
            <FrameworkTag frameworkName={frameworkInfo.name} color={frameworkInfo.color} />
            {frameworkJustification && (
              <p className="text-xs text-bggray-500 dark:text-bggray-400 italic max-w-xs" title={frameworkJustification}>
                {frameworkJustification}
              </p>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {proposals && proposals.length > 0 ? (
          <div className="space-y-2 max-w-md">
            {proposals.map((p, index) => (
              <ProposalItem key={index} proposal={p} index={index} />
            ))}
          </div>
        ) : (
          status === 'completed' && <span className="text-xs text-bggray-500 dark:text-bggray-400">No proposals generated.</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          {urlData.extractedText && urlData.scrapedContentFileName && status !== 'pending' && (
            <DownloadButton
              onClick={() => onDownloadScrapedText(urlData)}
              tooltip="Download Scraped Text (.txt)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </DownloadButton>
          )}
          {status === 'completed' && (
            <button
              onClick={() => onRegenerate(id)}
              className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-150"
              title="Regenerate Metadata"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
          )}
          {status === 'error' && (
             <button
              onClick={() => onRetry(id)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
              title="Retry Processing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
            title="Delete URL"
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </td>
    </tr>
  );
};
