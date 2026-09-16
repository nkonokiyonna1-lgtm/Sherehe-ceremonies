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
  title: string
  href: string
  icon: LucideIcon
  visibility: NavVisibility
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
    visibility: 'always',
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: LayoutTemplateIcon,
    visibility: 'always',
  },
  {
    title: 'Events',
    href: '/events',
    icon: CalendarDaysIcon,
    visibility: 'always',
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCardIcon,
    visibility: 'always',
  },
  {
    title: 'Check-In',
    href: '/check-in',
    icon: ScanLineIcon,
    visibility: 'live_event',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3Icon,
    visibility: 'always',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    visibility: 'always',
  },
  {
    title: 'Event Activation',
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
