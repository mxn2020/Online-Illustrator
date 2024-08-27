'use client'

import React, { useState, useEffect, useRef, createContext, useContext, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Palette, Brush, Layers, Zap, Share2, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Moon, Sun, Globe, MessageCircle, ArrowUp, Menu, Trophy, BookOpen, CheckCircle, Video, Download, Users, Image as ImageIcon, Star, Gift, Newspaper, Languages } from 'lucide-react'
import Cookies from 'js-cookie'
import { Analytics } from '@vercel/analytics/react'
import { usePathname, useSearchParams } from 'next/navigation'


import { HeroSection } from '@/components/landing/sections/HeroSection';
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection';
import { InteractiveDemoSection } from '@/components/landing/sections/InteractiveDemoSection';
import { PricingSection } from '@/components/landing/sections/PricingSection';
import { TestimonialsSection } from '@/components/landing/sections/TestimonialsSection';
import { FAQSection } from '@/components/landing/sections/FAQSection';
import { BlogSection } from '@/components/landing/sections/BlogSection';
import { ResourcesSection } from '@/components/landing/sections/ResourcesSection';
import { GamificationSection } from '@/components/landing/sections/GamificationSection';
import { ShowcaseSection } from '@/components/landing/sections/ShowcaseSection';
import { CommunityShowcaseSection } from '@/components/landing/sections/CommunityShowcaseSection';
import { ComparisonTableSection } from '@/components/landing/sections/ComparisonTableSection';
import { AffiliateProgramSection } from '@/components/landing/sections/AffiliateProgramSection';
import { PressSection } from '@/components/landing/sections/PressSection';
import { IntegrationSection } from '@/components/landing/sections/IntegrationSection';
import { EducationalResourcesSection } from '@/components/landing/sections/EducationalResourcesSection';
import { LocalizationSection } from '@/components/landing/sections/LocalizationSection';
import { SocialProofWidget } from '@/components/landing/sections/SocialProofWidget';

import { Header } from '@/components/landing/sections/HeaderSection';
import { Footer } from '@/components/landing/sections/FooterSection';

import { AIChatbot } from '@/components/landing/components/AIChatbot';
import { CookieConsent } from '@/components/landing/components/CookieConsent';
import { MobileNavigation } from '@/components/landing/components/MobileNavigation';


import type { Tables } from '@/types_db';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';

import { ThemeContext, ABTestProvider, GamificationProvider, trackEvent, loadTranslations } from './tools';
import { Locale, i18n } from '@/i18n.config'
import { useDictionary } from '@/lib/dictionary-provider'

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface LandingPageProps {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  lang: Locale;
}

export default function LandingPage({ user, products, subscription, lang }: LandingPageProps) {

  const dictionary = useDictionary()
  const lang_app = dictionary.app;

  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  const [isDark, setIsDark] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(false);
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme === 'dark');
    const consentGiven = Cookies.get('cookieConsent');
    setCookieConsent(consentGiven === 'true');

    {/*
      const urlLang = searchParams.get('lang');
    if (urlLang && ['en', 'es', 'ar', 'zh', 'it', 'fr', 'de', 'nl', 'tr', 'pt-br', 'pt', 'es-mx'].includes(urlLang)) {
      changeLanguage(urlLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es', 'ar', 'zh', 'it', 'fr', 'de', 'nl', 'tr', 'pt', 'pt-br', 'es-mx'].includes(browserLang)) {
        changeLanguage(browserLang);
      }
    }

    */}

    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchParams]);

  {/*

  const changeLanguage = async (lng: string) => {
    try {
      const translations = await loadTranslations(lng || 'en');
      i18n.addResourceBundle(lng, 'translation', translations, true, true);
    } catch (error) {
      console.error(`Failed to load translations for ${lng}`, error);
    }
    i18n.changeLanguage(lng);
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lng);
    window.history.pushState(null, '', `${pathname}?${params.toString()}`);
    trackEvent('language_changed', { new_language: lng });
  };
    */}

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    trackEvent('theme_changed', { new_theme: !isDark ? 'dark' : 'light' });
  };

  const handleCookieConsent = () => {
    setCookieConsent(true);
    Cookies.set('cookieConsent', 'true', { expires: 365 });
    trackEvent('cookie_consent_given');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ABTestProvider>
        <GamificationProvider>
          <div className={`${isDark ? 'dark' : ''} ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
              <Header
                user={user}
                lang={lang}
              />
              <main>
                <HeroSection lang={lang} />
                <FeaturesSection lang={lang} />
                <InteractiveDemoSection lang={lang} />
                <PricingSection user={user} products={products} subscription={subscription} lang={lang} />
                <TestimonialsSection lang={lang} />
                <FAQSection lang={lang} />
                <BlogSection lang={lang} />
                <ResourcesSection lang={lang} />
                <GamificationSection lang={lang} />
                {/*<ShowcaseSection lang={lang} />*/}
                {/*<CommunityShowcaseSection lang={lang} />*/}
                <ComparisonTableSection lang={lang} />
                <AffiliateProgramSection lang={lang} />
                <PressSection lang={lang} />
                <IntegrationSection lang={lang} />
                <EducationalResourcesSection lang={lang} />
                <LocalizationSection lang={lang} />
                <SocialProofWidget lang={lang} />
              </main>
              <Footer lang={lang} />
              {!cookieConsent && <CookieConsent onAccept={handleCookieConsent} />}
              <AIChatbot />
              {showBackToTop && (
                <Button
                  className="fixed bottom-20 right-4 rounded-full p-2 shadow-lg hover:scale-105 transition-transform"
                  onClick={scrollToTop}
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
              )}
              <MobileNavigation show={showMobileMenu} />
            </div>
          </div>
        </GamificationProvider>
      </ABTestProvider>
      <Analytics />
    </ThemeContext.Provider>
  )
}

