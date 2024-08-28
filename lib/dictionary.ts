import 'server-only';
import type { Locale } from '@/i18n.config';
import { AppName, Dictionary } from './types';

const cache = new Map<string, Dictionary>();

async function loadLanguageDictionaries(appName: AppName, lang: Locale): Promise<Dictionary> {
  const cacheKey = `${appName}-${lang}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const dictionaryFiles: Record<AppName, (() => Promise<Dictionary>)[]> = {
    illustrator: [() => import(`@/dictionaries/illustrator/${lang}/app.json`).then(m => m.default)],
    landing: [
      () => import(`@/dictionaries/landing/${lang}/common.json`).then(m => m.default),
      () => import(`@/dictionaries/landing/${lang}/demo.json`).then(m => m.default),
      () => import(`@/dictionaries/landing/${lang}/extra.json`).then(m => m.default),
    ],
  };

  const dictionariesToLoad = dictionaryFiles[appName];
  if (!dictionariesToLoad) {
    throw new Error(`No dictionaries found for app: ${appName}`);
  }

  const combinedDictionary = Object.assign({}, ...(await Promise.all(dictionariesToLoad.map(load => load()))));
  cache.set(cacheKey, combinedDictionary);

  return combinedDictionary;
}

const dictionaries: Record<AppName, Record<Locale, () => Promise<Dictionary>>> = {
  illustrator: {
    ar: () => loadLanguageDictionaries('illustrator', 'ar'),
    de: () => loadLanguageDictionaries('illustrator', 'de'),
    en: () => loadLanguageDictionaries('illustrator', 'en'),
    es: () => loadLanguageDictionaries('illustrator', 'es'),
    'es-mx': () => loadLanguageDictionaries('illustrator', 'es-mx'),
    fa: () => loadLanguageDictionaries('illustrator', 'fa'),
    fr: () => loadLanguageDictionaries('illustrator', 'fr'),
    it: () => loadLanguageDictionaries('illustrator', 'it'),
    ja: () => loadLanguageDictionaries('illustrator', 'ja'),
    nl: () => loadLanguageDictionaries('illustrator', 'nl'),
    pt: () => loadLanguageDictionaries('illustrator', 'pt'),
    'pt-br': () => loadLanguageDictionaries('illustrator', 'pt-br'),
    ru: () => loadLanguageDictionaries('illustrator', 'ru'),
    tr: () => loadLanguageDictionaries('illustrator', 'tr'),
    zh: () => loadLanguageDictionaries('illustrator', 'zh'),
  },
  landing: {
    ar: () => loadLanguageDictionaries('landing', 'ar'),
    de: () => loadLanguageDictionaries('landing', 'de'),
    en: () => loadLanguageDictionaries('landing', 'en'),
    es: () => loadLanguageDictionaries('landing', 'es'),
    'es-mx': () => loadLanguageDictionaries('landing', 'es-mx'),
    fa: () => loadLanguageDictionaries('landing', 'fa'),
    fr: () => loadLanguageDictionaries('landing', 'fr'),
    it: () => loadLanguageDictionaries('landing', 'it'),
    ja: () => loadLanguageDictionaries('landing', 'ja'),
    nl: () => loadLanguageDictionaries('landing', 'nl'),
    pt: () => loadLanguageDictionaries('landing', 'pt'),
    'pt-br': () => loadLanguageDictionaries('landing', 'pt-br'),
    ru: () => loadLanguageDictionaries('landing', 'ru'),
    tr: () => loadLanguageDictionaries('landing', 'tr'),
    zh: () => loadLanguageDictionaries('landing', 'zh'),
  }
};

const defaultDictionary: Dictionary = new Proxy({} as Dictionary, {
  get: (target, prop) => {
    return new Proxy({} as Record<string, string>, {
      get: (_, key) => String(key)
    });
  }
});

export const getDictionary = async (appName: AppName, locale: Locale): Promise<Dictionary> => {
  if (!dictionaries[appName] || !dictionaries[appName][locale]) {
    console.warn(`No dictionary found for app: ${appName} and locale: ${locale}. Using default dictionary.`);
    return defaultDictionary;
  }
  return dictionaries[appName][locale]();
};