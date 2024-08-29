import React from 'react';
import DictionaryProvider from '@/lib/dictionary-provider';
import { getDictionary } from '@/lib/dictionary';
import { Locale, i18n } from '@/i18n.config'

export async function generateStaticParams() {
    return i18n.locales.map(locale => ({ lang: locale }))
  }
  
export default async function SubfolderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary('illustrator', params.lang);

  return (
        <DictionaryProvider dictionary={dictionary}>
          {children}
        </DictionaryProvider>
  );
}
