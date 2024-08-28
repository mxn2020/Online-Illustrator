import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'
import { trackEvent } from '@/utils/tools'

interface Props {
  lang: Locale;
}

export function FAQSection({ lang }: Props, ) {
  
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { t } = useDictionary()
  
  const faqs = [
    {
      question: t('faq.question_1'),
      answer: t('faq.answer_1'),
    },
    {
      question: t('faq.question_2'),
      answer: t('faq.answer_2'),
    },
    {
      question: t('faq.question_3'),
      answer: t('faq.answer_3'),
    },
    {
      question: t('faq.question_4'),
      answer: t('faq.answer_4'),
    },
    {
      question: t('faq.question_5'),
      answer: t('faq.answer_5'),
    },
  ]

  return (
    <section id="faq" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('faq.title')}</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className="flex justify-between items-center w-full text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setActiveIndex(activeIndex === index ? null : index)
                  trackEvent('faq_toggled', { question: faq.question, isOpen: activeIndex !== index })
                }}
              >
                <span className="font-semibold">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="p-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection;
