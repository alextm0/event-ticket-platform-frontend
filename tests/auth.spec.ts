import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should allow a user to log in successfully', async ({ page }) => {
        await page.route('**/api/auth/login', async route => {
            // Set cookies directly in document accessible to client JS and subsequent requests
            await page.evaluate(() => {
                document.cookie = "authToken=mock-jwt-token; path=/; samesite=lax";
                document.cookie = "userId=user-123; path=/; samesite=lax";
                document.cookie = "userRole=attendee; path=/; samesite=lax";
                document.cookie = "userEmail=test@example.com; path=/; samesite=lax";
            });

            await route.fulfill({
                status: 200,
                // Use Playwright's json helper
                json: {
                    token: 'mock-jwt-token',
                    userId: 'user-123',
                    email: 'test@example.com',
                    role: 'attendee'
                }
            });
        });

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        await expect.poll(async () => {
            return await page.evaluate(() => localStorage.getItem('authToken'));
        }).toBe('mock-jwt-token');

        await expect(page).toHaveURL(/http:\/\/localhost:3000\/?$/);
    });

    test('should display error on failed login', async ({ page }) => {
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 401,
                json: {
                    message: 'Invalid email or password'
                }
            });
        });

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('wrong@example.com');
        await page.getByLabel('Password').fill('wrongpass');
        await page.getByRole('button', { name: 'Sign in' }).click();

        const errorContainer = page.locator('.text-red-400');
        await expect(errorContainer).toBeVisible();
        await expect(errorContainer).toContainText(/invalid email or password/i);
    });

});
