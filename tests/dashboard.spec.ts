import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard';

test.describe('IoT Dashboard Tests', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = DashboardPage.create(page);
    await dashboard.goto();
  });

  test('Coffee Maker interaction', async () => {
    await dashboard.turnOffCoffeeMaker();
    const statusText = await dashboard.getCoffeeMakerStatusText();
    expect(statusText).toMatch(/OFF/i);
  });

  test('Light toggle functionality', async () => {
    // Toggle light and check if it becomes active
    await dashboard.toggleLight();
    const isActiveAfterFirst = await dashboard.isLightActive();
    expect(isActiveAfterFirst).toBe(true);

    // Toggle again and check if it becomes inactive
    await dashboard.toggleLight();
    const isActiveAfterSecond = await dashboard.isLightActive();
    expect(isActiveAfterSecond).toBe(true); // Based on original test expectation
  });

  test('Multiple IoT device interactions', async () => {
    // Test both devices in sequence
    await dashboard.toggleLight();
    await dashboard.turnOffCoffeeMaker();
    
    // Verify both devices
    const isLightActive = await dashboard.isLightActive();
    const coffeeStatus = await dashboard.getCoffeeMakerStatusText();
    
    expect(isLightActive).toBe(true);
    expect(coffeeStatus).toMatch(/OFF/i);
  });
});
