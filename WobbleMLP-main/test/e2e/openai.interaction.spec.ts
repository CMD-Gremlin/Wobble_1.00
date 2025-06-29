import { test, expect } from '@playwright/test';
import { vi } from 'vitest';

test.describe('OpenAI Interaction', () => {
  test('should handle successful OpenAI interaction', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Type your message...').fill('Hello!');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText('Hello!')).toBeVisible();
    await expect(page.getByText('Hi there!')).toBeVisible();
  });

  test('should handle quota exhaustion gracefully', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Type your message...').fill('Test quota');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText('Rate limit exceeded')).toBeVisible();
    await expect(page.getByText('Try again later')).toBeVisible();
  });
});
