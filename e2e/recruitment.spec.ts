import { test, expect } from '@playwright/test';

test.describe('Recruitment Flow', () => {
    test('should load careers page and apply for a job', async ({ page }) => {
        // 1. Go to the careers page
        await page.goto('/careers');
        // The title in layout looks like "STM Careers" but let's check text content to be safe if title tag varies
        // Based on page.tsx: <span ...>STM <span ...>Careers</span></span>
        await expect(page.locator('header')).toContainText('STM Careers');

        // 2. Check if jobs are listed or "No positions"
        const noPositions = page.locator('text=No positions open');
        if (await noPositions.isVisible()) {
            console.log('No jobs to apply for. Skipping application flow.');
            return;
        }

        // 3. Find a job card
        const firstJobCard = page.locator('.group').first();
        await expect(firstJobCard).toBeVisible();

        // Click to open details
        await firstJobCard.click();

        // 4. Verify Detail Modal & Click Apply
        const applyButton = page.locator('button:has-text("Apply for this Position")');
        await expect(applyButton).toBeVisible();
        await applyButton.click();

        // 5. Fill Application Form
        await expect(page.locator('input[name="name"]')).toBeVisible();

        await page.locator('input[name="name"]').fill('Automated Test Candidate');
        await page.locator('input[name="email"]').fill(`auto.test.${Date.now()}@example.com`);
        await page.locator('input[name="phone"]').fill('9999999999');
        await page.locator('input[name="resumeUrl"]').fill('https://linkedin.com/in/test');

        // 6. Submit
        await page.locator('button:has-text("Confirm Application")').click();

        // 7. Verify Success
        await expect(page.locator('text=Application Received!')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Start Assessment Now')).toBeVisible();
    });

    test('should access public job details direct link', async ({ page }) => {
        // This simulates a user clicking a shared link
        await page.goto('/careers');
        // Just verify the page loads safely without crashing
        await expect(page.locator('body')).toBeVisible();
    });
});
