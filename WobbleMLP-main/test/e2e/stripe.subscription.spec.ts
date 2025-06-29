import { test, expect } from '@playwright/test';
// Remove the vi import since we're using Playwright's mocking capabilities

test.describe('Stripe Subscription', () => {
  test('should handle plan downgrade gracefully', async ({ page }) => {
    await page.goto('/settings');
    await page.getByText('Downgrade Plan').click();

    // Mock Stripe checkout using Playwright
    await page.evaluate(() => {
      window.Stripe = {
        redirectToCheckout: (options: any) => Promise.resolve({
          sessionId: 'test_session',
        }),
      } as any;
    });

    await page.getByText('Confirm Downgrade').click();
    await expect(page.getByText('Plan downgrade initiated')).toBeVisible();
    await expect(page.getByText('Your subscription will be updated')).toBeVisible();
  });

  test('should show subscription status correctly', async ({ page }) => {
    await page.goto('/account');
    await expect(page.getByText('Current Plan: Basic')).toBeVisible();
    await expect(page.getByText('Next Billing Date')).toBeVisible();
  });
});
