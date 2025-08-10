import { test, expect } from '@playwright/test';
import { NavigationPage } from '../page-objects/navigationPage';
import { FormLayoutsPage } from '../page-objects/formLayoutsPage';
import { DatePicker } from '../page-objects/datePicker';
import { RegisterPage } from '../page-objects/registerPage';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});
test('navigate to form page', async ({ page }) => {
    const navigationPage = NavigationPage.create(page);
    
    await navigationPage.formLayoutsPage();
    await navigationPage.datepickerPage();
});
test('filling forms', async ({ page }) => {
    const navigationPage = NavigationPage.create(page);
    const formLayoutsPage = FormLayoutsPage.create(page);
    
    await navigationPage.formLayoutsPage();
    await expect(page.locator('text=Form Layouts')).toBeVisible();
    
    // Use environment variables for credentials
    const email = process.env.FORM_EMAIL || 'test@test.com';
    const password = process.env.FORM_PASSWORD || 'Welcome1';
    
    await formLayoutsPage.submitFormWithCredentials(email, password, 'Option 1');
    await formLayoutsPage.submitInlineFormsWithEmailAndCheckbox('John Doe', email, true);
});
test('filling DatePicker', async ({ page }) => {
    const navigationPage = NavigationPage.create(page);
    const datePickerPage = DatePicker.create(page);
    
    await navigationPage.datepickerPage();
    await datePickerPage.openCalendar();
    await datePickerPage.selectCorrectDay(21);
});

test('register new user and save to file', async ({ page }) => {
    const registerPage = RegisterPage.create(page);
    
    await registerPage.navigateToRegisterPage();
    
    // Use environment variables for user data
    const fullName = process.env.TEST_USER_FULLNAME || 'Test User';
    const email = `test.user.${Date.now()}@example.com`; // Unique email for each test run
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    
    const userData = await registerPage.registerUser(fullName, email, password, password, true);
    
    console.log('Registered user data:', userData);
    expect(userData.email).toBe(email);
    expect(userData.fullName).toBe(fullName);
});

test('login with last registered user', async ({ page }) => {
    const registerPage = RegisterPage.create(page);
    
    // Get the last registered user from file
    const lastUser = await registerPage.getLastRegisteredUser();
    
    if (lastUser && lastUser.status === 'registered') {
        console.log('Using credentials for last registered user');
        // Here you would implement login functionality using the stored credentials
        // For now, just verify the data was saved correctly
        expect(lastUser.email).toBeTruthy();
        expect(lastUser.password).toBeTruthy();
        expect(lastUser.status).toBe('registered');
    } else {
        console.log('No registered users found in file. Skipping login test.');
        test.skip();
    }
});
