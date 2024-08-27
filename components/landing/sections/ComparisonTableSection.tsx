import React from 'react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function ComparisonTableSection({ lang }: Props, ) {
  
  const { t } = useDictionary()
  
  const features = [
    { name: t('comparison.feature_1'), us: true, competitor1: true, competitor2: true },
    { name: t('comparison.feature_2'), us: true, competitor1: true, competitor2: false },
    { name: t('comparison.feature_3'), us: true, competitor1: true, competitor2: true },
    { name: t('comparison.feature_4'), us: true, competitor1: false, competitor2: true },
    { name: t('comparison.feature_5'), us: true, competitor1: false, competitor2: false },
    { name: t('comparison.feature_6'), us: true, competitor1: false, competitor2: false },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('comparison.title')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 bg-gray-100 dark:bg-gray-800 font-bold uppercase text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{t('comparison.feature')}</th>
                <th className="py-4 px-6 bg-gray-100 dark:bg-gray-800 font-bold uppercase text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{t('comparison.us')}</th>
                <th className="py-4 px-6 bg-gray-100 dark:bg-gray-800 font-bold uppercase text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{t('comparison.competitor_1')}</th>
                <th className="py-4 px-6 bg-gray-100 dark:bg-gray-800 font-bold uppercase text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{t('comparison.competitor_2')}</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index}>
                  <td className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">{feature.name}</td>
                  <td className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">{feature.us ? "✅" : "❌"}</td>
                  <td className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">{feature.competitor1 ? "✅" : "❌"}</td>
                  <td className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">{feature.competitor2 ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ComparisonTableSection;
