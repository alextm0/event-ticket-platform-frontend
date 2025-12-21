import { Page } from '@playwright/test';

/**
 * Shared test utilities and helpers for Playwright tests
 */

export type UserRole = 'attendee' | 'organizer' | 'staff';

/**
 * Mock successful authentication for a specific user role
 */
export async function mockAuthentication(
    page: Page,
    role: UserRole = 'attendee',
    userId?: string,
    email?: string
) {
    const actualUserId = userId || `${role}-123`;
    const actualEmail = email || `${role}@example.com`;

    await page.route('**/api/auth/login', async route => {
        await page.evaluate((data) => {
            document.cookie = `authToken=mock-${data.role}-token; path=/; samesite=lax`;
            document.cookie = `userId=${data.userId}; path=/; samesite=lax`;
            document.cookie = `userRole=${data.role}; path=/; samesite=lax`;
            document.cookie = `userEmail=${data.email}; path=/; samesite=lax`;
        }, { role, userId: actualUserId, email: actualEmail });

        await route.fulfill({
            status: 200,
            json: {
                token: `mock-${role}-token`,
                userId: actualUserId,
                email: actualEmail,
                role: role
            }
        });
    });
}

/**
 * Perform login flow with credentials
 */
export async function loginWithCredentials(
    page: Page,
    email: string,
    password: string
) {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
}

/**
 * Mock the /api/v1/users/me endpoint
 */
export async function mockUserMeEndpoint(
    page: Page,
    role: UserRole,
    userId?: string,
    email?: string
) {
    const actualUserId = userId || `${role}-123`;
    const actualEmail = email || `${role}@example.com`;

    await page.route('**/api/v1/users/me', async route => {
        await route.fulfill({
            status: 200,
            json: {
                id: actualUserId,
                email: actualEmail,
                role: role,
                name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`
            }
        });
    });
}

/**
 * Mock published events endpoint
 */
export async function mockPublishedEvents(page: Page, events: any[] = []) {
    await page.route('**/api/v1/published-events*', async route => {
        if (route.request().method() === 'GET' && !route.request().url().includes('/published-event/')) {
            await route.fulfill({
                status: 200,
                json: events
            });
        }
    });
}

/**
 * Mock organizer events endpoint
 */
export async function mockOrganizerEvents(page: Page, events: any[] = []) {
    await page.route('**/api/v1/events*', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                json: events
            });
        }
    });
}

/**
 * Mock staff assigned events endpoint
 */
export async function mockStaffAssignedEvents(page: Page, staffId: string, events: any[] = []) {
    await page.route(`**/api/v1/events/staff/${staffId}/assigned-events`, async route => {
        await route.fulfill({
            status: 200,
            json: events
        });
    });
}

/**
 * Mock user tickets endpoint
 */
export async function mockUserTickets(page: Page, tickets: any[] = []) {
    await page.route('**/api/v1/tickets*', async route => {
        if (route.request().method() === 'GET' && !route.request().url().match(/\/tickets\/[^\/]+$/)) {
            await route.fulfill({
                status: 200,
                json: tickets
            });
        }
    });
}

/**
 * Create a mock event object
 */
export function createMockEvent(overrides: Partial<any> = {}) {
    return {
        id: 'event-123',
        name: 'Test Event',
        description: 'A test event description',
        location: 'Test Venue',
        startDateTime: new Date(Date.now() + 86400000 * 30).toISOString(),
        endDateTime: new Date(Date.now() + 86400000 * 31).toISOString(),
        status: 'PUBLISHED',
        ...overrides
    };
}

/**
 * Create a mock ticket type object
 */
export function createMockTicketType(overrides: Partial<any> = {}) {
    return {
        id: 'ticket-type-123',
        name: 'General Admission',
        description: 'Standard entry ticket',
        price: 50.00,
        quantity: 100,
        available: 100,
        active: true,
        ...overrides
    };
}

/**
 * Create a mock ticket object
 */
export function createMockTicket(overrides: Partial<any> = {}) {
    return {
        id: 'ticket-123',
        eventName: 'Test Event',
        eventLocation: 'Test Venue',
        eventStartDateTime: new Date(Date.now() + 86400000 * 30).toISOString(),
        ticketTypeName: 'General Admission',
        price: 50.00,
        status: 'ACTIVE',
        purchaseDate: new Date().toISOString(),
        ...overrides
    };
}

/**
 * Create a mock validation response
 */
export function createMockValidation(
    status: 'VALID' | 'INVALID' | 'ALREADY_CHECKED_IN',
    overrides: Partial<any> = {}
) {
    return {
        id: 'validation-123',
        validationStatus: status,
        qrCodeId: 'qr-code-123',
        ticketId: status !== 'INVALID' ? 'ticket-123' : undefined,
        eventId: 'event-123',
        validatedAt: new Date().toISOString(),
        validatedBy: 'staff-123',
        reason: status === 'INVALID' ? 'Ticket not found' :
            status === 'ALREADY_CHECKED_IN' ? 'Already checked in' : undefined,
        ...overrides
    };
}

/**
 * Wait for authentication to complete
 */
export async function waitForAuth(page: Page) {
    await page.waitForURL(/http:\/\/localhost:3000\/?$/);
    await page.waitForFunction(() => {
        return localStorage.getItem('authToken') !== null;
    });
}

/**
 * Clear authentication state
 */
export async function clearAuth(page: Page) {
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    });
}
