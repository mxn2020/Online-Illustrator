import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function LocalizationSection({ lang }: Props, ) {

  const { t } = useDictionary()
  const languages = [
    'English',         // en
    'Español',         // es
    'العربية',         // ar
    '中文',            // zh
    'Italiano',        // it
    'Français',        // fr
    'Deutsch',         // de
    'Nederlands',      // nl
    'Türkçe',          // tr
    'Português (BR)',  // pt-br
    'Português',       // pt
    'Español (MX)'     // es-mx
  ];

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('localization.title')}</h2>
        <p className="text-center mb-8 max-w-2xl mx-auto">{t('localization.description')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          {languages.map((lang, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full shadow">
              {lang}
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild disabled>
          <Link href="/">{t('localization.learn_more')}</Link>
            {/*<Link href="/language-support">{t('localization.learn_more')}</Link>*/}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default LocalizationSection;
