export const truncateAtWord = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  const slice = text.substring(0, limit);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace === -1) {
    return slice;
  }
  return slice.substring(0, lastSpace).trimEnd();
};

export const truncateAtSentence = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  const slice = text.substring(0, limit);
  const lastPeriod = Math.max(slice.lastIndexOf('.'), slice.lastIndexOf('!'), slice.lastIndexOf('?'));
  if (lastPeriod !== -1 && lastPeriod >= 0) {
    return slice.substring(0, lastPeriod + 1).trim();
  }
  return truncateAtWord(text, limit);
};
