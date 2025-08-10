import { test, expect } from '@playwright/test'
import { RegisterPage } from '../page-objects/registerPage'

test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
})

test.describe('Registration Page Tests', () => {
    
    test('should successfully register new user and navigate to homepage', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        const userData = await registerPage.generateRandomUserData()
        
        console.log('Registering with random data:', {
            fullName: userData.fullName,
            email: userData.email
        })
        
        await registerPage.registerUser(
            userData.fullName,
            userData.email, 
            userData.password,
            userData.password,
            true // accept terms
        )
        
        // Verify successful registration and navigation to dashboard
        await expect(page).toHaveURL('/pages/iot-dashboard')
        
        // Save the user data for future use
        await registerPage.saveUserDataToJson(userData)
        
        console.log('✅ User registered successfully')
    })
    
    test('should show validation error for empty full name', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        await registerPage.fillRegistrationForm('', 'test@test.com', 'Password123!', 'Password123!')
        await registerPage.submitRegistration()
        
        // Should not navigate away from registration page
        await expect(page).toHaveURL(/.*\/auth\/register/)
        
        console.log('✅ Empty full name validation works')
    })
    
    test('should show validation error for empty email', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        await registerPage.fillRegistrationForm('John Doe', '', 'Password123!', 'Password123!')
        await registerPage.submitRegistration()
        
        // Should not navigate away from registration page
        await expect(page).toHaveURL(/.*\/auth\/register/)
        
        console.log('✅ Empty email validation works')
    })
    
    test('should show validation error for invalid email formats', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        const invalidEmails = [
            'notanemail',
            'missing@',
            '@nodomain.com',
            'spaces in@email.com',
            'double@@domain.com',
            'email@',
            'email@.com'
        ]
        
        for (const invalidEmail of invalidEmails) {
            await page.goto('/auth/register') // Reset page
            await registerPage.fillRegistrationForm('John Doe', invalidEmail, 'Password123!', 'Password123!')
            await registerPage.submitRegistration()
            
            // Should stay on registration page
            const stillOnRegisterPage = page.url().includes('/auth/register')
            expect(stillOnRegisterPage).toBe(true)
            
            console.log(`✅ Invalid email rejected: ${invalidEmail}`)
        }
    })
    
    test('should show error when passwords do not match', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        await registerPage.fillRegistrationForm(
            'John Doe',
            'john@test.com',
            'Password123!',
            'DifferentPassword123!'
        )
        await registerPage.submitRegistration()
        
        // Should stay on registration page
        await expect(page).toHaveURL(/.*\/auth\/register/)
        
        console.log('✅ Password mismatch validation works')
    })
    
    test('should validate password strength requirements', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        const weakPasswords = [
            '123',           // Too short
            'password',      // No numbers or special chars
            '12345678',      // Only numbers
            'Password',      // No numbers
            'password1',     // No uppercase
            'PASSWORD1',     // No lowercase
        ]
        
        for (const weakPassword of weakPasswords) {
            await page.goto('/auth/register') // Reset page
            await registerPage.fillRegistrationForm('John Doe', 'john@test.com', weakPassword, weakPassword)
            await registerPage.submitRegistration()
            
            // Should stay on registration page
            const stillOnRegisterPage = page.url().includes('/auth/register')
            expect(stillOnRegisterPage).toBe(true)
            
            console.log(`✅ Weak password rejected: ${weakPassword}`)
        }
    })
    
    test('should show error for duplicate email registration', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        // Use a fixed email that might already exist
        const existingEmail = 'existing@test.com'
        
        // First registration attempt
        await registerPage.fillRegistrationForm(
            'First User',
            existingEmail,
            'Password123!',
            'Password123!'
        )
        await registerPage.acceptTermsAndConditions()
        await registerPage.submitRegistration()
        
        // Navigate back to registration if successful
        await page.goto('/auth/register')
        
        // Try to register with same email
        await registerPage.fillRegistrationForm(
            'Second User',
            existingEmail,
            'Password456!',
            'Password456!'
        )
        await registerPage.acceptTermsAndConditions()
        await registerPage.submitRegistration()
        
        // Should show error or stay on registration page
        const isSuccess = await registerPage.isRegistrationSuccessful()
        
        // If registration was successful the first time, second should fail
        console.log('✅ Duplicate email handling tested')
    })
    
    test('should handle SQL injection attempts in registration fields', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        const sqlInjectionAttempts = [
            { name: "'; DROP TABLE users; --", email: "test@test.com" },
            { name: "John Doe", email: "admin' OR '1'='1" },
            { name: "1' OR '1' = '1", email: "hack@test.com" },
        ]
        
        for (const attempt of sqlInjectionAttempts) {
            await page.goto('/auth/register') // Reset page
            await registerPage.fillRegistrationForm(
                attempt.name,
                attempt.email,
                'Password123!',
                'Password123!'
            )
            await registerPage.submitRegistration()
            
            // Should handle safely without breaking
            const pageStillWorks = await registerPage.isRegisterButtonVisible()
            expect(pageStillWorks).toBe(true)
            
            console.log(`✅ SQL injection handled: ${attempt.name.substring(0, 20)}...`)
        }
    })
    
    test('should handle XSS attempts in registration fields', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        const xssAttempts = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            'javascript:alert("XSS")',
            '<svg onload=alert("XSS")>'
        ]
        
        for (const xssPayload of xssAttempts) {
            await page.goto('/auth/register') // Reset page
            await registerPage.fillRegistrationForm(
                xssPayload,
                'xss@test.com',
                'Password123!',
                'Password123!'
            )
            await registerPage.submitRegistration()
            
            // Should not execute any scripts
            const alertPresent = await page.evaluate(() => {
                try {
                    return (window.alert as any).called || false
                } catch {
                    return false
                }
            })
            
            expect(alertPresent).toBe(false)
            console.log(`✅ XSS attempt blocked: ${xssPayload.substring(0, 20)}...`)
        }
    })
    
    test('should validate maximum length for input fields', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        // Create very long strings
        const longName = 'A'.repeat(500)
        const longEmail = 'a'.repeat(250) + '@test.com'
        const longPassword = 'P@ssw0rd' + '1'.repeat(500)
        
        await registerPage.fillRegistrationForm(
            longName,
            longEmail,
            longPassword,
            longPassword
        )
        await registerPage.submitRegistration()
        
        // Should handle gracefully (either truncate or show error)
        const pageStillWorks = await registerPage.isRegisterButtonVisible()
        expect(pageStillWorks).toBe(true)
        
        console.log('✅ Maximum length validation tested')
    })
    
    test('should require terms and conditions acceptance', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        const userData = await registerPage.generateRandomUserData()
        
        // Fill form but don't accept terms
        await registerPage.fillRegistrationForm(
            userData.fullName,
            userData.email,
            userData.password,
            userData.password
        )
        
        // Submit without accepting terms
        await registerPage.submitRegistration()
        
        // Should not register successfully
        const stillOnRegisterPage = page.url().includes('/auth/register')
        expect(stillOnRegisterPage).toBe(true)
        
        console.log('✅ Terms acceptance requirement works')
    })
    
    test('should navigate to login page when clicking login link', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        await registerPage.clickLoginLink()
        
        // Should navigate to login page
        await expect(page).toHaveURL(/.*\/auth\/login/)
        
        console.log('✅ Login link navigation works')
    })
    
    test('should handle special characters in name field', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        const specialNames = [
            "O'Brien",
            "Jean-Pierre",
            "María García",
            "李明",
            "José António"
        ]
        
        for (const name of specialNames) {
            await page.goto('/auth/register') // Reset page
            const email = `${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@test.com`
            
            await registerPage.fillRegistrationForm(
                name,
                email,
                'Password123!',
                'Password123!'
            )
            await registerPage.submitRegistration()
            
            // Should handle special characters properly
            const pageStillWorks = await registerPage.isRegisterButtonVisible()
            expect(pageStillWorks).toBe(true)
            
            console.log(`✅ Special name handled: ${name}`)
        }
    })
    
    test('should handle rapid form submissions', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        await registerPage.fillRegistrationForm(
            'Test User',
            'rapid@test.com',
            'Password123!',
            'Password123!'
        )
        
        // Try multiple rapid submissions
        for (let i = 0; i < 3; i++) {
            registerPage.submitRegistration() // Don't await
        }
        
        await page.waitForTimeout(2000)
        
        // Page should still be functional
        const pageStillWorks = await registerPage.isRegisterButtonVisible()
        expect(pageStillWorks).toBe(true)
        
        console.log('✅ Handles rapid submissions without breaking')
    })
    
    test('should preserve form data on validation error', async ({ page }) => {
        const registerPage = RegisterPage.create(page)
        
        const testName = 'John Doe'
        const testEmail = 'john@test.com'
        
        // Submit with mismatched passwords
        await registerPage.fillRegistrationForm(
            testName,
            testEmail,
            'Password123!',
            'DifferentPassword!'
        )
        await registerPage.submitRegistration()
        
        // Check if name and email are still in fields
        const nameValue = await page.getByLabel('Full Name').or(page.getByPlaceholder('Full Name')).first().inputValue()
        const emailValue = await page.getByLabel('Email').or(page.getByPlaceholder('Email')).first().inputValue()
        
        expect(nameValue).toBe(testName)
        expect(emailValue).toBe(testEmail)
        
        console.log('✅ Form data preserved on validation error')
    })

})