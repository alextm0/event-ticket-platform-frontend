import { test, expect, Page } from '@playwright/test';

/**
 * Authentication and Authorization Tests
 * 
 * Tests the complete authentication flow:
 * - User login (email/password only, no role selection)
 * - User signup
 * - Role-based authorization
 * - Protected route access
 * - Session management
 */

// Helper function to mock successful login
async function mockSuccessfulLogin(page: Page, role: 'attendee' | 'organizer' | 'staff' = 'attendee') {
    await page.route('**/api/auth/login', async route => {
        await page.evaluate((userRole) => {
            document.cookie = `authToken=mock-${userRole}-token; path=/; samesite=lax`;
            document.cookie = `userId=${userRole}-123; path=/; samesite=lax`;
            document.cookie = `userRole=${userRole}; path=/; samesite=lax`;
            document.cookie = `userEmail=${userRole}@example.com; path=/; samesite=lax`;
        }, role);

        await route.fulfill({
            status: 200,
            json: {
                token: `mock-${role}-token`,
                userId: `${role}-123`,
                email: `${role}@example.com`,
                role: role
            }
        });
    });
}

test.describe('Authentication Flow', () => {
    test('should allow a user to log in successfully', async ({ page }) => {
        await mockSuccessfulLogin(page, 'attendee');

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Verify token is stored
        await expect.poll(async () => {
            return await page.evaluate(() => localStorage.getItem('authToken'));
        }).toBe('mock-attendee-token');

        // Verify redirect to home page
        await expect(page).toHaveURL(/http:\/\/localhost:3000\/?$/);
    });

    test('should display error on failed login with invalid credentials', async ({ page }) => {
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
        await page.getByRole('button', { name: /sign in/i }).click();

        // Check for error message using text content
        await expect(page.getByText('Invalid email or password')).toBeVisible();
    });

    test('should not require role selection during login', async ({ page }) => {
        await page.goto('/sign-in');

        // Verify there is NO role selector on the login form
        const roleSelector = page.locator('select[name="role"], input[name="role"], [data-testid="role-selector"]');
        await expect(roleSelector).not.toBeVisible();

        // Only email and password fields should be present
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
        await page.route('**/api/auth/login', async route => {
            await route.fulfill({
                status: 500,
                json: {
                    message: 'Internal server error'
                }
            });
        });

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should display error message (could be "Internal server error" or a generic error)
        // Check that an error is shown, even if the exact text varies
        const hasError = await page.getByText(/error|failed|something went wrong/i).isVisible()
            .catch(() => false);
        expect(hasError).toBe(true);
    });

    test('should validate required fields', async ({ page }) => {
        await page.goto('/sign-in');

        // Try to submit without filling fields
        await page.getByRole('button', { name: /sign in/i }).click();

        // Check for HTML5 validation or custom validation messages
        const emailInput = page.getByLabel('Email');
        const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isEmailInvalid).toBe(true);
    });
});

test.describe('User Signup', () => {
    test('should allow new user registration', async ({ page }) => {
        await page.route('**/api/auth/signup', async route => {
            await route.fulfill({
                status: 201,
                json: {
                    token: 'mock-new-user-token',
                    userId: 'new-user-123',
                    email: 'newuser@example.com',
                    role: 'attendee'
                }
            });
        });

        await page.goto('/sign-up');

        // Fill signup form (adjust fields based on actual implementation)
        await page.getByLabel(/email/i).fill('newuser@example.com');
        await page.getByLabel(/^password$/i).fill('SecurePass123!');

        // May have confirm password field
        const confirmPasswordField = page.getByLabel(/confirm password|password confirmation/i);
        if (await confirmPasswordField.isVisible()) {
            await confirmPasswordField.fill('SecurePass123!');
        }

        // May have name field
        const nameField = page.getByLabel(/name|full name/i);
        if (await nameField.isVisible()) {
            await nameField.fill('New User');
        }

        await page.getByRole('button', { name: /sign up|register|create account/i }).click();

        // Verify successful registration (redirect or success message)
        await page.waitForURL(/http:\/\/localhost:3000/, { timeout: 5000 });
    });

    test('should show error for duplicate email', async ({ page }) => {
        await page.route('**/api/auth/signup', async route => {
            await route.fulfill({
                status: 409,
                json: {
                    message: 'Email already exists'
                }
            });
        });

        await page.goto('/sign-up');

        await page.getByLabel(/name/i).fill('Existing User');
        await page.getByLabel(/email/i).fill('existing@example.com');
        await page.getByLabel(/^password$/i).fill('Password123!');

        const confirmPasswordField = page.getByLabel(/confirm password/i);
        if (await confirmPasswordField.isVisible()) {
            await confirmPasswordField.fill('Password123!');
        }

        await page.getByRole('button', { name: /sign up|register/i }).click();

        // Check for error message
        await expect(page.getByText(/email already exists|already registered/i)).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
        await page.goto('/sign-up');

        await page.getByLabel(/email/i).fill('test@example.com');
        await page.getByLabel(/^password$/i).fill('weak');

        const confirmPasswordField = page.getByLabel(/confirm password/i);
        if (await confirmPasswordField.isVisible()) {
            await confirmPasswordField.fill('weak');
        }

        await page.getByRole('button', { name: /sign up|register/i }).click();

        // Should show password validation error
        const hasPasswordError = await page.getByText(/password|weak|strong|characters/i).isVisible()
            .catch(() => false);
        expect(hasPasswordError).toBe(true);
    });
});

test.describe('Role-Based Authorization', () => {
    test('should allow staff to access staff scanner', async ({ page, context }) => {
        // Set up context-level route interception
        await context.route('**/api/v1/**', async (route) => {
            const url = route.request().url();

            // Mock staff assigned events endpoint
            if (url.includes('/api/v1/events/staff/') && url.includes('/assigned-events')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ events: [] })
                });
                return;
            }

            // Mock /api/v1/users/me endpoint
            if (url.includes('/api/v1/users/me')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: 'staff-123',
                        email: 'staff@example.com',
                        role: 'staff'
                    })
                });
                return;
            }

            await route.continue();
        });

        await mockSuccessfulLogin(page, 'staff');

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('staff@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await page.waitForURL(/http:\/\/localhost:3000\/?$/);

        // Navigate to staff scanner
        await page.goto('/staff/scan');

        // Verify we're on the staff route (not redirected)
        await expect(page).toHaveURL(/\/staff\/scan/);

        const url = page.url();
        expect(url).not.toContain('/sign-in');
    });

    test('should allow attendee to access my tickets', async ({ page, context }) => {
        // Set up context-level route interception
        await context.route('**/api/v1/**', async (route) => {
            const url = route.request().url();

            // Mock tickets endpoint
            if (url.includes('/api/v1/tickets') && route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
                return;
            }

            // Mock /api/v1/users/me endpoint
            if (url.includes('/api/v1/users/me')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: 'attendee-123',
                        email: 'attendee@example.com',
                        role: 'attendee'
                    })
                });
                return;
            }

            await route.continue();
        });

        await mockSuccessfulLogin(page, 'attendee');

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('attendee@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await page.waitForURL(/http:\/\/localhost:3000\/?$/);

        // Navigate to my tickets
        await page.goto('/my-tickets');

        // Verify we're on the my tickets route (not redirected)
        await expect(page).toHaveURL(/\/my-tickets/);
        const url = page.url();
        expect(url).not.toContain('/sign-in');
    });

    test('should prevent attendee from accessing organizer dashboard', async ({ page }) => {
        await mockSuccessfulLogin(page, 'attendee');

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('attendee@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await page.waitForURL(/http:\/\/localhost:3000\/?$/);

        // Try to access organizer dashboard
        // The requireRole guard should redirect to '/'
        const response = await page.goto('/organizer');

        // Wait for potential redirect (Next.js server-side redirect)
        try {
            await page.waitForURL(/http:\/\/localhost:3000\/?$/, { timeout: 3000 });
        } catch {
            // If no redirect happened within timeout, check current URL
        }

        const finalUrl = page.url();

        // Should be redirected to home page (the auth guard redirects unauthorized users to '/')
        // The URL should be exactly the home page, not /organizer
        expect(finalUrl).toBe('http://localhost:3000/');
    });
});

test.describe('Session Management', () => {
    test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
        await page.goto('/my-tickets');

        // Should redirect to sign-in page
        await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should persist session across page reloads', async ({ page }) => {
        await mockSuccessfulLogin(page, 'attendee');

        await page.route('**/api/v1/users/me', async route => {
            await route.fulfill({
                status: 200,
                json: { id: 'attendee-123', email: 'attendee@example.com', role: 'attendee' }
            });
        });

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('attendee@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await page.waitForURL(/http:\/\/localhost:3000\/?$/);

        // Reload the page
        await page.reload();

        // Should still be authenticated
        const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
        expect(authToken).toBeTruthy();
    });

    test('should clear session on logout', async ({ page }) => {
        await mockSuccessfulLogin(page, 'attendee');

        await page.route('**/api/v1/users/me', async route => {
            await route.fulfill({
                status: 200,
                json: { id: 'attendee-123', email: 'attendee@example.com', role: 'attendee' }
            });
        });

        // Mock the logout API endpoint
        await page.route('**/api/auth/logout', async route => {
            await route.fulfill({
                status: 200,
                json: { success: true }
            });
        });

        await page.goto('/sign-in');
        await page.getByLabel('Email').fill('attendee@example.com');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await page.waitForURL(/http:\/\/localhost:3000\/?$/);

        // Verify user is logged in
        const authTokenBefore = await page.evaluate(() => localStorage.getItem('authToken'));
        expect(authTokenBefore).toBeTruthy();

        // Find and click logout button
        const logoutButton = page.getByRole('button', { name: /log out|sign out/i });
        await expect(logoutButton).toBeVisible();

        // Click logout and wait for redirect
        await logoutButton.click();

        // Wait for redirect to sign-in page (the logout handler redirects)
        await page.waitForURL(/\/sign-in/, { timeout: 5000 });

        // Verify session is cleared
        const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
        expect(authToken).toBeNull();

        // Verify all auth data is cleared
        const userId = await page.evaluate(() => localStorage.getItem('userId'));
        const userRole = await page.evaluate(() => localStorage.getItem('userRole'));
        const userEmail = await page.evaluate(() => localStorage.getItem('userEmail'));

        expect(userId).toBeNull();
        expect(userRole).toBeNull();
        expect(userEmail).toBeNull();
    });
});
