// Define the i18n configuration with supported locales
export const i18n = {
  defaultLocale: 'en',
  locales: [
    'ar',
    'de',
    'en',
    'es',
    'es-mx',
    'fa',
    'fr',
    'it',
    'ja',
    'nl',
    'pt',
    'pt-br',
    'ru',
    'tr',
    'zh',
  ],
} as const;

export type Locale = (typeof i18n)['locales'][number];