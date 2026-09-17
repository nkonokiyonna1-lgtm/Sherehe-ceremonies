import type { RouteObject } from 'react-router'
import ShellLayout from '@/layouts/ShellLayout'
import { RequireSuperAdmin } from '@/components/RequireSuperAdmin'
import { LandingPage } from '@/pages/LandingPage'
import {
  ActivationPage,
  BillingPage,
  CheckInPage,
  DashboardPage,
  EventsPage,
  NotFoundPage,
  ReportsPage,
  SettingsPage,
  TemplatesPage,
} from '@/pages/pages'

export const routes: RouteObject[] = [
  {
    Component: LandingPage,
    path: '/',
  },
  {
    Component: ShellLayout,
    children: [
      {
        Component: DashboardPage,
        handle: { crumb: 'Dashboard' },
        path: 'dashboard',
      },
      {
        Component: TemplatesPage,
        handle: { crumb: 'Templates' },
        path: 'templates',
      },
      {
        Component: EventsPage,
        handle: { crumb: 'Events' },
        path: 'events',
      },
      {
        Component: BillingPage,
        handle: { crumb: 'Billing' },
        path: 'billing',
      },
      {
        Component: CheckInPage,
        handle: { crumb: 'Check-In' },
        path: 'check-in',
      },
      {
        Component: ReportsPage,
        handle: { crumb: 'Reports' },
        path: 'reports',
      },
      {
        Component: SettingsPage,
        handle: { crumb: 'Settings' },
        path: 'settings',
      },
      {
        Component: RequireSuperAdmin,
        path: 'admin',
        children: [
          {
            Component: ActivationPage,
            handle: { crumb: 'Activation' },
            path: 'activation',
          },
        ],
      },
      {
        Component: NotFoundPage,
        path: '*',
      },
    ],
  },
]
