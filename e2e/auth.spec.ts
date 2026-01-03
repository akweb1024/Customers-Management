import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Go to login page before each test
        await page.goto('/login');
    });

    test('should verify login page elements', async ({ page }) => {
        // Verify form elements
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        // Fill credentials
        await page.locator('input[type="email"]').fill('admin@stm.com');
        await page.locator('input[type="password"]').fill('password123');

        // Submit
        await page.locator('button[type="submit"]').click();

        // Verify redirection to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/);

        // Verify user is logged in by checking a dashboard element
        await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        // Fill invalid credentials
        await page.locator('input[type="email"]').fill('admin@stm.com');
        await page.locator('input[type="password"]').fill('wrongpassword');

        // Submit
        await page.locator('button[type="submit"]').click();

        // Verify error message (this depends on your implementation, usually an alert or toast)
        // Checking for a generic error indicator or just that url didn't change
        await expect(page).not.toHaveURL(/.*\/dashboard/);
    });
});
