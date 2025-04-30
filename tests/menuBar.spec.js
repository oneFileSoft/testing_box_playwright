import { test, expect } from '@playwright/test';

// test.beforeEach(async ({ page }) => {
//   await page.goto('/');
//   console.log(' ***********************    Current URL: ', page.url());
//   await page.waitForLoadState();
// });

test('navigation throught menu Bar', async ({ page }) => {
    await page.goto('/');
    console.log(' ***********************    Current URL: ', page.url());
    await page.waitForLoadState();

    expect(await page.title()).toContain('testing area 51');
    await expect(page.getByRole('img', { name: 'Home' })).toBeVisible();
    await expect(page.locator('.bar-icon.w-8.h-8.cursor-pointer.dim-icon')).toBeVisible();

    await page.getByRole('img', { name: 'Contact' }).click();
    expect (await page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    expect (await page.getByRole('button', { name: 'Submit' })).toBeVisible();

    await page.getByRole('img', { name: 'User-DB' }).click();
    expect (await page.getByRole('heading', { name: 'Login or insert new User' })).toBeVisible();
    expect (await page.getByRole('button', { name: 'Authenticate' })).toBeVisible();


    await page.getByRole('img', { name: 'About Jenkins' }).click();
    expect (await page.getByRole('heading', { name: 'Jenkins controller' })).toBeVisible();
    expect (await page.getByRole('heading', { name: 'Web site' })).toBeVisible();
    expect (await page.getByRole('heading', { name: 'Regression' })).toBeVisible();
    expect (await page.getByRole('button', { name: 'Contact Us' })).toBeVisible();

    await page.getByRole('button', { name: 'Contact Us' }).click();
    expect (await page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    expect (await page.getByText("Submit")).toBeVisible();
  });