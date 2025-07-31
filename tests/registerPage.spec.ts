import { test, expect } from '@playwright/test'

// Helper function to generate random data that's easier to remember
function generateRandomUserData() {
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

test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
})

test.describe('Registration Page Tests', () => {
    
    test('should successfully register user and navigate to homepage', async ({ page }) => {
        const userData = generateRandomUserData()
        
        console.log('Registering with random data:', {
            fullName: userData.fullName,
            email: userData.email
        })
        
        const fullNameField = page.getByLabel('Full Name').or(page.getByPlaceholder('Full Name'))
        const emailField = page.getByLabel('Email').or(page.getByPlaceholder('Email'))  
        const passwordField = page.getByLabel('Password').or(page.getByPlaceholder('Password'))
        const confirmPasswordField = page.getByLabel('Confirm Password').or(page.getByPlaceholder('Confirm Password'))
        const registerButton = page.getByRole('button', { name: /register|sign up/i })

        await fullNameField.first().fill(userData.fullName)
        await emailField.first().fill(userData.email)
        await passwordField.first().fill(userData.password)
        
        if (await confirmPasswordField.first().isVisible()) {
            await confirmPasswordField.first().fill(userData.password)
        }

        // Handle terms checkbox if present
        const customCheckbox = page.locator('.custom-checkbox')
        if (await customCheckbox.isVisible()) {
            await customCheckbox.click()
        }

        await registerButton.first().click()
        
        // Verify successful registration and navigation to dashboard
        await expect(page).toHaveURL('/pages/iot-dashboard')
    })

})