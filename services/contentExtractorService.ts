
import { CORS_PROXY_URL } from '../constants';

// Fetches HTML content from a URL using a CORS proxy.
export const fetchHtml = async (url: string): Promise<string> => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL: Must start with http:// or https://');
  }
  const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch content for ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching HTML for ${url}:`, error);
    throw new Error(`Network error or CORS proxy issue fetching ${url}. The public proxy may be rate-limiting or the site may block proxies. Details: ${(error as Error).message}`);
  }
};

// Extracts main text content from HTML string.
// This is a simplified extraction. For robust extraction, more sophisticated libraries might be needed.
export const extractTextContent = (htmlString: string, sourceUrl: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Remove script and style elements
    doc.querySelectorAll('script, style, link[rel="stylesheet"], noscript, iframe, svg, [aria-hidden="true"]').forEach(el => el.remove());
    
    // Attempt to find main content areas
    let mainContentElement = doc.querySelector('main') || doc.querySelector('article') || doc.querySelector('[role="main"]');
    
    // If no specific main area, fall back to body, but try to be smarter
    if (!mainContentElement) {
        mainContentElement = doc.body;
    }

    // Heuristic: Remove common non-content sections like headers, footers, navs from the targeted element
    // This is aggressive and might remove desired content on some sites.
    if (mainContentElement) {
        mainContentElement.querySelectorAll('header, footer, nav, aside, .header, .footer, .sidebar, .menu, .nav, #header, #footer, #sidebar, #menu, #nav').forEach(el => el.remove());
    }
    
    let text = mainContentElement?.textContent || '';

    // Clean up whitespace
    text = text.replace(/\s\s+/g, ' ').trim(); // Replace multiple spaces/newlines with a single space

    if (text.length < 100 && doc.body.textContent) { // If extracted text is too short, try body
        let bodyText = doc.body.textContent || '';
        bodyText = bodyText.replace(/\s\s+/g, ' ').trim();
        if (bodyText.length > text.length) text = bodyText;
    }

    if (!text) {
        console.warn(`Could not extract significant text from ${sourceUrl}. The page might be JavaScript-rendered or have unusual structure.`);
        return "No meaningful text content could be extracted from this URL. It might be heavily reliant on JavaScript for rendering, or the structure is unconventional.";
    }

    return text;
  } catch (error) {
    console.error(`Error parsing HTML or extracting text from ${sourceUrl}:`, error);
    throw new Error(`Failed to process HTML content from ${sourceUrl}.`);
  }
};
