import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { Trophy, CheckCircle } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'
import { GamificationContext } from '../tools'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props {
  lang: Locale;
}

export function GamificationSection({ lang }: Props, ) {

  const { points = 0, level = 0, achievements = [] } = useContext(GamificationContext) || {};
  const { t } = useDictionary()

  return (
    <section id="gamification" className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('gamification.title')}</h2>
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold">{t('gamification.level', { level })}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('gamification.points', { points })}</p>
            </div>
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <div className="mb-6">
            <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded-full">
              <motion.div 
                className="bg-blue-500 h-4 rounded-full" 
                style={{ width: `${(points % 100) / 100 * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(points % 100) / 100 * 100}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('gamification.next_level', { points: 100 - (points % 100) })}
            </p>
          </div>
          <h4 className="text-xl font-semibold mb-4">{t('gamification.achievements')}</h4>
          <ul className="space-y-2">
            {achievements.map((achievement, index) => (
              <motion.li 
                key={index} 
                className="flex items-center"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{achievement}</span>
              </motion.li>
            ))}
          </ul>
          <div className="mt-6">
            <Button asChild>
              <Link href="/">{t('gamification.take_challenges')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}