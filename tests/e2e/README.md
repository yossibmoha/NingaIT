# NinjaIT E2E Tests

End-to-end tests for NinjaIT platform using Playwright.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests with UI
npm run test:ui

# Debug tests
npm run test:debug
```

## 📁 Structure

```
tests/e2e/
├── specs/              # Test specifications
│   ├── auth.spec.ts    # Authentication tests
│   ├── dashboard.spec.ts   # Dashboard tests
│   └── accessibility.spec.ts   # A11y tests
├── fixtures/           # Test fixtures
├── playwright.config.ts    # Playwright config
└── package.json
```

## 🧪 Test Categories

### Authentication Tests
- Login form validation
- Registration flow
- Password validation
- Error handling
- Navigation between auth pages

### Dashboard Tests
- Protected route access
- Dashboard layout
- Statistics cards
- Navigation
- User menu

### Accessibility Tests
- WCAG compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

## 📊 Test Reports

After running tests, view the report:

```bash
npm run test:report
```

Reports include:
- Test results
- Screenshots on failure
- Videos of failed tests
- Trace files for debugging

## 🎯 Running Specific Tests

```bash
# Run specific file
npx playwright test auth.spec.ts

# Run specific test
npx playwright test -g "should display login form"

# Run in specific browser
npx playwright test --project=chromium
```

## 🔧 Configuration

Edit `playwright.config.ts` to customize:
- Base URL
- Browser configurations
- Test timeouts
- Retry logic
- Screenshot/video settings

## 📱 Mobile Testing

Tests run on:
- Desktop Chrome, Firefox, Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 13)

## 🐛 Debugging

```bash
# Debug mode
npm run test:debug

# Generate test code
npm run test:codegen
```

## 🔐 Authentication

For authenticated tests, use fixtures:

```typescript
import { test as base } from '@playwright/test';

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login logic here
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await use(page);
  },
});
```

## 📝 Best Practices

1. **Use role selectors**: `getByRole('button', { name: 'Submit' })`
2. **Wait for elements**: Use `waitFor` when needed
3. **Test user flows**: Not just individual components
4. **Mock API when needed**: Use `page.route()` for API mocking
5. **Keep tests independent**: Each test should work in isolation

## 🚀 CI Integration

Tests run automatically in GitHub Actions:

```yaml
- name: Run E2E tests
  run: |
    cd tests/e2e
    npm install
    npx playwright install --with-deps
    npm test
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

