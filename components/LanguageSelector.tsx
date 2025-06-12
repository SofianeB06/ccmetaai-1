import React from 'react';
import { useTranslation } from '../i18n.tsx';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useTranslation();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
      className="border bg-white dark:bg-bggray-800 text-sm rounded-md px-2 py-1"
    >
      <option value="en">EN</option>
      <option value="fr">FR</option>
    </select>
  );
};
