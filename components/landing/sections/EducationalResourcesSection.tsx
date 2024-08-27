import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function EducationalResourcesSection({ lang }: Props, ) {
  
  const { t } = useDictionary()

  const resources = [
    { title: t('education.resource_1.title'), type: 'Video', link: '#' },
    { title: t('education.resource_2.title'), type: 'PDF', link: '#' },
    { title: t('education.resource_3.title'), type: 'Webinar', link: '#' },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('education.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="mb-4">{t('education.type', { type: resource.type })}</p>
              <Button asChild variant="outline">
                <Link href="/">{t('education.access')}</Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/">{t('education.view_all')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default EducationalResourcesSection;
