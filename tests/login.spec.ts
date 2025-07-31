import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Function to load user data from file
function loadUserData() {
    const filePath = path.join(__dirname, '..', 'test-data', 'userData.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log('No user data found. Using default credentials.');
        return {
            email: 'demo@test.com',
            password: 'Welcome123!'
        };
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Check if we have any registered users
    if (!data.lastRegisteredUser) {
        console.log('No registered users found. Using default credentials.');
        return {
            email: 'demo@test.com',
            password: 'Welcome123!'
        };
    }
    
    return data.lastRegisteredUser;
}

// Function to get all registered users
function getAllUsers() {
    const filePath = path.join(__dirname, '..', 'test-data', 'userData.json');
    
    if (!fs.existsSync(filePath)) {
        return [];
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data.registeredUsers || [];
}

test.describe('Login Tests', () => {
    test('Login with last registered user', async ({ page }) => {
        const userData = loadUserData();
        
        console.log('Logging in with:', {
            email: userData.email
        });
        
        await page.goto('/auth/login');
        await page.getByRole('textbox', { name: 'Email address:' }).fill(userData.email);
        await page.getByRole('textbox', { name: 'Password:' }).fill(userData.password);
        await page.getByRole('button', { name: 'Log In' }).click();
        
        // Verify successful login
        await expect(page).toHaveURL('/pages/iot-dashboard');
        console.log('✅ Login successful!');
    });
    
    test('Login with hardcoded credentials', async ({ page }) => {
        await page.goto('/auth/login');
        await page.getByRole('textbox', { name: 'Email address:' }).fill('test@example.com');
        await page.getByRole('textbox', { name: 'Password:' }).fill('Welcome123!');
        await page.getByRole('button', { name: 'Log In' }).click();
        
        // Verify successful login
        await expect(page).toHaveURL('/pages/iot-dashboard');
    });
    
    test('Show all registered users', async ({ page }) => {
        const allUsers = getAllUsers();
        
        console.log(`\n📋 Total registered users: ${allUsers.length}`);
        console.log('================================');
        
        allUsers.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(`  Name: ${user.fullName}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.password}`);
            console.log(`  Registered: ${user.registeredAt}`);
        });
        
        if (allUsers.length === 0) {
            console.log('No users registered yet.');
        }
        
        // This test just displays information, always passes
        expect(true).toBe(true);
    });
});
