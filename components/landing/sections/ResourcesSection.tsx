import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Palette, Brush, Layers, Zap, Share2, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Moon, Sun, Globe, MessageCircle, ArrowUp, Menu, Trophy, BookOpen, CheckCircle, Video, Download, Users, Image as ImageIcon, Star, Gift, Newspaper, Languages } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

interface Props {
  lang: Locale;
}

export function ResourcesSection({ lang }: Props, ) {

  const { t } = useDictionary()

  const resources = [
    {
      title: t('resources.resource_1.title'),
      description: t('resources.resource_1.description'),
      icon: BookOpen,
      link: "/resources/beginners-guide.pdf"
    },
    {
      title: t('resources.resource_2.title'),
      description: t('resources.resource_2.description'),
      icon: Video,
      link: "/resources/video-series"
    },
    {
      title: t('resources.resource_3.title'),
      description: t('resources.resource_3.description'),
      icon: Download,
      link: "/resources/brush-pack.zip"
    }
  ]

  return (
    <section id="resources" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('resources.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <resource.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{resource.description}</p>
              <Button asChild variant="outline">
                <Link href={resource.link}>{t('resources.download')}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResourcesSection;
