import React, { useState, useEffect, useRef, createContext, useContext, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Palette, Globe, Menu } from 'lucide-react'

import { Locale, i18n } from '@/i18n.config'
import { usePathname } from 'next/navigation'
import { useDictionary } from '@/lib/dictionary-provider'

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';

import { ABTestContext, trackEvent } from '../tools';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => { },
});



interface HeaderProps {
  user: User | null | undefined;
  lang: Locale;
}

export function Header({ user, lang }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isDark, toggleTheme } = useContext(ThemeContext)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const { t } = useDictionary()

  const currentRoute = usePathname();

  const redirectedPathName = (locale: string) => {

    if (!currentRoute) return '/'
    const segments = currentRoute.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md dark:bg-gray-900/80' : ''}`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${lang}/`} className="flex items-center space-x-2">
          <Palette className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold">{t('app_name')}</span>
        </Link>
        <nav className="hidden md:flex space-x-8">
        <Link
            href={`/${lang}/#features`}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            onClick={() => {
              const element = document.getElementById('features');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
            {t('nav.features')}
          </Link>
          <Link
            href={`/${lang}/#pricing`}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            onClick={() => {
              const element = document.getElementById('pricing');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
            {t('nav.pricing')}
          </Link>
          <Link
            href={`/${lang}/#testimonials`}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            onClick={() => {
              const element = document.getElementById('testimonials');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
            {t('nav.testimonials')}
          </Link>
          <Link
            href={`/${lang}/#faq`}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            onClick={() => {
              const element = document.getElementById('faq');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
            {t('nav.faq')}
          </Link>
          <Link
            href={`/${lang}/#blog`}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            onClick={() => {
              const element = document.getElementById('blog');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
            {t('nav.blog')}
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {/* <ThemeToggle /> */}

          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Globe className="h-5 w-5" />
            </Button>

            <div className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-20 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
            {i18n.locales.map((locale) => (
                <Link
                  key={locale}
                  href={redirectedPathName(locale)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-center"
                >
                  {locale.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>


          {user ? (
            <>
              <Button asChild onClick={() => trackEvent('go_to_app_clicked', { location: 'header' })}>
                <Link href={`/${lang}/illustrator`}>{t('go_to_app')}</Link>
              </Button>
              <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                <input type="hidden" name="pathName" value={usePathname()} />
                <button type="submit">
                  {t('sign_out')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Button asChild onClick={() => trackEvent('cta_clicked', { location: 'header' })}>
                <Link href={`/${lang}/#pricing`}>{t('nav.get_started')}</Link>
              </Button>
              <Link href={`/${lang}/signin`}>
                {t('nav.sign_in')}
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
