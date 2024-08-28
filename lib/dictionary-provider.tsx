'use client';

import React from 'react';
import { getDictionary } from '@/lib/dictionary';
import type { Dictionary } from '@/lib/types';

const DictionaryContext = React.createContext<Dictionary | null>(null);

export default function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

function getTranslation(dictionary: Dictionary, key: string, variables?: Record<string, string | number>): string {
  const keys = key.split('.');
  let result: any = dictionary;

  for (const k of keys) {
    if (result && k in result) {
      result = result[k];
    } else {
      console.warn(`Translation key "${key}" not found. Using key as fallback.`);
      return key;
    }
  }

  return typeof result === 'string' ? replaceVariables(result, variables) : key;
}

function replaceVariables(str: string, variables?: Record<string, string | number>): string {
  return str.replace(/{{\s*(.*?)\s*}}/g, (_, variable) => {
    return variables?.[variable] !== undefined ? String(variables[variable]) : `{{ ${variable} }}`;
  });
}


export function useDictionary(): { dictionary: Dictionary; t: (key: string, variables?: Record<string, string | number>) => string } {
  const dictionary = React.useContext(DictionaryContext);

  if (!dictionary) {
    throw new Error('useDictionary hook must be used within DictionaryProvider');
  }

  const translate = (key: string, variables?: Record<string, string | number>) => {
    return getTranslation(dictionary, key, variables);
  };

  return { dictionary, t: translate };
}
