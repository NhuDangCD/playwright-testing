import { Locator, Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class TemperaturePage extends HelperBase {
    protected readonly page: Page;

    // Private locators
    private readonly temperatureCard: Locator;
    private readonly temperatureTab: Locator;
    private readonly temperatureDragger: Locator;
    private readonly temperatureSliderCircle: Locator;
    private readonly temperatureValue: Locator;
    private readonly svgContainer: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize locators - be more specific
        this.temperatureCard = page.locator('nb-card').filter({ hasText: 'Temperature' });
        this.temperatureTab = page.locator('nb-tab[tabtitle="Temperature"]').or(page.locator('[tabtitle="Temperature"]')).or(page.getByText('Temperature').first());
        this.temperatureDragger = page.locator('ngx-temperature-dragger').first();
        this.temperatureSliderCircle = page.locator('circle').first();
        this.temperatureValue = page.locator('.value.temperature').first();
        this.svgContainer = page.locator('ngx-temperature-dragger svg').first();
    }

    async navigateToTemperaturePage() {
        // Navigate directly to the IoT dashboard page
        await this.page.goto('/pages/iot-dashboard');
        await this.page.waitForLoadState('networkidle');
        await this.waitForNumberOfSeconds(2);
    }

    async clickTemperatureTab() {
        // Try multiple ways to click the temperature tab
        try {
            await this.temperatureTab.first().waitFor({ state: 'visible', timeout: 5000 });
            await this.temperatureTab.first().click();
        } catch (error) {
            console.log('Primary tab locator failed, trying alternative...');
            // Alternative: try clicking by text content
            const tempTab = this.page.getByText('Temperature').first();
            await tempTab.click();
        }
        await this.waitForNumberOfSeconds(1);
    }

    async setTemperatureUsingBoundingBox(targetTemperature: number) {
        // Wait for the temperature dragger to be visible
        await this.temperatureDragger.waitFor({ state: 'visible' });
        
        // Get the SVG container bounding box
        const svgBoundingBox = await this.svgContainer.boundingBox();
        if (!svgBoundingBox) {
            throw new Error('SVG container not found');
        }

        // Get the circle (slider thumb) bounding box for reference
        const circleBoundingBox = await this.temperatureSliderCircle.boundingBox();
        if (!circleBoundingBox) {
            throw new Error('Temperature slider circle not found');
        }

        // Temperature range mapping (adjust based on actual slider range)
        const minTemp = 10;  // Minimum temperature on slider
        const maxTemp = 35;  // Maximum temperature on slider
        
        // Clamp target temperature to valid range
        const clampedTemp = Math.min(Math.max(targetTemperature, minTemp), maxTemp);
        
        // Calculate temperature percentage (0 to 1)
        const tempPercentage = (clampedTemp - minTemp) / (maxTemp - minTemp);
        
        // Calculate center of the actual slider arc
        const centerX = svgBoundingBox.x + svgBoundingBox.width / 2;
        const centerY = svgBoundingBox.y + svgBoundingBox.height / 2;
        
        // For circular temperature slider, calculate position on arc
        // Typical temperature sliders use bottom semicircle
        const radius = Math.min(svgBoundingBox.width, svgBoundingBox.height) * 0.4;
        
        // Map temperature to angle (experimenting with different ranges)
        // Try a more centered approach around the bottom
        const startAngle = Math.PI * 1.25; // 225 degrees (bottom-left)
        const endAngle = Math.PI * 1.75; // 315 degrees (bottom-right)  
        const angleRange = endAngle - startAngle; // 90 degree range
        
        // Calculate angle based on temperature percentage
        const targetAngle = startAngle + (tempPercentage * angleRange);
        
        // Calculate target position
        const targetX = centerX + radius * Math.cos(targetAngle);
        const targetY = centerY + radius * Math.sin(targetAngle);

        console.log(`Setting temperature to ${clampedTemp}°C (${(tempPercentage * 100).toFixed(1)}%)`);
        console.log(`SVG center: (${centerX.toFixed(1)}, ${centerY.toFixed(1)}), Radius: ${radius.toFixed(1)}`);
        console.log(`Angle: ${(targetAngle * 180 / Math.PI).toFixed(1)}°`);
        console.log(`Target coordinates: (${targetX.toFixed(1)}, ${targetY.toFixed(1)})`);

        // First hover over the slider to ensure it's interactive
        await this.temperatureDragger.hover();
        await this.waitForNumberOfSeconds(0.3);
        
        // Try mouse down and drag approach
        await this.page.mouse.move(centerX, centerY);
        await this.page.mouse.down();
        await this.page.mouse.move(targetX, targetY, { steps: 5 });
        await this.page.mouse.up();
        
        await this.waitForNumberOfSeconds(0.5);
    }

    async getTemperatureValue(): Promise<string> {
        return await this.temperatureValue.first().textContent() || '';
    }

    async getCircleBoundingBox() {
        return await this.temperatureSliderCircle.first().boundingBox();
    }

    async getSvgBoundingBox() {
        return await this.svgContainer.first().boundingBox();
    }

    async hoverOnTemperatureSlider() {
        await this.temperatureSliderCircle.first().hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async isTemperatureSliderVisible(): Promise<boolean> {
        return await this.temperatureSliderCircle.first().isVisible();
    }
}