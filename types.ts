
export enum MarketingFramework {
  AIDA = "AIDA",
  PAS = "PAS",
  STDC = "STDC",
  BAB = "BAB",
  FAB = "FAB",
  QUEST = "QUEST",
  NONE = "NONE",
  CUSTOM = "CUSTOM", // For frameworks not in the predefined list but detected by AI
}

export interface FrameworkData {
  name: string;
  color: string;
  description: string;
}

export interface ProcessedUrl {
  id: string;
  url: string;
  status: 'pending' | 'fetching' | 'extracting' | 'detecting' | 'generating' | 'completed' | 'error';
  rawHtmlContent?: string;
  extractedText?: string;
  detectedFramework?: MarketingFramework | string; // Allow string for custom frameworks
  frameworkJustification?: string;
  proposals?: Array<{ title: string; metaDescription: string }>;
  error?: string;
  scrapedContentFileName?: string;
}

export interface MetadataProposal {
  title: string;
  metaDescription: string;
}

export interface DetectedFrameworkInfo {
  framework: MarketingFramework | string;
  justification: string;
}

export interface AppLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'success';
}
