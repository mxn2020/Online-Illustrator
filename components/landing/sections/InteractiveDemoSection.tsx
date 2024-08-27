import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

// Lazy load the IllustrationAppDemo component
const IllustrationAppDemo = dynamic(() => import('@/components/sections/IllustrationAppDemo').then((mod) => mod.IllustrationAppDemo), {
  loading: () => <p>Loading demo...</p>,
  ssr: false,
})

interface Props {
  lang: Locale;
}

export function InteractiveDemoSection({ lang }: Props) {
  const { t } = useDictionary()
  
  return (
    <section id="demo" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('demo.title')}</h2>
        <Suspense fallback={<div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">{t('demo.loading')}</div>}>
          <IllustrationAppDemo lang={lang} />
        </Suspense>
        <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
          {t('demo.description')}
        </p>
      </div>
    </section>
  )
}

export default InteractiveDemoSection;
