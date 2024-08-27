export const i18n = {
  defaultLocale: 'en',
  locales: [
    'ar',
    'de',
    'en',
    'es',
    'es-mx',
    'fr',
    'it',
    'nl',
    'pt',
    'pt-br',
    'tr',
    'zh',
  ],
} as const

export type Locale = (typeof i18n)['locales'][number]
