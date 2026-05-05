import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import T from './i18n';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('cn');
  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'en' ? 'cn' : 'en'));
  }, []);
  const value = useMemo(() => {
    const t = (key) => T[lang]?.[key] ?? T.en?.[key] ?? key;
    return { lang, toggleLang, t };
  }, [lang, toggleLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
