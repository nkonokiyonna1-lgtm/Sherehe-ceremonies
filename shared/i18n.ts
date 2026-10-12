export const SUPPORTED_LOCALES = ['en', 'sw'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

// Never trust a locale that arrives from storage or from a client request.
export function toLocale(value: unknown): Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
    ? (value as Locale)
    : DEFAULT_LOCALE
}
