import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { Brush, Layers, Zap, Share2 } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'
import { trackEvent } from '@/utils/tools'

interface Props {
  lang: Locale;
}

export function FeaturesSection({ lang }: Props, ) {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref)
  const { t } = useDictionary()
  
  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  const features = [
    {
      icon: Brush,
      title: t('features.feature_1.title'),
      description: t('features.feature_1.description'),
    },
    {
      icon: Layers,
      title: t('features.feature_2.title'),
      description: t('features.feature_2.description'),
    },
    {
      icon: Zap,
      title: t('features.feature_3.title'),
      description: t('features.feature_3.description'),
    },
    {
      icon: Share2,
      title: t('features.feature_4.title'),
      description: t('features.feature_4.description'),
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-100 dark:bg-gray-800" ref={ref}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => trackEvent('feature_viewed', { feature: feature.title })}
            >
              <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


export default FeaturesSection;
