import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function PressSection({ lang }: Props, ) {

  const { t } = useDictionary()
  const pressItems = [
    { logo: "/placeholder.svg", name: t('press.item_1.name'), quote: t('press.item_1.quote') },
    { logo: "/placeholder.svg", name: t('press.item_2.name'), quote: t('press.item_2.quote') },
    { logo: "/placeholder.svg", name: t('press.item_3.name'), quote: t('press.item_3.quote') },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('press.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pressItems.map((item, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              {/*<Image src={item.logo} alt={item.name} width={150} height={50} className="mx-auto mb-4" />*/}
              <p className="text-lg font-semibold mb-2">{item.name}</p>
              <p className="italic">&ldquo;{item.quote}&rdquo;</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link href="/">{t('press.download_kit')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PressSection;
