import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  private readonly page: Page;
  private readonly coffeeMakerButton: Locator;
  private readonly coffeeMakerStatus: Locator;
  private readonly lightButton: Locator;

  private constructor(page: Page) {
    this.page = page;
    this.coffeeMakerButton = page.locator('*:has-text("Coffee")').first();
    this.coffeeMakerStatus = page.locator('*:has-text("Coffee")').first();
    this.lightButton = page.getByRole('button', { name: 'Light' });
  }

  static create(page: Page): DashboardPage {
    return new DashboardPage(page);
  }

  async goto() {
    await this.page.goto('/pages/iot-dashboard');
  }

  async turnOffCoffeeMaker() {
    await this.coffeeMakerButton.click();
  }

  async getCoffeeMakerStatusText() {
    return await this.coffeeMakerStatus.textContent();
  }

  async toggleLight() {
    await this.lightButton.click();
  }

  async isLightActive() {
    const classes = await this.lightButton.getAttribute('class');
    return classes?.includes('active') || false;
  }
}
