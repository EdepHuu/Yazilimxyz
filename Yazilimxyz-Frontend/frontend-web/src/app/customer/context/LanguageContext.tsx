'use client';
import React, { createContext, useContext, useState } from 'react';
import tr from '../locales/tr.json';
import en from '../locales/en.json';

const translations = { tr, en } as const;

type Language = 'tr' | 'en';
type TranslationKeys = keyof typeof tr;

type LanguageContextType = {
  lang: Language;
  t: (key: TranslationKeys) => string;
  changeLang: (l: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('tr');

  const t = (key: TranslationKeys) => translations[lang][key];
  const changeLang = (l: Language) => setLang(l);

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
