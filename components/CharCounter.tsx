
import React from 'react';

interface CharCounterProps {
  count: number;
  limit: number;
}

export const CharCounter: React.FC<CharCounterProps> = ({ count, limit }) => {
  const isOverLimit = count > limit;
  const colorClass = isOverLimit 
    ? 'text-red-500 dark:text-red-400' 
    : (count > limit * 0.9 ? 'text-yellow-500 dark:text-yellow-400' : 'text-bggray-500 dark:text-bggray-400');

  return (
    <span className={`text-xs ml-1 ${colorClass}`}>
      ({count}/{limit})
    </span>
  );
};
