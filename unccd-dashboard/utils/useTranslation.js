// useTranslation.js
import { useCallback } from 'react';
import { translations } from './translations';

export const useTranslation = (currentLanguage) => {
  const t = useCallback((key) => {
    if (!translations[currentLanguage]) {
      return key; // Fallback to key if language doesn't exist
    }

    return translations[currentLanguage][key] || key; // Fallback to key if translation doesn't exist
  }, [currentLanguage]);

  return { t };
};