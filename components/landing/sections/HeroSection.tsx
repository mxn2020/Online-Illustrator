import React, { useState, useEffect, useRef, createContext, useContext, Suspense } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ABTestContext, trackEvent } from '@/utils/tools';
import { Locale, i18n } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

import heropic from "/public/images/heropic.jpg";

interface Props {
  lang: Locale;
}

export function HeroSection({ lang }: Props, ) {
    const controls = useAnimation()
    const ref = useRef(null)
    const inView = useInView(ref)
    const { variant, trackConversion } = useContext(ABTestContext)
    const { t } = useDictionary()
  
    useEffect(() => {
      if (inView) {
        controls.start('visible')
      }
    }, [controls, inView])
  
    const heroContent: { [key: string]: { title: string; subtitle: string; cta: string } } = {
      A: {
        title: t('hero.title_a'),
        subtitle: t('hero.subtitle_a'),
        cta: t('hero.cta_a'),
      },
      B: {
        title: t('hero.title_b'),
        subtitle: t('hero.subtitle_b'),
        cta: t('hero.cta_b'),
      },
      C: {
        title: t('hero.title_c'),
        subtitle: t('hero.subtitle_c'),
        cta: t('hero.cta_c'),
      },
      D: {
        title: t('hero.title_d'),
        subtitle: t('hero.subtitle_d'),
        cta: t('hero.cta_d'),
      }
    }
  
    const content = heroContent[variant]
  
    return (
      <section className="py-20 md:py-32 relative overflow-hidden" ref={ref}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <motion.div
            className="md:w-1/2 mb-10 md:mb-0"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.title}
            </h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
              {content.subtitle}
            </p>
            <div className="space-x-4">
              <Button 
                size="lg" 
                asChild 
                className="hover:scale-105 transition-transform" 
                onClick={() => {
                  trackEvent('cta_clicked', { location: 'hero', button: 'primary', variant })
                  trackConversion(variant, 'hero_cta_click')
                }}
              >
                <a href="#pricing">{content.cta}</a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="hover:scale-105 transition-transform" 
                onClick={() => {
                  trackEvent('cta_clicked', { location: 'hero', button: 'secondary', variant })
                  trackConversion(variant, 'hero_learn_more_click')
                }}
              >
                <a href="#features">{t('hero.learn_more')}</a>
              </Button>
            </div>
          </motion.div>
          <motion.div
            className="md:w-1/2"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src={heropic}
              alt={t('hero.image_alt')}
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 -z-10" />
      </section>
    )
  }
  
  
export default HeroSection;