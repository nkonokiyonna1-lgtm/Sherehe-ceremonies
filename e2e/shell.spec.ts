import { expect, test } from '@playwright/test'

const organizerUrls = [
  ['/dashboard', 'Dashboard'],
  ['/templates', 'Templates'],
  ['/events', 'Events'],
  ['/billing', 'Billing'],
  ['/check-in', 'Check-In'],
  ['/reports', 'Reports'],
  ['/settings', 'Settings'],
] as const

test.describe('shell at every nav URL (AC-8)', () => {
  for (const [url, heading] of organizerUrls) {
    test(`renders the shell and ${heading} at ${url}`, async ({ page }) => {
      await page.goto(url)
      await expect(
        page.getByRole('heading', { level: 1, name: heading })
      ).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
    })
  }

  test('renders the landing page outside the shell at /', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /beautiful invitation cards/i,
      })
    ).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0)
  })

  test('renders NotFound inside the shell for a mistyped URL', async ({
    page,
  }) => {
    await page.goto('/evnts')
    await expect(
      page.getByRole('heading', { level: 1, name: /page not found/i })
    ).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  })

  test('redirects /admin/activation to /dashboard with a notice', async ({
    page,
  }) => {
    await page.goto('/admin/activation')
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByText('Event Activation is only available to super admins.')
    ).toBeVisible()
  })
})

test.describe('sidebar behavior (AC-1, AC-5)', () => {
  test('the collapse button collapses the sidebar at desktop width', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/dashboard')

    const sidebar = page.locator('[data-slot="sidebar"]')
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')

    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed')

    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    await expect(sidebar).toHaveAttribute('data-state', 'expanded')
  })

  test('the sidebar is an overlay sheet at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard')

    // Inline sidebar is hidden; the trigger opens it as an overlay dialog.
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden()

    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Templates' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('a keyboard-only walk reaches content through the skip link', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: /skip to content/i })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()

    await page.keyboard.press('Enter')
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe('main-content')
  })
})
