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
import { EmptyStatePage } from '@/components/EmptyStatePage'

export function DashboardPage() {
  return (
    <EmptyStatePage
      title="Dashboard"
      emptyTitle="Nothing to report yet"
      description="Once your event is live, attendance and check-in numbers appear here."
      ctaLabel="Browse templates"
      ctaTo="/templates"
      icon={LayoutDashboardIcon}
    />
  )
}

export function TemplatesPage() {
  return (
    <EmptyStatePage
      title="Templates"
      emptyTitle="No templates yet"
      description="Ready-made card designs for weddings, send-offs, corporate events, and birthdays show up here."
      ctaLabel="Go to Events"
      ctaTo="/events"
      icon={LayoutTemplateIcon}
    />
  )
}

export function EventsPage() {
  return (
    <EmptyStatePage
      title="Events"
      emptyTitle="No events yet"
      description="Create your first event to start designing and sending cards."
      ctaLabel="Create an event"
      ctaTo="/dashboard"
      icon={CalendarPlusIcon}
    />
  )
}

export function BillingPage() {
  return (
    <EmptyStatePage
      title="Billing"
      emptyTitle="No payments to show"
      description="Lipa Namba instructions and payment status for your events appear here."
      ctaLabel="Go to Events"
      ctaTo="/events"
      icon={CreditCardIcon}
    />
  )
}

export function CheckInPage() {
  return (
    <EmptyStatePage
      title="Check-In"
      emptyTitle="Check-in unlocks during a live event"
      description="Scan guest and event QR codes at the door once one of your events is live."
      ctaLabel="Go to Events"
      ctaTo="/events"
      icon={ScanLineIcon}
    />
  )
}

export function ReportsPage() {
  return (
    <EmptyStatePage
      title="Reports"
      emptyTitle="No reports yet"
      description="A post-event attendance summary is ready once an event finishes."
      ctaLabel="Go to Events"
      ctaTo="/events"
      icon={BarChart3Icon}
    />
  )
}

export function SettingsPage() {
  return (
    <EmptyStatePage
      title="Settings"
      emptyTitle="Nothing to configure yet"
      description="Account and organization settings will live here."
      ctaLabel="Go to Dashboard"
      ctaTo="/dashboard"
      icon={SettingsIcon}
    />
  )
}

export function ActivationPage() {
  return (
    <EmptyStatePage
      title="Event Activation"
      emptyTitle="No events awaiting activation"
      description="Events with a confirmed Lipa Namba payment appear here for a super admin to activate."
      ctaLabel="Go to Dashboard"
      ctaTo="/dashboard"
      icon={BellRingIcon}
    />
  )
}

export function NotFoundPage() {
  return (
    <EmptyStatePage
      title="Page not found"
      emptyTitle="We couldn't find that page"
      description="The address may be mistyped or the page may have moved."
      ctaLabel="Go to Dashboard"
      ctaTo="/dashboard"
      icon={CompassIcon}
    />
  )
}
