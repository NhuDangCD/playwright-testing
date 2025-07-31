import { Locator, Page } from "@playwright/test";
import { HelperBase } from "./helperBase";

export class RegisterPage extends HelperBase {
    protected readonly page: Page;

    // Private locators
    private readonly fullNameField: Locator;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly confirmPasswordField: Locator;
    private readonly registerButton: Locator;
    private readonly loginLink: Locator;
    private readonly termsCheckbox: Locator;
    private readonly formContainer: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize locators with multiple selector strategies
        this.fullNameField = page.getByLabel('Full Name').or(page.getByPlaceholder('Full Name'));
        this.emailField = page.getByLabel('Email').or(page.getByPlaceholder('Email'));
        this.passwordField = page.getByLabel('Password').or(page.getByPlaceholder('Password'));
        this.confirmPasswordField = page.getByLabel('Confirm Password').or(page.getByPlaceholder('Confirm Password'));
        this.registerButton = page.getByRole('button', { name: /register|sign up/i });
        this.loginLink = page.getByRole('link', { name: /login|sign in/i });
        this.termsCheckbox = page.locator('.custom-checkbox').or(
            page.locator('input[type="checkbox"]')
        ).or(
            page.locator('[class*="checkbox"]')
        ).or(
            page.getByRole('checkbox')
        );
        this.formContainer = page.locator('form').or(page.locator('.register-form, .registration-form'));
    }

    async navigateToRegisterPage() {
        await this.page.goto('/auth/register');
        await this.waitForNumberOfSeconds(1);
    }

    async fillRegistrationForm(fullName: string, email: string, password: string, confirmPassword?: string) {
        await this.fullNameField.first().fill(fullName);
        await this.emailField.first().fill(email);
        await this.passwordField.first().fill(password);
        
        if (confirmPassword && await this.confirmPasswordField.first().isVisible()) {
            await this.confirmPasswordField.first().fill(confirmPassword);
        }
    }

    async submitRegistration() {
        await this.registerButton.first().click();
        await this.waitForNumberOfSeconds(2);
    }

    async registerUser(fullName: string, email: string, password: string, confirmPassword?: string, acceptTerms: boolean = false) {
        await this.fillRegistrationForm(fullName, email, password, confirmPassword);
        
        if (acceptTerms) {
            await this.acceptTermsAndConditions();
        }
        
        await this.submitRegistration();
    }

    async acceptTermsAndConditions() {
        try {
            // Try clicking the custom checkbox span
            const customCheckbox = this.page.locator('.custom-checkbox');
            if (await customCheckbox.isVisible()) {
                await customCheckbox.click();
                return;
            }

            // Try clicking the actual input checkbox
            const inputCheckbox = this.page.locator('input[type="checkbox"]');
            if (await inputCheckbox.isVisible()) {
                await inputCheckbox.check();
                return;
            }

            // Try clicking by text/label
            const termsLabel = this.page.locator('text=/terms|agree|accept/i');
            if (await termsLabel.isVisible()) {
                await termsLabel.click();
                return;
            }

            console.warn('Terms checkbox not found or not clickable');
        } catch (error) {
            console.warn('Error clicking terms checkbox:', error);
        }
    }

    async clickLoginLink() {
        await this.loginLink.first().click();
        await this.waitForNumberOfSeconds(1);
    }


    async isEmailFieldVisible(): Promise<boolean> {
        return await this.emailField.first().isVisible();
    }

    async isPasswordFieldVisible(): Promise<boolean> {
        return await this.passwordField.first().isVisible();
    }

    async isRegisterButtonVisible(): Promise<boolean> {
        return await this.registerButton.first().isVisible();
    }
}