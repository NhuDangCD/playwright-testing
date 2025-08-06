import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/dashboard';

test('IoT Dashboard - Coffee Maker OFF', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.turnOffCoffeeMaker();
  const statusText = await dashboard.getCoffeeMakerStatusText();
  expect(statusText).toMatch(/OFF/i);
});
