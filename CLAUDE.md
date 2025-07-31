# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright testing project for a modified Angular 14 Nebular admin application. The project structure includes:
- Angular application under `src/` with Nebular UI components
- Playwright tests under `tests/` using Page Object Model pattern
- Page objects under `page-objects/` for test organization

## Commands

### Application Setup and Running
```bash
npm install --force    # Install dependencies (force flag required due to version conflicts)
npm start              # Start Angular dev server on http://localhost:4200
```

### Testing Commands
```bash
npx playwright test                    # Run all tests
npx playwright test --headed          # Run tests with browser UI (headless: false in config)
npx playwright test tests/filename.spec.ts  # Run specific test file
npx playwright show-report           # View HTML test report
```

### Browser Configuration
- Tests run on Chromium, Firefox, and WebKit by default
- `headless: false` is configured to show browser UI during test execution
- Parallel execution enabled except on CI

## Architecture

### Page Object Model Structure
The project follows a Page Object Model pattern with inheritance:

- **HelperBase** (`page-objects/helperBase.ts`): Base class providing common utilities like `waitForNumberOfSeconds()`
- **NavigationPage** (`page-objects/navigationPage.ts`): Handles menu navigation with XPath locators and private locator pattern
- **Specific Page Objects**: Each page has its own class (formLayoutsPage, DatePicker, SmartTable)

### Key Patterns
- **Private Locators**: Use private readonly locators initialized in constructor
- **XPath Usage**: Navigation uses XPath selectors (e.g., `//a[normalize-space()="Form Layouts"]`)
- **Inheritance**: All page objects extend HelperBase for shared functionality
- **BeforeEach Setup**: Tests navigate to `http://localhost:4200/` before each test

### Test Organization
- `tests/usePageObjects.spec.ts`: Main test file demonstrating form filling and date picker interactions
- `tests/smartTable.spec.ts`: Smart table specific tests
- `tests/firstTest.spec.ts`: Basic test examples
- `tests/tooltip.spec.ts`: Tooltip hover functionality tests

### Angular Application Structure
The app uses Nebular theme with:
- Dashboard with widgets (electricity, solar, security cameras, etc.)
- Forms section (layouts, datepicker)
- Tables & Data section (smart table, tree grid)
- Modal & Overlays (toastr, tooltip, dialog, etc.)
- Charts section with ECharts integration

## Development Notes

- The application requires `--force` flag during npm install due to Angular version conflicts
- Tests expect the Angular dev server to be running on localhost:4200
- Browser headless mode is disabled by default for debugging
- The project uses both CSS selectors and XPath locators depending on the component