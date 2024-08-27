import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Gift, Share2, Zap } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function AffiliateProgramSection({ lang }: Props, ) {


  const { t } = useDictionary()
  
  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('affiliate.title')}</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg mb-8">{t('affiliate.description')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <Gift className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('affiliate.benefit_1.title')}</h3>
              <p>{t('affiliate.benefit_1.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <Share2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('affiliate.benefit_2.title')}</h3>
              <p>{t('affiliate.benefit_2.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('affiliate.benefit_3.title')}</h3>
              <p>{t('affiliate.benefit_3.description')}</p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href="/">{t('affiliate.join_now')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}