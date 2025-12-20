import { test, expect } from '@playwright/test';

test.describe('Smoke Test - Landing Page', () => {
    test('should redirect unauthenticated users to sign-in', async ({ page }) => {
        // Start from the index page
        await page.goto('/');

        // Expect to be redirected to the sign-in page
        await expect(page).toHaveURL(/\/sign-in/);

        // Verify the sign-in page content is visible
        await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
    });
});
