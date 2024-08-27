'use client'

import React from "react";
import { getDictionary } from '@/lib/dictionary' 

type Dictionary = Awaited<ReturnType<typeof getDictionary>>

const DictionaryContext = React.createContext<Dictionary | null>(null)

export default function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary
  children: React.ReactNode
}) {

  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  )
}

function getTranslation(dictionary: Dictionary, key: string): string {
  // First, check for the exact dotted key in the dictionary
  if (key in dictionary) {
    return dictionary[key];
  }

  // If not found, try to resolve it as a nested key
  const keys = key.split('.');
  let result: any = dictionary;

  for (const k of keys) {
    if (result && k in result) {
      result = result[k];
    } else {
      return key; // Return the original key if any part of the path is invalid
    }
  }

  return typeof result === 'string' ? result : key; // Return the final value if it's a string, otherwise return the key
}

export function useDictionary() {
  const dictionary = React.useContext(DictionaryContext) as Dictionary | null;

  if (dictionary === null) {
    throw new Error('useDictionary hook must be used within DictionaryProvider');
  }

  const translate = (key: string) => {
    return getTranslation(dictionary, key);
  };

  return { ...dictionary, t: translate };
}
