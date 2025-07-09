
import { MarketingFramework, FrameworkData } from './types';

export const MAX_TITLE_LENGTH = 65;
export const MAX_META_DESC_LENGTH = 155;

// Maximum number of URLs processed in parallel. Can be overridden via env var CONCURRENCY_LIMIT
export const CONCURRENCY_LIMIT = parseInt(process.env.CONCURRENCY_LIMIT || '3', 10);

export const FRAMEWORK_DETAILS: Record<MarketingFramework | string, FrameworkData> = {
  [MarketingFramework.AIDA]: { name: "AIDA", color: "bg-red-500", description: "Attention, Interest, Desire, Action." },
  [MarketingFramework.PAS]: { name: "PAS", color: "bg-blue-600", description: "Problem, Agitate, Solution." },
  [MarketingFramework.STDC]: { name: "STDC", color: "bg-green-500", description: "See, Think, Do, Care." },
  [MarketingFramework.BAB]: { name: "BAB", color: "bg-yellow-500", description: "Before, After, Bridge." },
  [MarketingFramework.FAB]: { name: "FAB", color: "bg-purple-500", description: "Features, Advantages, Benefits." },
  [MarketingFramework.QUEST]: { name: "QUEST", color: "bg-pink-500", description: "Qualify, Understand, Educate, Stimulate, Transition." },
  [MarketingFramework.NONE]: { name: "N/A", color: "bg-bggray-400", description: "No specific framework detected or general purpose." },
  [MarketingFramework.CUSTOM]: { name: "Custom", color: "bg-teal-500", description: "AI detected a specific strategy."}
};

export const ALL_MARKETING_FRAMEWORKS_FOR_DETECTION = [
  { name: "AIDA", description: "Attention, Interest, Desire, Action. Used to guide customers through stages from awareness to purchase." },
  { name: "PAS", description: "Problem, Agitate, Solution. Highlights a problem, intensifies it, then offers the solution." },
  { name: "STDC", description: "See, Think, Do, Care. A content marketing framework mapping content to customer journey stages." },
  { name: "BAB", description: "Before, After, Bridge. Shows the current state (Before), a better state (After), and how to get there (Bridge)." },
  { name: "FAB", description: "Features, Advantages, Benefits. Focuses on product aspects, what they do, and how they help the customer." },
  { name: "QUEST", description: "Qualify, Understand, Educate, Stimulate, Transition. A sales framework adaptable to content strategy." }
];

export const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url=';
// Alternative: 'https://corsproxy.io/?'
// Note: Public CORS proxies are for development/demonstration and may have limitations.
// A dedicated backend proxy is recommended for production.
