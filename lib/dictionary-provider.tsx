'use client';

import React, { useEffect } from 'react';
import { getDictionary } from '@/lib/dictionary';

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

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

function replaceVariables(str: string, variables?: Record<string, string | number>): string {
  if (!variables) {
    return str;
  }

  return str.replace(/{{\s*(.*?)\s*}}/g, (_, variable) => {
    return variables[variable] !== undefined ? String(variables[variable]) : `{{ ${variable} }}`;
  });
}


function getTranslation(dictionary: Dictionary, key: string, variables?: Record<string, string | number>): string {
  // First, check for the exact dotted key in the dictionary
  if (key in dictionary) {
    let value = dictionary[key];
    if (typeof value === 'string') {
      return replaceVariables(value, variables);
    }
  }

  // If not found, try to resolve it as a nested key
  const keys = key.split('.');
  let result: any = dictionary;

  for (const k of keys) {
    if (result && k in result) {
      result = result[k];
    } else {
      console.warn(`Translation key "${key}" not found. Using key as fallback.`);
      return key; // Return the original key if any part of the path is invalid
    }
  }

  return typeof result === 'string' ? replaceVariables(result, variables) : key; // Return the final value if it's a string, otherwise return the key
}


export function useDictionary() {
  const dictionary = React.useContext(DictionaryContext) as Dictionary | null;

  if (dictionary === null) {
    throw new Error('useDictionary hook must be used within DictionaryProvider');
  }

  const translate = (key: string, variables?: Record<string, string | number>) => {
    return getTranslation(dictionary, key, variables);
  };

  return { ...dictionary, t: translate };
}
