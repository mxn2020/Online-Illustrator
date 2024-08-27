import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Locale } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'
import { trackEvent } from '../tools'

interface Props {
  lang: Locale;
}

export function Footer({ lang }: Props, ) {

  const { t } = useDictionary()
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">{t('footer.app_name')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('footer.description')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.features')}</Link></li>
              <li><Link href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.pricing')}</Link></li>
              <li><Link href="#testimonials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.testimonials')}</Link></li>
              <li><Link href="#faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              <li><Link href="#blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.blog')}</Link></li>
              <li><Link href="#resources" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.resources')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.privacy_policy')}</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t('footer.terms_of_service')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.newsletter')}</h4>
            <form className="space-y-2" onSubmit={(e) => {
              e.preventDefault()
              trackEvent('newsletter_signup')
            }}>
              <Input type="email" placeholder={t('footer.enter_email')} className="hover:border-blue-500 focus:border-blue-500 transition-colors" />
              <Button type="submit" className="w-full hover:scale-105 transition-transform">{t('footer.subscribe')}</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} {t('footer.app_name')}. {t('footer.all_rights_reserved')}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
