import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  toLocale,
  type Locale,
} from '../../shared/i18n'
import common_en from '../../shared/locales/en/common.json'
import common_sw from '../../shared/locales/sw/common.json'
import landing_en from './locales/en/landing.json'
import nav_en from './locales/en/nav.json'
import pages_en from './locales/en/pages.json'
import landing_sw from './locales/sw/landing.json'
import nav_sw from './locales/sw/nav.json'
import pages_sw from './locales/sw/pages.json'

export const LOCALE_STORAGE_KEY = 'locale'

// The language is manual only: it starts as English and changes only when the
// organizer uses the switch (spec 0003, no browser language detection).
function readStoredLocale(): Locale {
  try {
    return toLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
  } catch {
    return DEFAULT_LOCALE
  }
}

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (error) {
    // Storage can be blocked (private mode); the switch still applies live.
    console.warn('[i18n/locale] could not save the chosen language', error)
  }
}

i18next.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

void i18next.use(initReactI18next).init({
  lng: readStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  ns: ['common', 'nav', 'landing', 'pages'],
  defaultNS: 'common',
  resources: {
    en: {
      common: common_en,
      nav: nav_en,
      landing: landing_en,
      pages: pages_en,
    },
    sw: {
      common: common_sw,
      nav: nav_sw,
      landing: landing_sw,
      pages: pages_sw,
    },
  },
  interpolation: { escapeValue: false },
  initAsync: false,
  react: { useSuspense: false },
})

export function setLocale(locale: Locale) {
  persistLocale(locale)
  return i18next.changeLanguage(locale)
}

export default i18next
