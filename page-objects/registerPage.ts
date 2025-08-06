import { Locator, Page } from "@playwright/test";
import { HelperBase } from "./helperBase";
import * as fs from 'fs';
import * as path from 'path';

interface UserData {
    fullName: string;
    email: string;
    password: string;
    registrationDate: string;
    status: 'registered' | 'failed';
}

export class RegisterPage extends HelperBase {
    protected readonly page: Page;

    // Private locators for registration form
    private readonly fullNameField: Locator;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly confirmPasswordField: Locator;
    private readonly registerButton: Locator;
    private readonly loginLink: Locator;
    private readonly termsCheckbox: Locator;
    private readonly formContainer: Locator;
    private readonly successMessage: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        
        // Initialize locators following TooltipPage pattern
        this.fullNameField = page.getByLabel('Full Name').or(page.getByPlaceholder('Full Name'));
        this.emailField = page.getByLabel('Email').or(page.getByPlaceholder('Email'));
        this.passwordField = page.getByLabel('Password').or(page.getByPlaceholder('Password'));
        this.confirmPasswordField = page.getByLabel('Confirm Password').or(page.getByPlaceholder('Confirm Password'));
        this.registerButton = page.getByRole('button', { name: /register|sign up/i });
        this.loginLink = page.getByRole('link', { name: /login|sign in/i });
        this.termsCheckbox = page.locator('.custom-checkbox').or(page.locator('input[type="checkbox"]'));
        this.formContainer = page.locator('form').or(page.locator('.register-form, .registration-form'));
        this.successMessage = page.locator('.alert-success, .success-message, [class*="success"]');
        this.errorMessage = page.locator('.alert-error, .error-message, [class*="error"]');
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

    async registerUser(fullName: string, email: string, password: string, confirmPassword?: string, acceptTerms: boolean = false): Promise<UserData> {
        const userData: UserData = {
            fullName,
            email,
            password,
            registrationDate: new Date().toISOString(),
            status: 'failed'
        };

        try {
            await this.fillRegistrationForm(fullName, email, password, confirmPassword);
            
            if (acceptTerms) {
                await this.acceptTermsAndConditions();
            }
            
            await this.submitRegistration();
            
            // Check if registration was successful
            const isSuccess = await this.isRegistrationSuccessful();
            userData.status = isSuccess ? 'registered' : 'failed';
            
            // Save user data to file
            await this.saveUserDataToFile(userData);
            
            return userData;
            
        } catch (error) {
            console.error('Registration failed:', error);
            await this.saveUserDataToFile(userData);
            return userData;
        }
    }

    async acceptTermsAndConditions() {
        try {
            await this.termsCheckbox.first().click();
            await this.waitForNumberOfSeconds(0.5);
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

    async isRegistrationSuccessful(): Promise<boolean> {
        try {
            // Wait for either success or error message
            await Promise.race([
                this.successMessage.waitFor({ state: 'visible', timeout: 5000 }),
                this.errorMessage.waitFor({ state: 'visible', timeout: 5000 })
            ]);
            
            const isSuccess = await this.successMessage.isVisible();
            return isSuccess;
        } catch {
            return false;
        }
    }

    async saveUserDataToFile(userData: UserData): Promise<void> {
        try {
            const dataDir = path.join(__dirname, '../test-data');
            const filePath = path.join(dataDir, 'registeredUsers.json');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            let existingData: UserData[] = [];
            
            // Read existing data if file exists
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                existingData = JSON.parse(fileContent);
            }
            
            // Add new user data
            existingData.push(userData);
            
            // Write updated data back to file
            fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
            
            console.log(`User data saved to ${filePath}`);
            
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    async getLastRegisteredUser(): Promise<UserData | null> {
        try {
            const filePath = path.join(__dirname, '../test-data/registeredUsers.json');
            
            if (!fs.existsSync(filePath)) {
                return null;
            }
            
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const users: UserData[] = JSON.parse(fileContent);
            
            // Return the last successfully registered user
            const lastRegisteredUser = users.filter(user => user.status === 'registered').pop();
            return lastRegisteredUser || null;
            
        } catch (error) {
            console.error('Failed to read user data:', error);
            return null;
        }
    }
}