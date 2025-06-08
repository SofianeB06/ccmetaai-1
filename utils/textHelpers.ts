export const truncateAtWord = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  const slice = text.substring(0, limit);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace === -1) {
    return slice;
  }
  return slice.substring(0, lastSpace).trimEnd();
};

export const SENTENCE_WINDOW = 30;

export const truncateAtSentence = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  const slice = text.substring(0, limit);
  const lastPeriod = Math.max(
    slice.lastIndexOf('.'),
    slice.lastIndexOf('!'),
    slice.lastIndexOf('?')
  );
  const isNearLimit = lastPeriod !== -1 && limit - lastPeriod <= SENTENCE_WINDOW;
  if (isNearLimit) {
    return slice.substring(0, lastPeriod + 1).trim();
  }
  return truncateAtWord(text, limit);
};
