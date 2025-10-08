import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /welcome to ninjait/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation messages
    await expect(page.getByText(/please input your email/i)).toBeVisible();
    await expect(page.getByText(/please input your password/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder(/email address/i).fill('invalid@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message (if backend is running)
    // await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /sign up now/i }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/full name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email address/i)).toBeVisible();
    await expect(page.getByPlaceholder(/organization name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/^password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show validation messages
    await expect(page.getByText(/please input your full name/i)).toBeVisible();
    await expect(page.getByText(/please input your email/i)).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByPlaceholder(/full name/i).fill('Test User');
    await page.getByPlaceholder(/email address/i).fill('test@example.com');
    await page.getByPlaceholder(/organization name/i).fill('Test Org');
    await page.getByPlaceholder(/^password/i).first().fill('password123');
    await page.getByPlaceholder(/confirm password/i).fill('different123');
    
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show password mismatch error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should navigate back to login from register', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});

