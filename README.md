# Playwright Testing Framework

A professional, scalable Playwright testing framework implementing Page Object Model (POM) design pattern with advanced features for UI test automation.

## 🚀 Features

- **Page Object Model Architecture**: Clean separation of test logic and page interactions
- **Reusable Components**: Modular page objects with inheritance
- **Smart Test Data Management**: Automatic user data generation and persistence
- **Cross-Browser Support**: Tests run on Chrome, Firefox, and Safari
- **Parallel Execution**: Optimized for speed with parallel test runs
- **Detailed Reporting**: HTML reports with screenshots and traces
- **TypeScript Support**: Full type safety and IntelliSense

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Application under test running (default: http://localhost:4200)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/NhuDangCD/playwright-testing-framework.git
cd playwright-testing-framework
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## 🏗️ Project Structure

```
playwright-testing-framework/
├── tests/                      # Test specifications
│   ├── login.spec.ts          # Login functionality tests
│   ├── registerPage.spec.ts   # Registration tests
│   ├── tooltip.spec.ts        # Tooltip interaction tests
│   └── ...
├── page-objects/              # Page Object Model classes
│   ├── helperBase.ts         # Base class with common utilities
│   ├── navigationPage.ts     # Navigation component
│   ├── registerPage.ts       # Registration page object
│   └── ...
├── test-data/                 # Test data storage
│   └── userData.json         # Persisted user credentials
├── playwright.config.ts       # Playwright configuration
└── CLAUDE.md                 # AI assistance documentation
```

## 🎯 Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI (headed mode)
```bash
npm run test:headed
```

### Run tests in specific browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### Run specific test file
```bash
npx playwright test tests/login.spec.ts
```

### Debug tests
```bash
npm run test:debug
```

### View test report
```bash
npm run report
```

### Use Playwright UI mode
```bash
npm run test:ui
```

### Generate tests with Codegen
```bash
npm run codegen
```

## 📝 Test Data Management

The framework automatically manages test data:

### Random User Generation
```typescript
// Generates unique user data for each test
{
  "fullName": "Emma Williams",
  "email": "emma.williams924@test.com",
  "password": "Welcome924!"
}
```

### Data Persistence
- User data is saved to `test-data/userData.json`
- Login tests can reuse previously registered users
- View all registered users with the "Show all registered users" test

## 🔧 Configuration

### Base URL
Set in `playwright.config.ts`:
```typescript
use: {
  baseURL: 'http://localhost:4200',
}
```

### Browsers
Configure in `playwright.config.ts`:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

## 📖 Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test'
import { YourPage } from '../page-objects/yourPage'

test.describe('Feature Name', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('test description', async ({ page }) => {
        const yourPage = new YourPage(page)
        // Test implementation
    })
})
```

### Page Object Pattern
```typescript
export class LoginPage extends HelperBase {
    private readonly emailInput: Locator
    private readonly passwordInput: Locator
    
    constructor(page: Page) {
        super(page)
        this.emailInput = page.getByRole('textbox', { name: 'Email' })
        this.passwordInput = page.getByRole('textbox', { name: 'Password' })
    }
    
    async login(email: string, password: string) {
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.page.getByRole('button', { name: 'Log In' }).click()
    }
}
```

## 🤝 Application Under Test

This framework is designed to test web applications. By default, it's configured to test an Angular demo app available at:
- Repository: https://github.com/NhuDangCD/nhu-angular-demo-app
- Local URL: http://localhost:4200

You can easily adapt it to test any web application by updating the base URL and page objects.

## 📊 Test Coverage

Current test coverage includes:
- ✅ User Authentication (Login/Registration)
- ✅ Form Interactions
- ✅ Date Picker Functionality
- ✅ Smart Table Operations
- ✅ Tooltip Interactions
- ✅ Temperature Slider Controls

## 🔍 Debugging

1. **VS Code Integration**: Install Playwright Test for VS Code extension
2. **Debug Mode**: Use `npm run test:debug`
3. **Trace Viewer**: Traces are captured on test failure
4. **Screenshots**: Automatically captured on failure

## 📈 Best Practices

1. **Use Page Objects**: Keep selectors in page objects, not in tests
2. **Avoid Hard Waits**: Use Playwright's built-in waiting mechanisms
3. **Data Independence**: Generate unique test data for each run
4. **Parallel Execution**: Write tests to run independently
5. **Meaningful Names**: Use descriptive test and function names

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Nhu Dang**
- GitHub: [@NhuDangCD](https://github.com/NhuDangCD)

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Inspired by best practices in test automation
- Designed for scalability and maintainability