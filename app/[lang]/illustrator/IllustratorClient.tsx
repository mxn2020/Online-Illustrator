'use client';

import React, { useEffect } from 'react';
import { resetServerContext } from "react-beautiful-dnd";
import Illustrator from './illustrator';
// import Illustrator from '@/components/IllustratorApp';
import { ThemeContext, ABTestProvider, GamificationProvider, trackEvent, loadTranslations } from '@/components/landing/tools';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // Import i18n
import { Locale } from '@/i18n.config'

export default function IllustratorClient({
  lang
}: {
  lang: Locale
}) { 
  
  useEffect(() => {
    // Reset server context after component mounts
    resetServerContext();
  }, []);

  return <Illustrator
  lang={lang}
  />;
}