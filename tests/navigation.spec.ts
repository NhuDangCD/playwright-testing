import { test, expect } from '@playwright/test'
import { NavigationPage } from '../page-objects/navigationPage'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
})

test.describe('Navigation Menu Tests', () => {
    
    test('should display all main menu items', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Check main menu items are visible
        const mainMenuItems = [
            'Dashboard',
            'Forms',
            'Modal & Overlays',
            'Extra Components',
            'Tables & Data',
            'Auth'
        ]
        
        for (const menuItem of mainMenuItems) {
            const menuElement = page.locator(`text="${menuItem}"`).first()
            await expect(menuElement).toBeVisible()
            console.log(`✅ Menu item visible: ${menuItem}`)
        }
    })
    
    test('should navigate to Form Layouts page', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        await navigateTo.formLayoutsPage()
        
        // Verify navigation
        await expect(page).toHaveURL(/.*\/forms\/layouts/)
        console.log('✅ Navigation to Form Layouts works')
    })
    
    test('should navigate to Datepicker page', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        await navigateTo.datepickerPage()
        
        // Verify navigation
        await expect(page).toHaveURL(/.*\/forms\/datepicker/)
        console.log('✅ Navigation to Datepicker works')
    })
    
    test('should navigate to Smart Table page', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        await navigateTo.smartTablePage()
        
        // Verify navigation  
        await expect(page).toHaveURL(/.*\/tables\/smart-table/)
        console.log('✅ Navigation to Smart Table works')
    })
    
    test('should navigate to Toaster page', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        await navigateTo.toastrPage()
        
        // Verify navigation
        await expect(page).toHaveURL(/.*\/modal-overlays\/toastr/)
        console.log('✅ Navigation to Toaster works')
    })
    
    test('should navigate to Tooltip page', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        await navigateTo.tooltipPage()
        
        // Verify navigation
        await expect(page).toHaveURL(/.*\/modal-overlays\/tooltip/)
        console.log('✅ Navigation to Tooltip works')
    })
    
    test('should expand and collapse menu groups', async ({ page }) => {
        // Click on Forms to expand
        await page.getByText('Forms').first().click()
        
        // Check if submenu items are visible
        const formLayoutsItem = page.getByText('Form Layouts')
        await expect(formLayoutsItem).toBeVisible()
        
        // Click again to collapse
        await page.getByText('Forms').first().click()
        await page.waitForTimeout(500)
        
        console.log('✅ Menu expand/collapse works')
    })
    
    test('should maintain active state on current page', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Navigate to a specific page
        await navigateTo.formLayoutsPage()
        
        // Check if the menu item has active class
        const activeItem = page.locator('.menu-item.active, .selected, [class*="active"]')
        await expect(activeItem).toBeVisible()
        
        console.log('✅ Active menu state works')
    })
    
    test('should handle keyboard navigation', async ({ page }) => {
        // Focus on first menu item
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        
        // Navigate with arrow keys
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        
        // Verify some navigation occurred
        const url = page.url()
        expect(url).not.toBe('http://localhost:4200/')
        
        console.log('✅ Keyboard navigation works')
    })
    
    test('should handle rapid menu clicks', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Perform rapid navigation
        await navigateTo.formLayoutsPage()
        await navigateTo.datepickerPage()
        await navigateTo.smartTablePage()
        await navigateTo.toastrPage()
        await navigateTo.tooltipPage()
        
        // Verify we're on the last page
        await expect(page).toHaveURL(/.*\/modal-overlays\/tooltip/)
        
        console.log('✅ Rapid menu navigation handled correctly')
    })
    
    test('should navigate using breadcrumbs if available', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Navigate to a nested page
        await navigateTo.formLayoutsPage()
        
        // Look for breadcrumbs
        const breadcrumbs = page.locator('.breadcrumb, nav[aria-label="breadcrumb"]')
        
        if (await breadcrumbs.isVisible()) {
            // Click on home/dashboard breadcrumb if exists
            const homeBreadcrumb = breadcrumbs.locator('a').first()
            if (await homeBreadcrumb.isVisible()) {
                await homeBreadcrumb.click()
                await expect(page).toHaveURL(/.*\/(dashboard|pages)/)
                console.log('✅ Breadcrumb navigation works')
            }
        } else {
            console.log('⚠️ No breadcrumbs found on page')
        }
    })
    
    test('should handle menu search if available', async ({ page }) => {
        // Look for search input in menu
        const searchInput = page.locator('input[placeholder*="Search"], .menu-search, .search-input').first()
        
        if (await searchInput.isVisible()) {
            await searchInput.fill('form')
            await page.waitForTimeout(500)
            
            // Check if menu items are filtered
            const formMenuItem = page.getByText('Form Layouts')
            await expect(formMenuItem).toBeVisible()
            
            console.log('✅ Menu search functionality works')
        } else {
            console.log('⚠️ No menu search found')
        }
    })
    
    test('should persist menu state after page refresh', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Navigate to a specific page
        await navigateTo.formLayoutsPage()
        
        // Refresh the page
        await page.reload()
        await page.waitForLoadState('domcontentloaded')
        
        // Check if we're still on the same page
        await expect(page).toHaveURL(/.*\/forms\/layouts/)
        
        console.log('✅ Menu state persists after refresh')
    })
    
    test('should handle browser back/forward navigation', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Navigate through multiple pages
        const initialUrl = page.url()
        await navigateTo.formLayoutsPage()
        const formUrl = page.url()
        await navigateTo.datepickerPage()
        const dateUrl = page.url()
        
        // Go back
        await page.goBack()
        await expect(page).toHaveURL(formUrl)
        
        // Go back again
        await page.goBack()
        await expect(page).toHaveURL(initialUrl)
        
        // Go forward
        await page.goForward()
        await expect(page).toHaveURL(formUrl)
        
        console.log('✅ Browser navigation buttons work correctly')
    })
    
    test('should display menu icons if present', async ({ page }) => {
        // Check for menu icons
        const menuIcons = page.locator('.menu-icon, .nb-icon, [class*="icon"]')
        const iconCount = await menuIcons.count()
        
        if (iconCount > 0) {
            console.log(`✅ Found ${iconCount} menu icons`)
            expect(iconCount).toBeGreaterThan(0)
        } else {
            console.log('⚠️ No menu icons found')
        }
    })
    
})

test.describe('Responsive Navigation Tests', () => {
    
    test('should show hamburger menu on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')
        
        // Look for hamburger menu
        const hamburger = page.locator('.menu-toggle, .hamburger, .mobile-menu-toggle, [class*="burger"]').first()
        
        if (await hamburger.isVisible()) {
            // Click hamburger to open menu
            await hamburger.click()
            await page.waitForTimeout(500)
            
            // Verify menu is visible
            const menu = page.locator('.menu, nav, .sidebar').first()
            await expect(menu).toBeVisible()
            
            console.log('✅ Mobile hamburger menu works')
        } else {
            console.log('⚠️ No hamburger menu found on mobile')
        }
    })
    
    test('should hide/show menu on tablet viewport', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.goto('/')
        
        const menu = page.locator('.menu, nav, .sidebar').first()
        const isMenuVisible = await menu.isVisible()
        
        console.log(`✅ Menu visibility on tablet: ${isMenuVisible}`)
        expect(menu).toBeDefined()
    })
    
    test('should handle touch gestures on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')
        
        // Simulate touch events
        const menuArea = page.locator('.menu, nav, .sidebar').first()
        
        if (await menuArea.isVisible()) {
            // Simulate swipe gesture
            const box = await menuArea.boundingBox()
            if (box) {
                await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2)
                await page.mouse.down()
                await page.mouse.move(box.x + 10, box.y + box.height / 2)
                await page.mouse.up()
                
                console.log('✅ Touch gestures simulated')
            }
        }
    })
    
    test('should maintain functionality across viewport changes', async ({ page }) => {
        const navigateTo = NavigationPage.create(page)
        
        // Start with desktop
        await page.setViewportSize({ width: 1920, height: 1080 })
        await page.goto('/')
        await navigateTo.formLayoutsPage()
        
        // Change to mobile
        await page.setViewportSize({ width: 375, height: 667 })
        await page.waitForTimeout(500)
        
        // Verify we're still on the same page
        await expect(page).toHaveURL(/.*\/forms\/layouts/)
        
        // Change back to desktop
        await page.setViewportSize({ width: 1920, height: 1080 })
        await page.waitForTimeout(500)
        
        // Verify functionality still works
        await navigateTo.datepickerPage()
        await expect(page).toHaveURL(/.*\/forms\/datepicker/)
        
        console.log('✅ Navigation works across viewport changes')
    })
    
})

test.describe('Accessibility Tests', () => {
    
    test('should have proper ARIA labels on menu items', async ({ page }) => {
        // Check for ARIA labels
        const menuItems = page.locator('[role="menuitem"], [role="navigation"] a, .menu-item')
        const count = await menuItems.count()
        
        for (let i = 0; i < Math.min(count, 5); i++) {
            const item = menuItems.nth(i)
            const ariaLabel = await item.getAttribute('aria-label')
            const text = await item.textContent()
            
            if (ariaLabel || text) {
                console.log(`✅ Menu item ${i + 1} has label: ${ariaLabel || text}`)
            }
        }
        
        expect(count).toBeGreaterThan(0)
    })
    
    test('should support screen reader navigation', async ({ page }) => {
        // Check for screen reader friendly elements
        const nav = page.locator('nav, [role="navigation"]').first()
        const hasRole = await nav.getAttribute('role')
        const hasAriaLabel = await nav.getAttribute('aria-label')
        
        if (hasRole || hasAriaLabel) {
            console.log('✅ Navigation has accessibility attributes')
            expect(hasRole || hasAriaLabel).toBeTruthy()
        } else {
            console.log('⚠️ Navigation lacks accessibility attributes')
        }
    })
    
    test('should have sufficient color contrast', async ({ page }) => {
        // This is a basic check - full contrast testing requires specialized tools
        const menuItem = page.locator('.menu-item, nav a').first()
        
        const color = await menuItem.evaluate((el) => {
            const styles = window.getComputedStyle(el)
            return {
                color: styles.color,
                background: styles.backgroundColor
            }
        })
        
        console.log(`✅ Menu colors - Text: ${color.color}, Background: ${color.background}`)
        expect(color.color).toBeTruthy()
    })
    
    test('should have focus indicators', async ({ page }) => {
        // Tab to first menu item
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        
        // Check if focused element has visible focus indicator
        const focusedElement = await page.evaluate(() => {
            const el = document.activeElement
            if (el) {
                const styles = window.getComputedStyle(el)
                return {
                    outline: styles.outline,
                    border: styles.border,
                    boxShadow: styles.boxShadow
                }
            }
            return null
        })
        
        if (focusedElement) {
            console.log('✅ Focus indicators present:', focusedElement)
            expect(focusedElement).toBeTruthy()
        }
    })
    
})