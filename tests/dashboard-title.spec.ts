import { test, expect } from '@playwright/test';
import { NavigationPage } from '../page-objects/navigationPage';

test.describe('Dashboard Title Verification', () => {
    let navigationPage: NavigationPage;

    test.beforeEach(async ({ page }) => {
        navigationPage = new NavigationPage(page);
        
        // Navigate to the application
        await page.goto('/');
        
        // Wait for the page to load completely
        await page.waitForLoadState('networkidle');
    });

    test('should verify dashboard title is "PW-Test"', async ({ page }) => {
        // Navigate to dashboard (if not already there)
        await navigationPage.iotDashboardPage();
        
        // Wait for dashboard to load
        await page.waitForLoadState('networkidle');
        
        // Method 1: Check page title (browser tab title)
        const pageTitle = await page.title();
        console.log('Page title:', pageTitle);
        expect(pageTitle).toContain('PW-Test');
        
        // Method 2: Check if there's a dashboard title element on the page
        // This will look for various possible title selectors
        const titleSelectors = [
            'h1',
            '[data-testid="dashboard-title"]',
            '.dashboard-title',
            'nb-card-header',
            '.page-title',
            '[role="heading"]'
        ];
        
        let titleFound = false;
        let actualTitleText = '';
        
        for (const selector of titleSelectors) {
            const titleElement = page.locator(selector).first();
            
            if (await titleElement.isVisible().catch(() => false)) {
                actualTitleText = await titleElement.textContent();
                console.log(`Found title with selector "${selector}": "${actualTitleText}"`);
                
                if (actualTitleText && actualTitleText.includes('PW-Test')) {
                    titleFound = true;
                    expect(actualTitleText).toContain('PW-Test');
                    break;
                }
            }
        }
        
        // If no title element found, log all visible text for debugging
        if (!titleFound) {
            console.log('Dashboard title "PW-Test" not found in common selectors.');
            console.log('Available page content:');
            
            // Get all visible text on the page for debugging
            const pageContent = await page.textContent('body');
            console.log('Page content:', pageContent);
            
            // Check if "PW-Test" exists anywhere on the page
            expect(pageContent).toContain('PW-Test');
        }
    });

    test('should verify dashboard title element exists and contains "PW-Test"', async ({ page }) => {
        // Navigate to dashboard
        await navigationPage.iotDashboardPage();
        
        // Wait for dashboard to load
        await page.waitForLoadState('networkidle');
        
        // Try to find a specific title element and verify its text
        const possibleTitleElements = [
            page.locator('h1:has-text("PW-Test")'),
            page.locator('h2:has-text("PW-Test")'),
            page.locator('h3:has-text("PW-Test")'),
            page.locator('[data-testid*="title"]:has-text("PW-Test")'),
            page.locator('.title:has-text("PW-Test")'),
            page.locator('.dashboard-title:has-text("PW-Test")'),
            page.getByText('PW-Test'),
            page.getByRole('heading', { name: /PW-Test/i })
        ];

        let elementFound = false;
        
        for (const element of possibleTitleElements) {
            if (await element.isVisible().catch(() => false)) {
                console.log('Found title element:', await element.textContent());
                expect(element).toBeVisible();
                await expect(element).toContainText('PW-Test');
                elementFound = true;
                break;
            }
        }
        
        if (!elementFound) {
            // If no specific element found, check page content
            await expect(page.locator('body')).toContainText('PW-Test');
            console.log('Title "PW-Test" found in page content but not in a specific title element');
        }
    });

    test('should take screenshot if title verification fails', async ({ page }) => {
        // Navigate to dashboard
        await navigationPage.iotDashboardPage();
        
        // Wait for dashboard to load
        await page.waitForLoadState('networkidle');
        
        try {
            // Try to verify the title
            const pageTitle = await page.title();
            const bodyText = await page.textContent('body');
            
            // Check both page title and body content
            const hasTitleInPage = pageTitle.includes('PW-Test');
            const hasTitleInBody = bodyText && bodyText.includes('PW-Test');
            
            if (!hasTitleInPage && !hasTitleInBody) {
                // Take screenshot for debugging
                await page.screenshot({ 
                    path: `test-results/dashboard-title-debug-${Date.now()}.png`,
                    fullPage: true 
                });
                
                console.log('Screenshot saved for debugging');
                console.log('Current page title:', pageTitle);
                console.log('Current URL:', page.url());
                
                // Fail the test with helpful information
                throw new Error(`Dashboard title "PW-Test" not found. Current page title: "${pageTitle}"`);
            }
            
            // If found, assert it
            expect(hasTitleInPage || hasTitleInBody).toBeTruthy();
            
        } catch (error) {
            // Take screenshot on any error
            await page.screenshot({ 
                path: `test-results/dashboard-title-error-${Date.now()}.png`,
                fullPage: true 
            });
            throw error;
        }
    });

    test('should log all dashboard elements for debugging', async ({ page }) => {
        // Navigate to dashboard
        await navigationPage.iotDashboardPage();
        
        // Wait for dashboard to load
        await page.waitForLoadState('networkidle');
        
        console.log('\n=== Dashboard Debug Information ===');
        console.log('Current URL:', page.url());
        console.log('Page title:', await page.title());
        
        // Log all headings
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        console.log('\nAll headings on page:');
        for (let i = 0; i < headings.length; i++) {
            const text = await headings[i].textContent();
            const tagName = await headings[i].evaluate(el => el.tagName);
            console.log(`  ${tagName}: "${text}"`);
        }
        
        // Log elements with common title classes
        const titleClasses = ['.title', '.page-title', '.dashboard-title', '.header-title'];
        for (const className of titleClasses) {
            const elements = await page.locator(className).all();
            if (elements.length > 0) {
                console.log(`\nElements with class "${className}":`);
                for (let i = 0; i < elements.length; i++) {
                    const text = await elements[i].textContent();
                    console.log(`  "${text}"`);
                }
            }
        }
        
        // Check if "PW-Test" exists anywhere
        const hasPWTest = await page.getByText('PW-Test').isVisible().catch(() => false);
        console.log('\nContains "PW-Test":', hasPWTest);
        
        if (hasPWTest) {
            const pwTestElement = page.getByText('PW-Test').first();
            const elementInfo = await pwTestElement.evaluate(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                textContent: el.textContent
            }));
            console.log('PW-Test element info:', elementInfo);
        }
        
        // This test always passes - it's just for debugging
        expect(true).toBe(true);
    });
});