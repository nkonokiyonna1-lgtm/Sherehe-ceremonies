import {
  BarChart3Icon,
  BellRingIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  SettingsIcon,
  ScanLineIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { isEventLive } from '@/lib/event-status'

export type NavVisibility = 'always' | 'super_admin' | 'live_event'

export type NavItem = {
  titleKey: string
  href: string
  icon: LucideIcon
  visibility: NavVisibility
}

export const navItems: NavItem[] = [
  {
    titleKey: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
    visibility: 'always',
  },
  {
    titleKey: 'templates',
    href: '/templates',
    icon: LayoutTemplateIcon,
    visibility: 'always',
  },
  {
    titleKey: 'events',
    href: '/events',
    icon: CalendarDaysIcon,
    visibility: 'always',
  },
  {
    titleKey: 'billing',
    href: '/billing',
    icon: CreditCardIcon,
    visibility: 'always',
  },
  {
    titleKey: 'checkIn',
    href: '/check-in',
    icon: ScanLineIcon,
    visibility: 'live_event',
  },
  {
    titleKey: 'reports',
    href: '/reports',
    icon: BarChart3Icon,
    visibility: 'always',
  },
  {
    titleKey: 'settings',
    href: '/settings',
    icon: SettingsIcon,
    visibility: 'always',
  },
  {
    titleKey: 'eventActivation',
    href: '/admin/activation',
    icon: BellRingIcon,
    visibility: 'super_admin',
  },
]

function isItemVisible(item: NavItem): boolean {
  if (item.visibility === 'live_event') return isEventLive()
  if (item.visibility === 'super_admin')
    return getCurrentUser().role === 'super_admin'
  return true
}

export function visibleNavItems(): NavItem[] {
  return navItems.filter(isItemVisible)
}
