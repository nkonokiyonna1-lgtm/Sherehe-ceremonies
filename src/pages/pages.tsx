import {
  BarChart3Icon,
  BellRingIcon,
  CalendarPlusIcon,
  CompassIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  ScanLineIcon,
  SettingsIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyStatePage } from '@/components/EmptyStatePage'

export function DashboardPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('dashboard.title')}
      emptyTitle={t('dashboard.emptyTitle')}
      description={t('dashboard.description')}
      ctaLabel={t('dashboard.cta')}
      ctaTo="/templates"
      icon={LayoutDashboardIcon}
    />
  )
}

export function TemplatesPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('templates.title')}
      emptyTitle={t('templates.emptyTitle')}
      description={t('templates.description')}
      ctaLabel={t('templates.cta')}
      ctaTo="/events"
      icon={LayoutTemplateIcon}
    />
  )
}

export function EventsPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('events.title')}
      emptyTitle={t('events.emptyTitle')}
      description={t('events.description')}
      ctaLabel={t('events.cta')}
      ctaTo="/dashboard"
      icon={CalendarPlusIcon}
    />
  )
}

export function BillingPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('billing.title')}
      emptyTitle={t('billing.emptyTitle')}
      description={t('billing.description')}
      ctaLabel={t('billing.cta')}
      ctaTo="/events"
      icon={CreditCardIcon}
    />
  )
}

export function CheckInPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('checkIn.title')}
      emptyTitle={t('checkIn.emptyTitle')}
      description={t('checkIn.description')}
      ctaLabel={t('checkIn.cta')}
      ctaTo="/events"
      icon={ScanLineIcon}
    />
  )
}

export function ReportsPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('reports.title')}
      emptyTitle={t('reports.emptyTitle')}
      description={t('reports.description')}
      ctaLabel={t('reports.cta')}
      ctaTo="/events"
      icon={BarChart3Icon}
    />
  )
}

export function SettingsPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('settings.title')}
      emptyTitle={t('settings.emptyTitle')}
      description={t('settings.description')}
      ctaLabel={t('settings.cta')}
      ctaTo="/dashboard"
      icon={SettingsIcon}
    />
  )
}

export function ActivationPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('activation.title')}
      emptyTitle={t('activation.emptyTitle')}
      description={t('activation.description')}
      ctaLabel={t('activation.cta')}
      ctaTo="/dashboard"
      icon={BellRingIcon}
    />
  )
}

export function NotFoundPage() {
  const { t } = useTranslation('pages')

  return (
    <EmptyStatePage
      title={t('notFound.title')}
      emptyTitle={t('notFound.emptyTitle')}
      description={t('notFound.description')}
      ctaLabel={t('notFound.cta')}
      ctaTo="/dashboard"
      icon={CompassIcon}
    />
  )
}
