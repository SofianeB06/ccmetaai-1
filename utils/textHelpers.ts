export const truncateAtWord = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  const slice = text.substring(0, limit);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace === -1) {
    return slice;
  }
  return slice.substring(0, lastSpace).trimEnd();
};
