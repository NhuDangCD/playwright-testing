import { Locator, Page } from "@playwright/test";
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export class LoginPage {
    private readonly page: Page;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly rememberMeCheckbox: Locator;
    private readonly loginButton: Locator;
    private readonly registerLink: Locator;
    private readonly forgotPasswordLink: Locator;
    private readonly errorMessage: Locator;
    private readonly successMessage: Locator;
    private readonly formContainer: Locator;
    private readonly loadingSpinner: Locator;

    private constructor(page: Page) {
        this.page = page;
        
        // Initialize locators
        this.emailField = page.getByLabel('Email').or(page.getByPlaceholder('Email')).or(page.locator('input[type="email"]'));
        this.passwordField = page.getByLabel('Password').or(page.getByPlaceholder('Password')).or(page.locator('input[type="password"]'));
        this.rememberMeCheckbox = page.locator('input[type="checkbox"]').or(page.locator('.custom-checkbox'));
        this.loginButton = page.getByRole('button', { name: /log in|sign in|login/i });
        this.registerLink = page.getByRole('link', { name: /register|sign up/i });
        this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
        this.errorMessage = page.locator('.alert-danger, .error-message, [class*="error"], [class*="danger"]');
        this.successMessage = page.locator('.alert-success, .success-message, [class*="success"]');
        this.formContainer = page.locator('form').or(page.locator('.login-form, .auth-form'));
        this.loadingSpinner = page.locator('.spinner, .loading, [class*="spinner"]');
    }

    static create(page: Page): LoginPage {
        return new LoginPage(page);
    }

    async navigateToLoginPage() {
        await this.page.goto('/auth/login');
        await this.page.waitForTimeout(1 * 1000);
    }

    async fillLoginForm(email: string, password: string) {
        await this.emailField.first().fill(email);
        await this.passwordField.first().fill(password);
    }

    async checkRememberMe() {
        const checkbox = this.rememberMeCheckbox.first();
        if (await checkbox.isVisible()) {
            await checkbox.check();
        }
    }

    async uncheckRememberMe() {
        const checkbox = this.rememberMeCheckbox.first();
        if (await checkbox.isVisible()) {
            await checkbox.uncheck();
        }
    }

    async submitLogin() {
        await this.loginButton.first().click();
        await this.page.waitForTimeout(2 * 1000);
    }

    async login(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
        try {
            await this.fillLoginForm(email, password);
            
            if (rememberMe) {
                await this.checkRememberMe();
            }
            
            await this.submitLogin();
            
            // Wait for either success (navigation) or error message
            const result = await Promise.race([
                this.page.waitForURL('**/dashboard', { timeout: 5000 }).then(() => true).catch(() => false),
                this.errorMessage.first().waitFor({ state: 'visible', timeout: 5000 }).then(() => false).catch(() => true)
            ]);
            
            return result;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    async clickRegisterLink() {
        await this.registerLink.first().click();
        await this.page.waitForTimeout(1 * 1000);
    }

    async clickForgotPasswordLink() {
        const link = this.forgotPasswordLink.first();
        if (await link.isVisible()) {
            await link.click();
            await this.page.waitForTimeout(1 * 1000);
        }
    }

    async getErrorMessage(): Promise<string> {
        try {
            await this.errorMessage.first().waitFor({ state: 'visible', timeout: 3000 });
            return await this.errorMessage.first().textContent() || '';
        } catch {
            return '';
        }
    }

    async isErrorDisplayed(): Promise<boolean> {
        return await this.errorMessage.first().isVisible();
    }

    async isLoginButtonEnabled(): Promise<boolean> {
        return await this.loginButton.first().isEnabled();
    }

    async isEmailFieldVisible(): Promise<boolean> {
        return await this.emailField.first().isVisible();
    }

    async isPasswordFieldVisible(): Promise<boolean> {
        return await this.passwordField.first().isVisible();
    }

    async clearLoginForm() {
        await this.emailField.first().clear();
        await this.passwordField.first().clear();
    }

    async waitForLoadingToComplete() {
        try {
            await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
            await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
        } catch {
            // Loading spinner might not appear for fast responses
        }
    }

    async isUserLoggedIn(): Promise<boolean> {
        // Check if we're on a authenticated page (not on login page)
        const currentUrl = this.page.url();
        return !currentUrl.includes('/auth/login') && !currentUrl.includes('/auth/register');
    }

    async logout() {
        // Look for logout button/link
        const logoutButton = this.page.getByRole('button', { name: /log out|sign out|logout/i })
            .or(this.page.getByRole('link', { name: /log out|sign out|logout/i }));
        
        if (await logoutButton.first().isVisible()) {
            await logoutButton.first().click();
            await this.page.waitForURL('**/login', { timeout: 5000 });
        }
    }

    async getFieldValidationError(fieldName: 'email' | 'password'): Promise<string> {
        const field = fieldName === 'email' ? this.emailField : this.passwordField;
        const fieldContainer = field.first().locator('xpath=..');
        const errorElement = fieldContainer.locator('.error-text, .invalid-feedback, [class*="error"]');
        
        if (await errorElement.isVisible()) {
            return await errorElement.textContent() || '';
        }
        return '';
    }

    async isRememberMeChecked(): Promise<boolean> {
        const checkbox = this.rememberMeCheckbox.first();
        if (await checkbox.isVisible()) {
            return await checkbox.isChecked();
        }
        return false;
    }

    // Helper function to get valid user credentials from env or test data
    async getValidUserCredentials() {
        // First try environment variables
        if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
            return {
                email: process.env.TEST_USER_EMAIL,
                password: process.env.TEST_USER_PASSWORD
            }
        }
        
        // Then try to get a previously registered user from test data
        const filePath = path.join(__dirname, '..', 'test-data', 'userData.json')
        
        if (fs.existsSync(filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                if (data.lastRegisteredUser) {
                    return {
                        email: data.lastRegisteredUser.email,
                        password: data.lastRegisteredUser.password
                    }
                }
            } catch (error) {
                // Silently handle error - no logging of sensitive data
            }
        }
        
        // Fallback to environment variables only - no hardcoded credentials
        if (process.env.DEFAULT_TEST_EMAIL && process.env.DEFAULT_TEST_PASSWORD) {
            return {
                email: process.env.DEFAULT_TEST_EMAIL,
                password: process.env.DEFAULT_TEST_PASSWORD
            }
        }
        
        // Return null if no credentials available
        return null
    }
}