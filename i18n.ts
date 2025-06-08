import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en';
import fr from './locales/fr';

type Language = 'en' | 'fr';

const resources = { en, fr } as const;

const detectBrowserLanguage = (): Language => {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.split('-')[0];
    if (lang === 'fr') return 'fr';
  }
  return 'en';
};

interface I18nContextProps {
  t: (key: keyof typeof en, vars?: Record<string, string | number>) => string;
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextProps>({
  t: (k) => (resources.en as any)[k] ?? k,
  lang: 'en',
  setLang: () => {}
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(detectBrowserLanguage());

  const t = (key: keyof typeof en, vars?: Record<string, string | number>) => {
    const str = (resources[lang] as any)[key] ?? (resources.en as any)[key] ?? key;
    if (vars) {
      return str.replace(/{{(.*?)}}/g, (_, v) => String(vars[v] ?? ''));
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
