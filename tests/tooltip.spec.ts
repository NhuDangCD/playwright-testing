import { test, expect } from '@playwright/test'
import { NavigationPage } from '../page-objects/navigationPage'
import { TooltipPage } from '../page-objects/tooltipPage'

test.use({ 
    browserName: 'chromium',
    headless: false
})

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
})

test.describe('Tooltip Tests', () => {
    
    test('should display tooltip when hovering on element', async ({ page }) => {
        const navigateTo = new NavigationPage(page)
        const tooltipPage = new TooltipPage(page)
        
        // Navigate to tooltip page under Modal & Overlays
        await navigateTo.tooltipPage()
        await page.waitForTimeout(2000)
        
        // Verify tooltip is not visible initially
        const tooltipElement = page.locator('nb-tooltip').or(page.locator('[role="tooltip"]'))
        await expect(tooltipElement).toBeHidden()
        
        // Hover on the default tooltip button
        await tooltipPage.hoverOnDefaultTooltip()
        
        // Verify tooltip is now visible
        await expect(tooltipElement.first()).toBeVisible()
        console.log('✅ Tooltip is displayed on hover')
        
        // Move mouse away
        await tooltipPage.moveMouseAway()
        
        // Verify tooltip disappears
        await expect(tooltipElement).toBeHidden()
        console.log('✅ Tooltip disappears when mouse moves away')
    })
    
    test('should verify tooltip placements', async ({ page }) => {
        const navigateTo = new NavigationPage(page)
        const tooltipPage = new TooltipPage(page)
        
        // Navigate to tooltip page under Modal & Overlays
        await navigateTo.tooltipPage()
        await page.waitForTimeout(2000)
        
        // Test tooltip positions
        const placements = [
            { button: 'topTooltipButton', position: 'top', method: 'hoverOnTopTooltip' },
            { button: 'rightTooltipButton', position: 'right', method: 'hoverOnRightTooltip' },
            { button: 'bottomTooltipButton', position: 'bottom', method: 'hoverOnBottomTooltip' },
            { button: 'leftTooltipButton', position: 'left', method: 'hoverOnLeftTooltip' }
        ]
        
        for (const placement of placements) {
            console.log(`\nTesting ${placement.position} tooltip placement...`)
            
            // Get the button element position
            const button = page.locator(`button:has-text("${placement.position.charAt(0).toUpperCase() + placement.position.slice(1)}")`).first()
            const buttonBBox = await button.boundingBox()
            expect(buttonBBox).toBeTruthy()
            
            // Hover on the button using the appropriate method
            await tooltipPage[placement.method]()
            
            // Get tooltip position
            const tooltipBBox = await tooltipPage.getTooltipPosition()
            expect(tooltipBBox).toBeTruthy()
            
            // Verify tooltip appears in correct position relative to button
            switch (placement.position) {
                case 'top':
                    // Tooltip should be above the button
                    expect(tooltipBBox.y).toBeLessThan(buttonBBox.y)
                    console.log(`✅ Top tooltip appears above button`)
                    break
                case 'right':
                    // Tooltip should be to the right of the button
                    expect(tooltipBBox.x).toBeGreaterThan(buttonBBox.x + buttonBBox.width)
                    console.log(`✅ Right tooltip appears to the right of button`)
                    break
                case 'bottom':
                    // Tooltip should be below the button
                    expect(tooltipBBox.y).toBeGreaterThan(buttonBBox.y + buttonBBox.height)
                    console.log(`✅ Bottom tooltip appears below button`)
                    break
                case 'left':
                    // Tooltip should be to the left of the button
                    expect(tooltipBBox.x + tooltipBBox.width).toBeLessThan(buttonBBox.x)
                    console.log(`✅ Left tooltip appears to the left of button`)
                    break
            }
            
            // Move mouse away to hide tooltip for next test
            await tooltipPage.moveMouseAway()
            await page.waitForTimeout(500)
        }
        
        console.log('\n✅ All tooltip placements verified successfully!')
    })
    
    test('should verify colored tooltip displays correctly', async ({ page }) => {
        const navigateTo = new NavigationPage(page)
        const tooltipPage = new TooltipPage(page)
        
        // Navigate to tooltip page under Modal & Overlays
        await navigateTo.tooltipPage()
        await page.waitForTimeout(2000)
        
        // Define expected colors for tooltips
        const coloredTooltips = [
            { buttonText: 'Primary', expectedColor: 'rgb(51, 102, 255)' }, // Primary blue
            { buttonText: 'Success', expectedColor: 'rgb(0, 214, 143)' }, // Success green
            { buttonText: 'Danger', expectedColor: 'rgb(255, 61, 113)' }, // Danger red
            { buttonText: 'Warning', expectedColor: 'rgb(255, 170, 0)' }  // Warning yellow
        ]
        
        console.log('Testing colored tooltips...')
        
        for (const tooltip of coloredTooltips) {
            console.log(`\nTesting ${tooltip.buttonText} tooltip...`)
            
            // Find and hover on the specific colored tooltip button
            const button = page.locator(`button:has-text("${tooltip.buttonText}")`).first()
            await button.hover()
            await page.waitForTimeout(500)
            
            // Get tooltip background color
            const tooltipBgColor = await tooltipPage.getTooltipBackgroundColor()
            console.log(`${tooltip.buttonText} tooltip color: ${tooltipBgColor}`)
            
            // Verify the tooltip has the expected color
            expect(tooltipBgColor).toBe(tooltip.expectedColor)
            console.log(`✅ ${tooltip.buttonText} tooltip displays with correct color`)
            
            // Move mouse away
            await tooltipPage.moveMouseAway()
            await page.waitForTimeout(300)
        }
        
        console.log('\n✅ All colored tooltips display correctly!')
    })
    
})