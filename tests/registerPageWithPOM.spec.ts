import { test, expect } from '@playwright/test'
import { RegisterPage } from '../page-objects/registerPage'
import * as fs from 'fs'
import * as path from 'path'

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

// Function to save user data to file (appends to existing users)
function saveUserData(userData: any) {
    const filePath = path.join(__dirname, '..', 'test-data', 'userData.json')
    
    // Read existing data or create new structure
    let data = {
        registeredUsers: [],
        lastRegisteredUser: null
    }
    
    if (fs.existsSync(filePath)) {
        const existingData = fs.readFileSync(filePath, 'utf-8')
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
    
    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(`User data saved! Total users: ${data.registeredUsers.length}`)
    console.log(`Latest user: ${userData.email}`)
}

test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register')
})

test.describe('Registration Page Tests with Page Object Model', () => {
    
    test('should successfully register new user and navigate to homepage', async ({ page }) => {
        const registerPage = new RegisterPage(page)
        const userData = generateRandomUserData()
        
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
        saveUserData(userData)
    })

})