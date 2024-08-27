import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Locale, i18n } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function IntegrationSection({ lang }: Props, ) {

  const { t } = useDictionary()
  
  const integrations = [
    { name: 'Adobe Creative Cloud', logo: '/placeholder.svg' },
    { name: 'Figma', logo: '/placeholder.svg' },
    { name: 'Sketch', logo: '/placeholder.svg' },
    { name: 'Procreate', logo: '/placeholder.svg' },
  ];

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('integrations.title')}</h2>
        <p className="text-center mb-8 max-w-2xl mx-auto">{t('integrations.description')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {integrations.map((integration, index) => (
            <div key={index} className="flex flex-col items-center">
          {/*<Image src={integration.logo} alt={integration.name} width={100} height={100} className="mb-4" />*/}
              <p className="text-center font-semibold">{integration.name}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/">{t('integrations.learn_more')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default IntegrationSection;
