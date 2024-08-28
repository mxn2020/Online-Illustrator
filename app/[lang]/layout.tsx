import { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { PropsWithChildren } from 'react';
import { getURL } from '@/utils/helpers';
import { ThemeProvider } from 'next-themes';
import './main.css';
import './globals.css';
import LocaleSwitcher from './components/Layout/locale-switcher'
import GoTop from "./components/Layout/GoTop";
import AosAnimation from "./components/Layout/AosAnimation";
import DictionaryProvider from "@/lib/dictionary-provider";
import { getDictionary } from '@/lib/dictionary'
import { Locale, i18n } from '@/i18n.config'

const title = 'IllustratorApp';
const description = 'Brought to you by Mehdi. Using V0, Vercel, Shadcn, Stripe, and Supabase.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary('landing', params.lang)

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="bg-background text-foreground">
            <main
              id="skip"
              className="min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)]"
            >
              <DictionaryProvider dictionary={dictionary}>
                {children}
              </DictionaryProvider>

              {/*
        <LocaleSwitcher />
*/}

              <GoTop />

              <AosAnimation />
            </main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}