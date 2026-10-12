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
        handle: { crumbKey: 'dashboard' },
        path: 'dashboard',
      },
      {
        Component: TemplatesPage,
        handle: { crumbKey: 'templates' },
        path: 'templates',
      },
      {
        Component: EventsPage,
        handle: { crumbKey: 'events' },
        path: 'events',
      },
      {
        Component: BillingPage,
        handle: { crumbKey: 'billing' },
        path: 'billing',
      },
      {
        Component: CheckInPage,
        handle: { crumbKey: 'checkIn' },
        path: 'check-in',
      },
      {
        Component: ReportsPage,
        handle: { crumbKey: 'reports' },
        path: 'reports',
      },
      {
        Component: SettingsPage,
        handle: { crumbKey: 'settings' },
        path: 'settings',
      },
      {
        Component: RequireSuperAdmin,
        path: 'admin',
        children: [
          {
            Component: ActivationPage,
            handle: { crumbKey: 'activation' },
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
