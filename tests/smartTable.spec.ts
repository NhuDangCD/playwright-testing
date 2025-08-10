import { test } from '@playwright/test';
import { SmartTablePage } from '../page-objects/smartTable';
import { NavigationPage } from '../page-objects/navigationPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})
test('Print table rows as array of objects', async ({ page }) => {
  const nav = NavigationPage.create(page);
  await nav.smartTablePage();

  const smartTable = SmartTablePage.create(page);
  const rows = await smartTable.getRowObjects();

  console.log('🧾 Table rows as objects:');
  console.log(rows); // 
});
