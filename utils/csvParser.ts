
export const parseCSV = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          reject(new Error('File is empty or could not be read.'));
          return;
        }
        // Basic CSV parsing: assumes URLs are in the first column, or one URL per line if no commas.
        // This is a very simple parser. For robust CSV, use a library like PapaParse.
        const lines = text.split(/\r\n|\n/);
        const urls: string[] = [];
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            // Take the first "cell" if comma-separated, otherwise the whole line
            const firstCell = trimmedLine.split(',')[0].trim();
            // Basic URL validation (very loose)
            if (firstCell.startsWith('http://') || firstCell.startsWith('https://')) {
              try {
                // More robust check by trying to construct a URL object
                new URL(firstCell);
                urls.push(firstCell);
              } catch (e) {
                console.warn(`Skipping invalid URL from CSV: ${firstCell}`);
              }
            } else if (urls.length === 0 && lines.length === 1 && !trimmedLine.includes(',')) {
              // Special case: if it's a single line with no http/https and no commas,
              // assume it might be a list of URLs separated by newlines within a single cell, or just a bad entry.
              // For now, we only take valid URLs.
            }
          }
        });
        if (urls.length === 0) {
            reject(new Error('No valid URLs found in the CSV file. Ensure URLs start with http:// or https:// and are in the first column or one per line.'));
            return;
        }
        resolve(urls);
      } catch (error) {
        reject(new Error(`Error parsing CSV file: ${(error as Error).message}`));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    reader.readAsText(file);
  });
};
