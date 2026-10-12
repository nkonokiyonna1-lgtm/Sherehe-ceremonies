import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import i18n, { LOCALE_STORAGE_KEY } from '@/i18n'

// Importing the module starts the shared i18next instance, so every render in
// every test file sees real catalogs. Reset to English so tests stay isolated.
afterEach(async () => {
  localStorage.removeItem(LOCALE_STORAGE_KEY)
  await i18n.changeLanguage('en')
})

// jsdom has no ResizeObserver; Radix tooltip/portal machinery needs one.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverStub,
  })
}
