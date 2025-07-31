import { test, expect } from '@playwright/test'
import { NavigationPage } from '../page-objects/navigationPage'
import { formLayoutsPage } from '../page-objects/formLayoutsPage'
import { DatePicker } from '../page-objects/datePicker'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})
test('navigate to form page', async ({ page }) => {
    const navigateTo = new NavigationPage(page)
    await navigateTo.formLayoutsPage()
    await navigateTo.datepickerPage()
})
test('filling forms', async ({ page }) => {
    const navigateTo = new NavigationPage(page)
    const onFormLayoutsPage = new formLayoutsPage(page)
    navigateTo.formLayoutsPage()
    //await expect(page.locator('text=Form Layouts')).toBeVisible();  // Add assertion 
    await onFormLayoutsPage.submitFormWithCredentials('tesdt@test.com', 'Welcome1', 'Option 1')
    //await expect(page.locator('text= Inline Form')).toBeVisible();
    await onFormLayoutsPage.submitInlineFormsWithEmailAndCheckbox('Job', 'John@test.com', true)
})
test('filling DatePicker', async ({ page }) => {
    const navigateTo = new NavigationPage(page);
    const onDatePickerPage = new DatePicker(page);
    navigateTo.datepickerPage();
    await onDatePickerPage.openCalendar();
    await onDatePickerPage.selectCorrectDay(21);
});
