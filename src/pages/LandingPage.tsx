import { Link } from 'react-router'
import { ShieldCheckIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { ThemeToggle } from '@/components/ThemeToggle'

export function LandingPage() {
  const { t } = useTranslation('landing')

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheckIcon aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">Sherehe Ceremonies</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 max-w-md text-3xl font-bold tracking-tight md:text-4xl">
          {t('headline')}
        </h1>
        <p className="mt-4 max-w-sm text-balance text-sm text-muted-foreground md:text-base">
          {t('body')}
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link to="/dashboard">{t('cta')}</Link>
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">{t('ctaNote')}</p>
      </main>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        {t('footer')}
      </footer>
    </div>
  )
}
