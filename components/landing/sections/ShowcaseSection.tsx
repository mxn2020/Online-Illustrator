import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

export function ShowcaseSection(lang: Locale) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useDictionary()
  
  const illustrations = [
    { src: "/placeholder.svg", alt: t('showcase.illustration_1') },
    { src: "/placeholder.svg", alt: t('showcase.illustration_2') },
    { src: "/placeholder.svg", alt: t('showcase.illustration_3') },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % illustrations.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + illustrations.length) % illustrations.length);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('showcase.title')}</h2>
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `${-currentIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {illustrations.map((illustration, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={illustration.src}
                    alt={illustration.alt}
                    width={800}
                    height={600}
                    className="mx-auto rounded-lg shadow-lg"
                  />
                </div>
              ))}
            </motion.div>
          </div>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg"
          >
            <ChevronDown className="h-6 w-6 transform rotate-90" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg"
          >
            <ChevronDown className="h-6 w-6 transform -rotate-90" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShowcaseSection;
