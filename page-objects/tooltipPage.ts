import { Locator, Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class TooltipPage extends HelperBase {
    protected readonly page: Page;

    // Private locators for different tooltip elements
    private readonly defaultTooltipButton: Locator;
    private readonly topTooltipButton: Locator;
    private readonly rightTooltipButton: Locator;
    private readonly bottomTooltipButton: Locator;
    private readonly leftTooltipButton: Locator;
    private readonly coloredTooltipButton: Locator;
    private readonly withIconTooltipButton: Locator;
    private readonly tooltipElement: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize locators for tooltip buttons
        this.defaultTooltipButton = page.locator('button:has-text("Show Tooltip")').first();
        this.topTooltipButton = page.locator('button:has-text("Top")').first();
        this.rightTooltipButton = page.locator('button:has-text("Right")').first();
        this.bottomTooltipButton = page.locator('button:has-text("Bottom")').first();
        this.leftTooltipButton = page.locator('button:has-text("Left")').first();
        this.coloredTooltipButton = page.getByRole('button', { name: /colored tooltip/i }).or(page.locator('text=Colored Tooltips').first());
        this.withIconTooltipButton = page.getByRole('button', { name: /with icon/i }).or(page.locator('text=With Icon').first());
        
        // Generic tooltip element locator
        this.tooltipElement = page.locator('nb-tooltip').or(page.locator('[role="tooltip"]')).or(page.locator('.nb-tooltip'));
    }

    async navigateToTooltipPage() {
        await this.page.goto('/');
        await this.waitForNumberOfSeconds(2);
    }

    async hoverOnDefaultTooltip() {
        await this.defaultTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async hoverOnTopTooltip() {
        await this.topTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async hoverOnRightTooltip() {
        await this.rightTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async hoverOnBottomTooltip() {
        await this.bottomTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async hoverOnLeftTooltip() {
        await this.leftTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async hoverOnColoredTooltip() {
        await this.coloredTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async hoverOnIconTooltip() {
        await this.withIconTooltipButton.hover();
        await this.waitForNumberOfSeconds(0.5);
    }

    async getTooltipText(): Promise<string> {
        await this.tooltipElement.first().waitFor({ state: 'visible', timeout: 5000 });
        return await this.tooltipElement.first().textContent() || '';
    }

    async isTooltipVisible(): Promise<boolean> {
        try {
            await this.tooltipElement.first().waitFor({ state: 'visible', timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }

    async getTooltipPosition() {
        const tooltip = this.tooltipElement.first();
        await tooltip.waitFor({ state: 'visible' });
        return await tooltip.boundingBox();
    }

    async moveMouseAway() {
        // Move mouse to a neutral position
        await this.page.mouse.move(0, 0);
        await this.waitForNumberOfSeconds(0.5);
    }

    async getTooltipBackgroundColor() {
        const tooltip = this.tooltipElement.first();
        await tooltip.waitFor({ state: 'visible' });
        return await tooltip.evaluate(el => {
            return window.getComputedStyle(el).backgroundColor;
        });
    }

    async verifyTooltipDisappearsOnMouseMove() {
        await this.moveMouseAway();
        try {
            await this.tooltipElement.first().waitFor({ state: 'hidden', timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }
}