import { expect, test } from '@playwright/test'

test('the dev server serves the scaffold heading', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /get started/i })
  ).toBeVisible()
})
