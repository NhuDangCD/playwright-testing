# Playwright Testing Complete Solution

A complete, ready-to-run Playwright testing framework with an integrated Angular demo application. Clone, install, and run tests immediately - no additional setup required!

## 🎯 Overview

This repository contains everything you need:
- **Playwright Testing Framework** - Professional Page Object Model implementation
- **Angular Demo Application** - Full application for testing (included)
- **Pre-configured Tests** - Login, registration, forms, tooltips, and more
- **One-Command Setup** - Just clone and run!

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/NhuDangCD/playwright-testing.git
cd playwright-testing

# Install dependencies (includes Angular app + Playwright)
npm install --force

# Option 1: Run app and tests together
npm run start:test

# Option 2: Run separately
# Terminal 1 - Start Angular app
npm start

# Terminal 2 - Run tests
npm test
```

That's it! No need to set up a separate application.

## 📋 Features

### Complete Testing Solution
- ✅ Angular application included - no external dependencies
- ✅ Page Object Model architecture
- ✅ Random test data generation
- ✅ User data persistence
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Parallel execution
- ✅ HTML reports with screenshots

### Test Coverage
- User Authentication (Login/Registration)
- Form interactions and validation
- Date picker functionality
- Smart table operations
- Tooltip interactions
- Temperature slider controls

## 🏗️ Project Structure

```
playwright-testing/
├── src/                       # Angular application source
├── tests/                     # Playwright test files
│   ├── login.spec.ts
│   ├── registerPage.spec.ts
│   ├── tooltip.spec.ts
│   └── ...
├── page-objects/             # Page Object Model classes
│   ├── helperBase.ts
│   ├── navigationPage.ts
│   └── ...
├── test-data/               # Test data persistence
├── angular.json            # Angular configuration
├── playwright.config.ts    # Playwright configuration
└── package.json           # All dependencies
```

## 📝 Available Scripts

### Application & Testing
- `npm start` - Start Angular app (http://localhost:4200)
- `npm run start:test` - Start app and run tests automatically
- `npm test` - Run all Playwright tests
- `npm run test:headed` - Run tests with browser visible
- `npm run test:chrome` - Run tests in Chrome only
- `npm run test:ui` - Open Playwright UI mode
- `npm run test:debug` - Debug tests
- `npm run report` - View test report
- `npm run codegen` - Generate tests with Playwright codegen

### Angular Commands
- `npm run build` - Build Angular application
- `ng serve` - Start Angular dev server

## 🔧 Configuration

### Base URL
The application runs on `http://localhost:4200` by default. To change:
1. Update `playwright.config.ts` baseURL
2. Update Angular port in `angular.json` if needed

### Test Configuration
Edit `playwright.config.ts`:
```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4200',
    headless: false, // Show browser
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Add more browsers as needed
  ],
});
```

## 💡 Writing New Tests

1. Create test file in `tests/` directory:
```typescript
import { test, expect } from '@playwright/test'
import { YourPage } from '../page-objects/yourPage'

test('your test name', async ({ page }) => {
    await page.goto('/')
    const yourPage = new YourPage(page)
    // Your test logic
})
```

2. Create page object in `page-objects/`:
```typescript
import { Page, Locator } from "@playwright/test"
import { HelperBase } from "./helperBase"

export class YourPage extends HelperBase {
    private readonly yourElement: Locator
    
    constructor(page: Page) {
        super(page)
        this.yourElement = page.locator('selector')
    }
}
```

## 🎨 Angular Application Features

The included Angular app provides:
- **Dashboard**: Interactive widgets and charts
- **Forms**: Various input types and layouts
- **Tables**: Smart table with CRUD operations
- **Modals**: Tooltips, toasts, dialogs
- **Authentication**: Login/Register pages (no backend)
- **Charts**: ECharts integration

## 🐛 Troubleshooting

### Installation Issues
If you encounter dependency conflicts:
```bash
npm install --force
```

### Port Already in Use
If port 4200 is busy:
```bash
# Kill process on port 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Or change port in angular.json
```

### Test Failures
1. Ensure Angular app is running (`npm start`)
2. Check browser logs in headed mode (`npm run test:headed`)
3. View detailed report (`npm run report`)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📊 Test Data Management

The framework manages test data automatically:
- Generates unique users for each test run
- Saves to `test-data/userData.json`
- Reuses data for login tests

Example:
```json
{
  "registeredUsers": [
    {
      "fullName": "Emma Williams",
      "email": "emma.williams924@test.com",
      "password": "Welcome924!",
      "registeredAt": "2025-07-29T17:52:49.837Z"
    }
  ]
}
```

## 🚦 CI/CD Ready

Add to your CI pipeline:
```yaml
- name: Install dependencies
  run: npm ci --force
  
- name: Install Playwright
  run: npx playwright install
  
- name: Run tests
  run: npm run start:test
```

## 📄 License

MIT License

## 👤 Author

**Nhu Dang**
- GitHub: [@NhuDangCD](https://github.com/NhuDangCD)

## 🙏 Acknowledgments

- Angular app based on [ngx-admin](https://github.com/akveo/ngx-admin)
- Built with [Playwright](https://playwright.dev/)
- UI components by [Nebular](https://akveo.github.io/nebular/)