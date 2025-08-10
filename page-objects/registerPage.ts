import { Locator, Page } from "@playwright/test";
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

interface UserData {
    fullName: string;
    email: string;
    password: string;
    registrationDate: string;
    status: 'registered' | 'failed';
}

export class RegisterPage {
    private readonly page: Page;
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

    private constructor(page: Page) {
        this.page = page;
        
        // Initialize locators
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

    static create(page: Page): RegisterPage {
        return new RegisterPage(page);
    }

    async navigateToRegisterPage() {
        await this.page.goto('/auth/register');
        await this.page.waitForTimeout(1 * 1000);
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
        await this.page.waitForTimeout(2 * 1000);
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
            await this.page.waitForTimeout(0.5 * 1000);
        } catch (error) {
            console.warn('Error clicking terms checkbox:', error);
        }
    }

    async clickLoginLink() {
        await this.loginLink.first().click();
        await this.page.waitForTimeout(1 * 1000);
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

    // Helper function to generate random user data
    async generateRandomUserData() {
        const randomNum = Math.floor(Math.random() * 999) + 1
        
        const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William']
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
        
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        
        // Simple, memorable format: firstname.lastname123@test.com
        const email = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${randomNum}@test.com`
        
        return {
            fullName: `${randomFirstName} ${randomLastName}`,
            email: email,
            password: `Welcome${randomNum}!`
        }
    }

    // Function to save user data to file (appends to existing users)
    async saveUserDataToJson(userData: any) {
        const filePath = path.join(__dirname, '..', 'test-data', 'userData.json')
        const dir = path.dirname(filePath)
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true })
        }
        
        // Read existing data or create new structure
        let data = {
            registeredUsers: [],
            lastRegisteredUser: null
        }
        
        if (fs.existsSync(filePath)) {
            const existingData = await fs.promises.readFile(filePath, 'utf-8')
            data = JSON.parse(existingData)
        }
        
        // Add timestamp to user data
        const userWithTimestamp = {
            ...userData,
            registeredAt: new Date().toISOString()
        }
        
        // Append new user to the list
        data.registeredUsers.push(userWithTimestamp)
        data.lastRegisteredUser = userWithTimestamp
        
        // Save updated data - passwords are saved for test purposes only
        // In production, this should be encrypted or use env variables
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
        console.log(`User data saved! Total users: ${data.registeredUsers.length}`)
        
        // Also save to .env file for secure storage (if enabled)
        if (process.env.SAVE_TO_ENV === 'true') {
            await this.appendToEnvFile(userData.email, userData.password)
        }
    }

    private async appendToEnvFile(email: string, password: string) {
        const envPath = path.join(__dirname, '..', '.env')
        const envContent = `
# Last registered user (auto-generated)
TEST_USER_EMAIL=${email}
TEST_USER_PASSWORD=${password}
`
        await fs.promises.appendFile(envPath, envContent)
    }
}