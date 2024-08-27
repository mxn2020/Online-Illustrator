import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

export function CommunityShowcaseSection(lang: Locale) {
  const { t } = useDictionary()
  
  const communityArtworks = [
    { src: "/placeholder.svg", alt: t('community.artwork_1.alt'), artist: t('community.artwork_1.artist') },
    { src: "/placeholder.svg", alt: t('community.artwork_2.alt'), artist: t('community.artwork_2.artist') },
    { src: "/placeholder.svg", alt: t('community.artwork_3.alt'), artist: t('community.artwork_3.artist') },
  ];

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('community.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityArtworks.map((artwork, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={artwork.src}
                alt={artwork.alt}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-center text-gray-600 dark:text-gray-300">{t('community.by', { artist: artwork.artist })}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/">{t('community.view_gallery')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}