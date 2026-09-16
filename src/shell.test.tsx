import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoutesStub } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/ThemeProvider'
import { routes } from './routes'

vi.mock('@/lib/event-status', () => ({ isEventLive: vi.fn(() => false) }))
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(() => ({
    name: 'Amina (demo)',
    avatarInitials: 'A',
    role: 'organizer' as const,
  })),
}))

import { isEventLive } from '@/lib/event-status'
import { getCurrentUser } from '@/lib/auth'

function stubViewport({ mobile = false }: { mobile?: boolean } = {}) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: mobile ? 390 : 1024,
  })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const isDark = query.includes('prefers-color-scheme')
      const isMobile = mobile && query.includes('max-width')
      return {
        matches: isDark ? false : isMobile,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    }),
  })
}

function renderAt(path: string) {
  const Stub = createRoutesStub(
    routes as unknown as Parameters<typeof createRoutesStub>[0]
  )
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <Stub initialEntries={[path]} />
      </TooltipProvider>
    </ThemeProvider>
  )
}

// The sidebar's own nav landmark. The breadcrumb's BreadcrumbPage also uses
// role="link", so nav assertions are scoped here to avoid that collision.
function nav() {
  return within(screen.getByRole('navigation', { name: 'Main' }))
}

beforeEach(() => {
  stubViewport()
  vi.mocked(isEventLive).mockReturnValue(false)
  vi.mocked(getCurrentUser).mockReturnValue({
    name: 'Amina (demo)',
    avatarInitials: 'A',
    role: 'organizer',
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('shell keyboard contract (AC-5)', () => {
  it('the skip link is the first focusable thing and moves focus to the content area', async () => {
    const user = userEvent.setup()
    renderAt('/dashboard')

    const skip = screen.getByRole('link', { name: /skip to content/i })
    await user.tab()
    expect(skip).toHaveFocus()

    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(document.getElementById('main-content')).toHaveFocus()
    )
  })

  it('every sidebar item is reachable by Tab and activatable by Enter', async () => {
    const user = userEvent.setup()
    renderAt('/dashboard')

    for (const title of [
      'Dashboard',
      'Templates',
      'Events',
      'Billing',
      'Reports',
      'Settings',
    ]) {
      expect(nav().getByRole('link', { name: title })).toBeInTheDocument()
    }
    expect(nav().queryByRole('link', { name: 'Check-In' })).toBeNull()

    // Tab past the skip link and brand header until Templates is focused,
    // then activate it with Enter (jsdom fires click via user-event's
    // keyboard behaviour, which React Router's Link handles).
    const target = nav().getByRole('link', { name: 'Templates' })
    for (let i = 0; i < 8; i += 1) {
      if (document.activeElement === target) break
      await user.tab()
    }
    expect(document.activeElement).toBe(target)

    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /^templates$/i })
      ).toBeInTheDocument()
    )
  })

  it('the active item carries aria-current="page"', () => {
    renderAt('/reports')

    expect(nav().getByRole('link', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(nav().getByRole('link', { name: 'Events' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('focus moves to the content area on route change', async () => {
    renderAt('/dashboard')

    fireEvent.click(nav().getByRole('link', { name: 'Settings' }))

    await waitFor(() =>
      expect(document.getElementById('main-content')).toHaveFocus()
    )
    expect(
      screen.getByRole('heading', { level: 1, name: /^settings$/i })
    ).toBeInTheDocument()
  })

  it('Escape closes the mobile overlay (matchMedia forced to the overlay variant)', async () => {
    stubViewport({ mobile: true })
    const user = userEvent.setup()
    renderAt('/dashboard')

    const trigger = screen.getByRole('button', { name: /toggle sidebar/i })
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })
})

describe('nav visibility from the two stub seams (AC-2)', () => {
  it('Check-In appears only while the liveness stub says an event is live', () => {
    const { unmount } = renderAt('/dashboard')
    expect(nav().queryByRole('link', { name: 'Check-In' })).toBeNull()

    vi.mocked(isEventLive).mockReturnValue(true)
    unmount()
    renderAt('/dashboard')
    expect(nav().getByRole('link', { name: 'Check-In' })).toBeInTheDocument()
  })

  it('Event Activation appears only when the auth stub role is super admin', () => {
    const { unmount } = renderAt('/dashboard')
    expect(nav().queryByRole('link', { name: 'Event Activation' })).toBeNull()

    vi.mocked(getCurrentUser).mockReturnValue({
      name: 'Amina (demo)',
      avatarInitials: 'A',
      role: 'super_admin',
    })
    unmount()
    renderAt('/dashboard')
    expect(
      nav().getByRole('link', { name: 'Event Activation' })
    ).toBeInTheDocument()
  })

  it('hiding Check-In in the nav does not block a direct visit to /check-in', () => {
    renderAt('/check-in')
    expect(nav().queryByRole('link', { name: 'Check-In' })).toBeNull()
    expect(
      screen.getByRole('heading', { level: 1, name: /^check-in$/i })
    ).toBeInTheDocument()
  })
})

describe('role guard on /admin/activation (AC-3)', () => {
  it('redirects a plain organizer to /dashboard with a readable notice', async () => {
    renderAt('/admin/activation')

    expect(
      await screen.findByRole('heading', { level: 1, name: /^dashboard$/i })
    ).toBeInTheDocument()
    expect(
      await screen.findByText(
        'Event Activation is only available to super admins.'
      )
    ).toBeInTheDocument()
  })

  it('renders the Activation page for a super admin', () => {
    vi.mocked(getCurrentUser).mockReturnValue({
      name: 'Amina (demo)',
      avatarInitials: 'A',
      role: 'super_admin',
    })
    renderAt('/admin/activation')

    expect(
      screen.getByRole('heading', { level: 1, name: /^event activation$/i })
    ).toBeInTheDocument()
  })
})
