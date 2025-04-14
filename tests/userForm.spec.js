import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  console.log(' ***********************    Current URL: ', page.url());
  await page.waitForLoadState();
});

test('Authenticate existing User', async ({ page }) => {
  await page.getByRole('img', { name: 'DB' }).click();
  await page.getByRole('textbox', { name: 'Your User Name' }).fill('test');
  await page.getByRole('textbox', { name: 'Your User Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Your Password' }).fill('test');
  await page.getByRole('textbox', { name: 'Your Password' }).press('Tab');
  await page.getByRole('button', { name: 'Authenticate' }).click();
  await page.waitForLoadState('domcontentloaded');
  // not working cause, there is 3 input[type="text", and non of the <input> does not have "name"
  // but playwright can in identifying <input> aka "textbox", but better approach to get it by getByPlaceholder
  expect (page.getByPlaceholder('Description')).toBeVisible();
  expect ( page.getByPlaceholder('Total Amount')).toBeVisible();
  //following, because they have unique type - easy to capture by locator
  // expect (await page.locator('input[type="date"]').isVisible()).toBeTruthy();
  
  expect (await page.getByRole('heading', { name: 'Add Expense for test' })).toBeVisible(); 
});

 