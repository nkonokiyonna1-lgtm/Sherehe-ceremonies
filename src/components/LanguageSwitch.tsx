import { LanguagesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { setLocale } from '@/i18n'
import { toLocale, type Locale } from '../../shared/i18n'

export function LanguageSwitch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation('common')
  const current = toLocale(i18n.resolvedLanguage)
  const next: Locale = current === 'en' ? 'sw' : 'en'
  const nextName = t(`language.names.${next}`)

  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      aria-label={t('language.switchTo', { language: nextName })}
      onClick={() => void setLocale(next)}
    >
      <LanguagesIcon aria-hidden="true" />
      <span lang={next}>{nextName}</span>
    </Button>
  )
}
