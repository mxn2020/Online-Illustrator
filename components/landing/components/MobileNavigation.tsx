import React, { useState, useEffect, useRef, createContext, useContext, Suspense } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Palette, Brush, Layers, Zap, Share2, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Moon, Sun, Globe, MessageCircle, ArrowUp, Menu, Trophy, BookOpen, CheckCircle, Video, Download, Users, Image as ImageIcon, Star, Gift, Newspaper, Languages } from 'lucide-react'


export function MobileNavigation({ show }: { show: boolean }, onClose: () => void) {
    const { t } = useTranslation()
  
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%'}}
            transition={{ type: 'tween' }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50"
          >
            <div className="p-4">
              <Button variant="ghost" size="icon" onClick={onClose} className="mb-4">
                <ChevronDown className="h-6 w-6 transform rotate-90" />
              </Button>
              <nav className="space-y-4">
                <Link href="#features" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {t('features')}
                </Link>
                <Link href="#pricing" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {t('pricing')}
                </Link>
                <Link href="#testimonials" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {t('testimonials')}
                </Link>
                <Link href="#faq" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {t('faq')}
                </Link>
                <Link href="#blog" className="block text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {t('blog')}
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
  
  