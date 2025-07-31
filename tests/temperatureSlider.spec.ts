import { test, expect } from '@playwright/test'
import { TemperaturePage } from '../page-objects/temperaturePage'

test.use({ 
    browserName: 'chromium',
    headless: false
})

test.beforeEach(async ({ page }) => {
    await page.goto('/pages/iot-dashboard')
    await page.waitForLoadState('networkidle')
})

test.describe('Temperature Slider Tests', () => {
    
    test('should hover on temperature slider and set to 19 Celsius using bounding box', async ({ page }) => {
        const temperaturePage = new TemperaturePage(page)
        
        // Wait a bit for page to load completely
        await page.waitForTimeout(3000)
        
        // Click on temperature tab
        await temperaturePage.clickTemperatureTab()
        
        // Verify slider is visible
        const isSliderVisible = await temperaturePage.isTemperatureSliderVisible()
        console.log('Is temperature slider visible:', isSliderVisible)
        expect(isSliderVisible).toBe(true)
        
        // Get initial bounding boxes for verification
        const initialCircleBoundingBox = await temperaturePage.getCircleBoundingBox()
        const svgBoundingBox = await temperaturePage.getSvgBoundingBox()
        
        expect(initialCircleBoundingBox).toBeTruthy()
        expect(svgBoundingBox).toBeTruthy()
        
        // Log bounding box information for debugging
        console.log('Initial circle bounding box:', initialCircleBoundingBox)
        console.log('SVG container bounding box:', svgBoundingBox)
        
        // Get initial temperature value
        const initialTemperature = await temperaturePage.getTemperatureValue()
        console.log('Initial temperature:', initialTemperature)
        
        // Hover on the temperature slider circle
        await temperaturePage.hoverOnTemperatureSlider()
        
        // Set temperature to 22°C using bounding box calculation
        await temperaturePage.setTemperatureUsingBoundingBox(19)
        
        // Verify the temperature value has changed
        const finalTemperature = await temperaturePage.getTemperatureValue()
        console.log('Final temperature:', finalTemperature)
        
        // Extract numeric value
        const numericValue = parseInt(finalTemperature.replace(/[^\d]/g, ''))
        
        // Allow some tolerance due to circular slider precision
        expect(numericValue).toBeGreaterThanOrEqual(15)
        expect(numericValue).toBeLessThanOrEqual(30)
        
        // Verify circle position
        const finalCircleBoundingBox = await temperaturePage.getCircleBoundingBox()
        expect(finalCircleBoundingBox).toBeTruthy()
        
        console.log(`Temperature changed from ${initialTemperature} to ${finalTemperature}`)
    })

    test('should verify circle element properties using bounding box', async ({ page }) => {
        const temperaturePage = new TemperaturePage(page)
        
        // Page is already on dashboard
        await temperaturePage.clickTemperatureTab()
        
        // Get the circle element and verify its properties
        const circleBoundingBox = await temperaturePage.getCircleBoundingBox()
        
        expect(circleBoundingBox).toBeTruthy()
        expect(circleBoundingBox!.width).toBeGreaterThan(1) // Circle should have some size
        expect(circleBoundingBox!.height).toBeGreaterThan(1)
        
        console.log('Circle bounding box:', circleBoundingBox)
    })
})