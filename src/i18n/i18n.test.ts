import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n, { LOCALE_STORAGE_KEY, setLocale } from '@/i18n'
import { toLocale } from '../../shared/i18n'

const catalogs = {
  ...import.meta.glob('/shared/locales/*/*.json', { eager: true }),
  ...import.meta.glob('/src/i18n/locales/*/*.json', { eager: true }),
} as Record<string, { default: Record<string, unknown> }>

type Flat = Record<string, string>

function flatten(value: Record<string, unknown>, prefix = ''): Flat {
  return Object.entries(value).reduce<Flat>((flat, [key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof entry === 'string') return { ...flat, [path]: entry }
    return { ...flat, ...flatten(entry as Record<string, unknown>, path) }
  }, {})
}

function placeholders(text: string): string[] {
  return (text.match(/{{\s*\w+\s*}}/g) ?? []).sort()
}

function catalogsFor(locale: string) {
  return Object.entries(catalogs)
    .filter(([path]) => path.includes(`/locales/${locale}/`))
    .map(([path, module]) => ({
      namespace: path.split('/').pop()!.replace('.json', ''),
      flat: flatten(module.default),
    }))
}

describe('toLocale', () => {
  it('accepts the supported locales and falls back to English otherwise', () => {
    expect(toLocale('en')).toBe('en')
    expect(toLocale('sw')).toBe('sw')
    expect(toLocale('fr')).toBe('en')
    expect(toLocale(null)).toBe('en')
    expect(toLocale(undefined)).toBe('en')
  })
})

describe('catalog parity', () => {
  it('every English namespace has a Swahili twin with the same keys and placeholders', () => {
    const english = catalogsFor('en')
    const swahili = catalogsFor('sw')

    expect(english.length).toBeGreaterThan(0)
    expect(swahili.map((c) => c.namespace).sort()).toEqual(
      english.map((c) => c.namespace).sort()
    )

    for (const en of english) {
      const sw = swahili.find((c) => c.namespace === en.namespace)!
      expect(Object.keys(sw.flat).sort(), en.namespace).toEqual(
        Object.keys(en.flat).sort()
      )
      for (const [key, text] of Object.entries(en.flat)) {
        expect(placeholders(sw.flat[key]), `${en.namespace}:${key}`).toEqual(
          placeholders(text)
        )
      }
    }
  })
})

describe('locale switching', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts in English', () => {
    expect(i18n.language).toBe('en')
    expect(i18n.t('dashboard', { ns: 'nav' })).toBe('Dashboard')
  })

  it('setLocale changes the language, saves it, and updates the page language', async () => {
    await setLocale('sw')

    expect(i18n.t('dashboard', { ns: 'nav' })).toBe('Dashibodi')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('sw')
    expect(document.documentElement.lang).toBe('sw')
  })

  it('still switches when storage is blocked, and says so in the console', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    await setLocale('sw')

    expect(i18n.t('dashboard', { ns: 'nav' })).toBe('Dashibodi')
    expect(warn).toHaveBeenCalled()
  })

  it('reads the saved language on load and ignores an unknown value', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'sw')
    vi.resetModules()
    const saved = await import('@/i18n')
    expect(saved.default.language).toBe('sw')

    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')
    vi.resetModules()
    const unknown = await import('@/i18n')
    expect(unknown.default.language).toBe('en')
  })
})
