import 'server-only'
import type { Locale } from '@/i18n.config'

const cache = new Map();

async function loadLanguageDictionaries(lang: string) {
  if (cache.has(lang)) {
    return cache.get(lang);
  }

  const [
    app,
    common,
    demo,
    extra,
  ] = await Promise.all([
    import(`@/dictionaries/${lang}/app.json`).then(m => m.default),
    import(`@/dictionaries/${lang}/common.json`).then(m => m.default),
    import(`@/dictionaries/${lang}/demo.json`).then(m => m.default),
    import(`@/dictionaries/${lang}/extra.json`).then(m => m.default),
  ]);

 const dictionary = {
    ...app,
    ...common,
    ...demo,
    ...extra,
  };

  const dictionarySize = JSON.stringify(dictionary).length;

  cache.set(lang, dictionary);

  return dictionary;
}

const dictionaries = {
  ar: () => loadLanguageDictionaries('ar'),
  //cs: () => loadLanguageDictionaries('cs'),
  //da: () => loadLanguageDictionaries('da'),
  de: () => loadLanguageDictionaries('de'),
  //el: () => loadLanguageDictionaries('el'),
  en: () => loadLanguageDictionaries('en'),
  es: () => loadLanguageDictionaries('es'),
  'es-mx': () => loadLanguageDictionaries('es-mx'),
  //fa: () => loadLanguageDictionaries('fa'),
  //fi: () => loadLanguageDictionaries('fi'),
  fr: () => loadLanguageDictionaries('fr'),
  //hu: () => loadLanguageDictionaries('hu'),
  it: () => loadLanguageDictionaries('it'),
  nl: () => loadLanguageDictionaries('nl'),
  //no: () => loadLanguageDictionaries('no'),
  pt: () => loadLanguageDictionaries('pt'),
  'pt-br': () => loadLanguageDictionaries('pt-br'),
  //sv: () => loadLanguageDictionaries('sv'),
  tr: () => loadLanguageDictionaries('tr'),
  zh: () => loadLanguageDictionaries('zh'),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
