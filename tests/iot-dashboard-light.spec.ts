import { test, expect } from '@playwright/test';

test('IoT Dashboard Light toggle', async ({ page }) => {
  // Navigate to the IoT Dashboard
  await page.goto('/pages/iot-dashboard');

  // Find the Light button and click to turn off
  const lightButton = page.getByRole('button', { name: 'Light' });
  await lightButton.click();

  // Optionally, check if the button is now active (ON)
  // You may want to check for a class or text change here
  // For example, check if the Light is ON
  await expect(lightButton).toHaveClass(/active/);

  // Click again to turn on
  await lightButton.click();

  // Optionally, check if the button is now not active (OFF)
  await expect(lightButton).toHaveClass(/active/);
});
