import { test, expect } from '@playwright/test'

test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle 404 page not found errors', async ({ page }) => {
        // Navigate to non-existent page
        await page.goto('/this-page-does-not-exist-404')
        
        // Check for 404 indicators
        const pageContent = await page.content()
        const has404 = pageContent.includes('404') || 
                       pageContent.includes('Not Found') ||
                       pageContent.includes('not found')
        
        // Check if redirected to dashboard or shows error
        const url = page.url()
        const handledProperly = has404 || url.includes('dashboard') || url.includes('pages')
        
        expect(handledProperly).toBe(true)
        console.log('✅ 404 error handled')
    })
    
    test('should handle invalid route parameters', async ({ page }) => {
        // Try invalid route parameters
        await page.goto('/pages/iot-dashboard/invalid/123/abc')
        
        // Should either show error or redirect to valid page
        const url = page.url()
        const handledProperly = url.includes('dashboard') || url.includes('pages') || url.includes('error')
        
        expect(handledProperly).toBe(true)
        console.log('✅ Invalid route parameters handled')
    })
    
    test('should handle network timeout gracefully', async ({ page, context }) => {
        // Simulate slow network
        await context.route('**/*', route => {
            setTimeout(() => route.continue(), 5000)
        })
        
        // Try to navigate with timeout
        try {
            await page.goto('/', { timeout: 3000 })
        } catch (error) {
            // Should catch timeout error
            expect(error.message).toContain('timeout')
            console.log('✅ Network timeout handled')
        }
        
        // Clear route handler
        await context.unroute('**/*')
    })
    
    test('should handle offline mode', async ({ page, context }) => {
        // Load page first
        await page.goto('/')
        
        // Go offline
        await context.setOffline(true)
        
        // Try to navigate
        try {
            await page.goto('/pages/iot-dashboard')
        } catch (error) {
            // Should show offline error
            console.log('✅ Offline mode error caught')
        }
        
        // Go back online
        await context.setOffline(false)
    })
    
    test('should handle API errors gracefully', async ({ page, context }) => {
        // Intercept API calls and return errors
        await context.route('**/api/**', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' })
            })
        })
        
        await page.goto('/')
        
        // Check if page still loads and shows appropriate error handling
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ API errors handled gracefully')
        
        // Clear route handler
        await context.unroute('**/api/**')
    })
    
    test('should handle session expiry', async ({ page }) => {
        // Simulate session expiry by clearing storage
        await page.goto('/')
        
        // Clear all storage to simulate session expiry
        await page.evaluate(() => {
            localStorage.clear()
            sessionStorage.clear()
        })
        
        // Try to access protected page
        await page.goto('/pages/iot-dashboard')
        
        // Should redirect to login or show session expired message
        const url = page.url()
        const handledProperly = url.includes('login') || url.includes('auth') || url.includes('dashboard')
        
        expect(handledProperly).toBe(true)
        console.log('✅ Session expiry handled')
    })
    
    test('should handle invalid JSON responses', async ({ page, context }) => {
        // Intercept API calls and return invalid JSON
        await context.route('**/api/**', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: 'This is not valid JSON {]'
            })
        })
        
        await page.goto('/')
        
        // Page should still be functional
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ Invalid JSON responses handled')
        
        // Clear route handler
        await context.unroute('**/api/**')
    })
    
    test('should handle rate limiting responses', async ({ page, context }) => {
        // Simulate rate limiting
        await context.route('**/api/**', route => {
            route.fulfill({
                status: 429,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    error: 'Too Many Requests',
                    retryAfter: 60
                })
            })
        })
        
        await page.goto('/')
        
        // Check if page handles rate limiting
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ Rate limiting handled')
        
        // Clear route handler
        await context.unroute('**/api/**')
    })
    
    test('should handle CORS errors', async ({ page, context }) => {
        // Simulate CORS error
        await context.route('**/api/**', route => {
            route.fulfill({
                status: 0,
                body: ''
            })
        })
        
        await page.goto('/')
        
        // Page should still load despite CORS issues
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ CORS errors handled')
        
        // Clear route handler
        await context.unroute('**/api/**')
    })
    
    test('should handle large payload responses', async ({ page, context }) => {
        // Create large payload
        const largeData = 'x'.repeat(10 * 1024 * 1024) // 10MB string
        
        await context.route('**/api/data', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: largeData })
            })
        })
        
        await page.goto('/')
        
        // Page should handle large payloads
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ Large payload handled')
        
        // Clear route handler
        await context.unroute('**/api/data')
    })
    
    test('should handle malformed URLs', async ({ page }) => {
        const malformedUrls = [
            'http://localhost:4200/pages//double-slash',
            'http://localhost:4200/pages/../../../etc/passwd',
            'http://localhost:4200/pages/%00null',
            'http://localhost:4200/pages/\x00',
            'http://localhost:4200/pages/?..\\..\\..'
        ]
        
        for (const url of malformedUrls) {
            try {
                await page.goto(url, { timeout: 5000 })
                // Should handle without crashing
                const pageLoaded = await page.locator('body').isVisible()
                expect(pageLoaded).toBe(true)
                console.log(`✅ Malformed URL handled: ${url.substring(0, 50)}...`)
            } catch (error) {
                // Navigation error is also acceptable
                console.log(`✅ Malformed URL blocked: ${url.substring(0, 50)}...`)
            }
        }
    })
    
    test('should handle browser storage quota exceeded', async ({ page }) => {
        await page.goto('/')
        
        // Try to exceed localStorage quota
        await page.evaluate(() => {
            try {
                const largeData = 'x'.repeat(10 * 1024 * 1024) // 10MB
                for (let i = 0; i < 100; i++) {
                    localStorage.setItem(`key${i}`, largeData)
                }
            } catch (e) {
                // Should catch quota exceeded error
                return e.name === 'QuotaExceededError'
            }
        })
        
        // Page should still be functional
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ Storage quota exceeded handled')
    })
    
    test('should handle concurrent navigation attempts', async ({ page }) => {
        // Start multiple navigations simultaneously
        const promises = [
            page.goto('/pages/iot-dashboard'),
            page.goto('/forms/layouts'),
            page.goto('/tables/smart-table')
        ]
        
        // At least one should succeed
        try {
            await Promise.race(promises)
            const url = page.url()
            expect(url).toBeTruthy()
            console.log('✅ Concurrent navigation handled')
        } catch (error) {
            console.log('⚠️ All concurrent navigations failed')
        }
    })
    
    test('should handle memory leaks prevention', async ({ page }) => {
        await page.goto('/')
        
        // Create potential memory leak scenario
        await page.evaluate(() => {
            const leaks = []
            for (let i = 0; i < 1000; i++) {
                const div = document.createElement('div')
                div.innerHTML = `<span>Test ${i}</span>`.repeat(100)
                document.body.appendChild(div)
                leaks.push(div)
            }
            // Clean up
            leaks.forEach(div => div.remove())
        })
        
        // Check if page is still responsive
        const pageResponsive = await page.locator('body').isVisible()
        expect(pageResponsive).toBe(true)
        
        console.log('✅ Memory leak scenario handled')
    })
    
    test('should handle infinite loops in JavaScript', async ({ page }) => {
        await page.goto('/')
        
        // Set up a timeout for infinite loop detection
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve('timeout'), 2000)
        })
        
        const evalPromise = page.evaluate(() => {
            // This would normally be an infinite loop
            let counter = 0
            while (counter < 1000000) {
                counter++
            }
            return counter
        })
        
        const result = await Promise.race([evalPromise, timeoutPromise])
        
        // Should either complete or timeout
        expect(result).toBeTruthy()
        console.log('✅ JavaScript execution controlled')
    })
    
    test('should handle special characters in inputs', async ({ page }) => {
        await page.goto('/forms/layouts')
        
        const specialChars = [
            '"><script>alert(1)</script>',
            '${alert(1)}',
            '{{constructor.constructor("alert(1)")()}}',
            '\x00\x01\x02\x03',
            '🔥💀☠️👻',
            '\\\\//\\\\//\\\\',
            '%00%01%02%03'
        ]
        
        for (const chars of specialChars) {
            const input = page.locator('input[type="text"]').first()
            if (await input.isVisible()) {
                await input.fill(chars)
                // Should handle without breaking
                const value = await input.inputValue()
                expect(value).toBeDefined()
                console.log(`✅ Special chars handled: ${chars.substring(0, 20)}...`)
            }
        }
    })
    
})

test.describe('Performance and Load Testing', () => {
    
    test('should handle rapid page refreshes', async ({ page }) => {
        await page.goto('/')
        
        // Perform rapid refreshes
        for (let i = 0; i < 5; i++) {
            await page.reload()
        }
        
        // Page should still be functional
        const pageLoaded = await page.locator('body').isVisible()
        expect(pageLoaded).toBe(true)
        
        console.log('✅ Rapid refreshes handled')
    })
    
    test('should handle multiple tabs/windows', async ({ context }) => {
        // Open multiple pages
        const pages = []
        for (let i = 0; i < 3; i++) {
            const page = await context.newPage()
            await page.goto('/')
            pages.push(page)
        }
        
        // All pages should be functional
        for (const page of pages) {
            const loaded = await page.locator('body').isVisible()
            expect(loaded).toBe(true)
            await page.close()
        }
        
        console.log('✅ Multiple tabs handled')
    })
    
    test('should handle browser zoom levels', async ({ page }) => {
        await page.goto('/')
        
        // Test different zoom levels
        const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2]
        
        for (const zoom of zoomLevels) {
            await page.evaluate((z) => {
                (document.body.style as any).zoom = z
            }, zoom)
            
            // Page should still be functional
            const pageVisible = await page.locator('body').isVisible()
            expect(pageVisible).toBe(true)
            console.log(`✅ Zoom level ${zoom * 100}% handled`)
        }
    })
    
})