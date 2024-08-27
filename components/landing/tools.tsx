'use client'

import React, { useState, useEffect, useRef, createContext, useContext, Suspense } from 'react'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import OpenAI from 'openai'
import dynamic from 'next/dynamic'
import { memoize } from 'lodash-es';

// Lazy load full translation files
const fetchJSON = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const memoizedFetchJSON = memoize(fetchJSON);

const TRANSLATION_FILES = ['common', 'demo', 'app', 'extra'];

export const loadTranslations = async (lang: string = 'en') => {
  try {
    const translations = await Promise.all(
      TRANSLATION_FILES.map(file => 
        memoizedFetchJSON(`/locales/${lang}/${file}.json`)
      )
    );

    return Object.assign({}, ...translations);
  } catch (error) {
    console.error(`Could not load translations for language: ${lang}`, error);
    return {};
  }
};


// Lazy load the IllustrationAppDemo component
export const IllustrationAppDemo = dynamic(() => import('@/components/sections/IllustrationAppDemo').then((mod) => mod.IllustrationAppDemo), {
  loading: () => <p>Loading demo...</p>,
  ssr: false,
})

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: {} },
      es: { translation: {} },
      ar: { translation: {} },
      zh: { translation: {} },
      it: { translation: {} },
      fr: { translation: {} },
      de: { translation: {} },
      nl: { translation: {} },
      tr: { translation: {} },
      'pt-br': { translation: {} },
      pt: { translation: {} },
      'es-mx': { translation: {} },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

// Create context for theme
export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => { },
});

// A/B Testing variants
export const ABTestContext = createContext({
  variant: 'A',
  trackConversion: (variantId: string, eventName: string) => { },
});

export const ABTestProvider = ({ children }: { children: React.ReactNode }) => {
  const [variant, setVariant] = useState('A');
  const [conversions, setConversions] = useState<{ [key: string]: { [key: string]: number } }>({});

  useEffect(() => {
    const variants = ['A', 'B', 'C', 'D'];
    setVariant(variants[Math.floor(Math.random() * variants.length)]);
  }, []);

  const trackConversion = (variantId: string, eventName: string) => {
    setConversions(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [eventName]: (prev[variantId]?.[eventName] || 0) + 1
      }
    }));
    console.log(`Conversion tracked for variant ${variantId}: ${eventName}`);
  };

  useEffect(() => {
    console.log('Current conversions:', conversions);
    // Here you would typically send this data to your analytics service
  }, [conversions]);

  return (
    <ABTestContext.Provider value={{ variant, trackConversion }}>
      {children}
    </ABTestContext.Provider>
  );
};

// Analytics tracking function
export const trackEvent = (eventName: string, eventProperties = {}) => {
  console.log('Event tracked:', eventName, eventProperties);
  // Here you would typically send this data to your analytics service
};

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface GamificationContextType {
  points: number;
  level: number;
  addPoints: (amount: number) => void;
  achievements: string[];
  unlockAchievement: (achievement: string) => void;
}



export const GamificationContext = React.createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);

  const addPoints = (amount: number) => {
    setPoints(prev => {
      const newPoints = prev + amount;
      const newLevel = Math.floor(newPoints / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        unlockAchievement(`Reached Level ${newLevel}`);
      }
      return newPoints;
    });
  };

  const unlockAchievement = (achievement: string) => {
    if (!achievements.includes(achievement)) {
      setAchievements(prev => [...prev, achievement]);
    }
  };

  return (
    <GamificationContext.Provider value={{ points, level, addPoints, achievements, unlockAchievement }}>
      {children}
    </GamificationContext.Provider>
  );
};
