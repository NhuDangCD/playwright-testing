import { test, expect } from '@playwright/test';
import { NavigationPage } from '../page-objects/navigationPage';
import { ToasterPage } from '../page-objects/toasterPage';

test.describe('Toaster Notification Tests', () => {
    let navigationPage: NavigationPage;
    let toasterPage: ToasterPage;

    test.beforeEach(async ({ page }) => {
        navigationPage = new NavigationPage(page);
        toasterPage = new ToasterPage(page);
        
        await page.goto('/');
        await navigationPage.toastrPage();
        await toasterPage.waitForToastsToLoad();
    });

    test.describe('Basic Toaster Functionality', () => {
        test('should display a basic toast notification', async () => {
            await toasterPage.configureAndShowToast({
                title: 'Test Toast',
                content: 'This is a test message',
                type: 'success'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            const toastText = await toasterPage.getToastText();
            expect(toastText.title).toBe('Test Toast');
            expect(toastText.content).toBe('This is a test message');
        });

        test('should show quick action toasts', async () => {
            // Test Success Toast
            await toasterPage.showSuccessToast();
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            expect(await toasterPage.getToastType()).toBe('success');
            await toasterPage.clearAllToasts();

            // Test Info Toast
            await toasterPage.showInfoToast();
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            expect(await toasterPage.getToastType()).toBe('info');
            await toasterPage.clearAllToasts();

            // Test Warning Toast
            await toasterPage.showWarningToast();
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            expect(await toasterPage.getToastType()).toBe('warning');
            await toasterPage.clearAllToasts();

            // Test Primary Toast
            await toasterPage.showPrimaryToast();
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            expect(await toasterPage.getToastType()).toBe('primary');
            await toasterPage.clearAllToasts();

            // Test Danger Toast
            await toasterPage.showDangerToast();
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            expect(await toasterPage.getToastType()).toBe('danger');
        });
    });

    test.describe('Toast Types', () => {
        test('should display different toast types with custom messages', async () => {
            const toastTypes: Array<'success' | 'info' | 'warning' | 'primary' | 'danger'> = 
                ['success', 'info', 'warning', 'primary', 'danger'];

            for (const type of toastTypes) {
                await toasterPage.configureAndShowToast({
                    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
                    content: `This is a ${type} message`,
                    type: type
                });

                expect(await toasterPage.isToastVisible()).toBeTruthy();
                expect(await toasterPage.getToastType()).toBe(type);
                
                const toastText = await toasterPage.getToastText();
                expect(toastText.title).toContain(type.charAt(0).toUpperCase() + type.slice(1));
                
                await toasterPage.clearAllToasts();
                await toasterPage.waitForNumberOfSeconds(0.5);
            }
        });
    });

    test.describe('Toast Positions', () => {
        test('should display toasts in different positions', async () => {
            const positions: Array<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'> = 
                ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];

            for (const position of positions) {
                await toasterPage.configureAndShowToast({
                    position: position,
                    title: `${position} Toast`,
                    content: `Toast in ${position} position`,
                    type: 'info'
                });

                expect(await toasterPage.isToastVisible()).toBeTruthy();
                const actualPosition = await toasterPage.getToastPosition();
                expect(actualPosition).toBe(position);
                
                await toasterPage.clearAllToasts();
                await toasterPage.waitForNumberOfSeconds(0.5);
            }
        });
    });

    test.describe('Toast Timeout', () => {
        test('should auto-dismiss toast after specified timeout', async () => {
            const timeout = 2000; // 2 seconds
            
            await toasterPage.configureAndShowToast({
                title: 'Auto Dismiss Toast',
                content: 'This will disappear in 2 seconds',
                timeout: timeout,
                type: 'info'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            
            // Wait for toast to disappear
            const disappeared = await toasterPage.waitForToastToDisappear(0, timeout + 1000);
            expect(disappeared).toBeTruthy();
        });

        test('should keep toast visible with 0 timeout', async () => {
            await toasterPage.configureAndShowToast({
                title: 'Persistent Toast',
                content: 'This will not auto-dismiss',
                timeout: 0,
                type: 'warning'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            
            // Wait 3 seconds and check if still visible
            await toasterPage.waitForNumberOfSeconds(3);
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            
            // Clean up
            await toasterPage.clearAllToasts();
        });
    });

    test.describe('Toast Interactions', () => {
        test('should dismiss toast on click when hideOnClick is enabled', async () => {
            await toasterPage.configureAndShowToast({
                title: 'Clickable Toast',
                content: 'Click me to dismiss',
                hideOnClick: true,
                timeout: 0, // Prevent auto-dismiss
                type: 'info'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            
            await toasterPage.clickOnToast(0);
            
            // Toast should disappear after click
            const disappeared = await toasterPage.waitForToastToDisappear(0, 2000);
            expect(disappeared).toBeTruthy();
        });

        test('should not dismiss toast on click when hideOnClick is disabled', async () => {
            await toasterPage.configureAndShowToast({
                title: 'Non-clickable Toast',
                content: 'Clicking me does nothing',
                hideOnClick: false,
                timeout: 0, // Prevent auto-dismiss
                type: 'warning'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            
            await toasterPage.clickOnToast(0);
            await toasterPage.waitForNumberOfSeconds(1);
            
            // Toast should still be visible
            expect(await toasterPage.isToastVisible()).toBeTruthy();
            
            // Clean up
            await toasterPage.clearAllToasts();
        });
    });

    test.describe('Multiple Toasts', () => {
        test('should display multiple toasts simultaneously', async () => {
            // Show 3 different toasts
            await toasterPage.showSuccessToast();
            await toasterPage.waitForNumberOfSeconds(0.5);
            
            await toasterPage.showInfoToast();
            await toasterPage.waitForNumberOfSeconds(0.5);
            
            await toasterPage.showWarningToast();
            await toasterPage.waitForNumberOfSeconds(0.5);

            // Verify all 3 toasts are visible
            const toastCount = await toasterPage.getToastCount();
            expect(toastCount).toBe(3);

            // Verify each toast type
            expect(await toasterPage.getToastType(0)).toBe('success');
            expect(await toasterPage.getToastType(1)).toBe('info');
            expect(await toasterPage.getToastType(2)).toBe('warning');
        });

        test('should clear all toasts', async () => {
            // Show multiple toasts
            await toasterPage.showSuccessToast();
            await toasterPage.showInfoToast();
            await toasterPage.showWarningToast();

            expect(await toasterPage.getToastCount()).toBe(3);

            // Clear all toasts
            await toasterPage.clearAllToasts();
            await toasterPage.waitForNumberOfSeconds(1);

            expect(await toasterPage.getToastCount()).toBe(0);
        });

        test('should clear last toast', async () => {
            // Show multiple toasts
            await toasterPage.showSuccessToast();
            await toasterPage.waitForNumberOfSeconds(0.5);
            await toasterPage.showInfoToast();
            await toasterPage.waitForNumberOfSeconds(0.5);
            await toasterPage.showWarningToast();
            await toasterPage.waitForNumberOfSeconds(0.5);

            expect(await toasterPage.getToastCount()).toBe(3);

            // Clear last toast (warning)
            await toasterPage.clearLastToast();
            await toasterPage.waitForNumberOfSeconds(1);

            expect(await toasterPage.getToastCount()).toBe(2);
            // Verify remaining toasts
            expect(await toasterPage.getToastType(0)).toBe('success');
            expect(await toasterPage.getToastType(1)).toBe('info');
        });
    });

    test.describe('Duplicate Prevention', () => {
        test('should prevent duplicate toasts when enabled', async () => {
            await toasterPage.configureAndShowToast({
                title: 'Unique Toast',
                content: 'This message should not duplicate',
                preventDuplicates: true,
                timeout: 0,
                type: 'info'
            });

            expect(await toasterPage.getToastCount()).toBe(1);

            // Try to show the same toast again
            await toasterPage.showToast();
            await toasterPage.waitForNumberOfSeconds(0.5);

            // Should still have only one toast
            expect(await toasterPage.getToastCount()).toBe(1);

            // Clean up
            await toasterPage.clearAllToasts();
        });

        test('should allow duplicate toasts when disabled', async () => {
            await toasterPage.configureAndShowToast({
                title: 'Duplicate Toast',
                content: 'This message can duplicate',
                preventDuplicates: false,
                timeout: 0,
                type: 'success'
            });

            expect(await toasterPage.getToastCount()).toBe(1);

            // Show the same toast again
            await toasterPage.showToast();
            await toasterPage.waitForNumberOfSeconds(0.5);

            // Should have two toasts
            expect(await toasterPage.getToastCount()).toBe(2);

            // Clean up
            await toasterPage.clearAllToasts();
        });
    });

    test.describe('Edge Cases', () => {
        test('should handle empty title and content', async () => {
            await toasterPage.configureAndShowToast({
                title: '',
                content: '',
                type: 'info'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            const toastText = await toasterPage.getToastText();
            expect(toastText.title).toBe('');
            expect(toastText.content).toBe('');
        });

        test('should handle very long messages', async () => {
            const longTitle = 'This is a very long title that might overflow the toast notification container';
            const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

            await toasterPage.configureAndShowToast({
                title: longTitle,
                content: longContent,
                type: 'warning',
                timeout: 0
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            const toastText = await toasterPage.getToastText();
            expect(toastText.title).toContain('This is a very long title');
            expect(toastText.content).toContain('Lorem ipsum');

            // Clean up
            await toasterPage.clearAllToasts();
        });

        test('should handle special characters in messages', async () => {
            const specialTitle = 'Alert! <script>alert("XSS")</script>';
            const specialContent = 'Special chars: @#$%^&*()_+-={}[]|\\:";\'<>?,./';

            await toasterPage.configureAndShowToast({
                title: specialTitle,
                content: specialContent,
                type: 'danger'
            });

            expect(await toasterPage.isToastVisible()).toBeTruthy();
            const toastText = await toasterPage.getToastText();
            expect(toastText.title).toContain('Alert!');
            expect(toastText.content).toContain('Special chars:');
        });
    });

    test.afterEach(async () => {
        // Clean up any remaining toasts
        await toasterPage.clearAllToasts();
        await toasterPage.waitForNumberOfSeconds(0.5);
    });
});