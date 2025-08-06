import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly coffeeMakerButton: Locator;
  readonly coffeeMakerStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.coffeeMakerButton = page.locator('*:has-text("Coffee")').first();
    this.coffeeMakerStatus = page.locator('*:has-text("Coffee")').first();
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
}
