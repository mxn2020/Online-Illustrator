import React, { useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function TestimonialsSection({ lang }: Props, ) {

    const controls = useAnimation()
    const ref = useRef(null)
    const inView = useInView(ref)
    const { t } = useDictionary()
  
    useEffect(() => {
      if (inView) {
        controls.start('visible')
      }
    }, [controls, inView])
  
    const testimonials = [
      {
        name: t('testimonials.testimonial_1.name'),
        role: t('testimonials.testimonial_1.role'),
        image: '/placeholder.svg',
        quote: t('testimonials.testimonial_1.quote'),
      },
      {
        name: t('testimonials.testimonial_2.name'),
        role: t('testimonials.testimonial_2.role'),
        image: '/placeholder.svg',
        quote: t('testimonials.testimonial_2.quote'),
      },
      {
        name: t('testimonials.testimonial_3.name'),
        role: t('testimonials.testimonial_3.role'),
        image: '/placeholder.svg',
        quote: t('testimonials.testimonial_3.quote'),
      },
    ]
  
    return (
      <section id="testimonials" className="py-20 bg-gray-100 dark:bg-gray-800" ref={ref}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('testimonials.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg"
                initial="hidden"
                animate={controls}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="italic text-gray-700 dark:text-gray-300">&ldquo;{testimonial.quote}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    )
  }
export default TestimonialsSection;
