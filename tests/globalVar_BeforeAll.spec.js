const { test, expect } = require('@playwright/test');

let br; // Declare a global variable

test.beforeAll(async ({ browser }) => {
  // Launch a new browser context and page
  const context = await browser.newContext();
  br = await context.newPage();
  await br.goto('https://playwright.dev/');
  br.waitForLoadState();
  await br.pause();
});

test('verification of title and vizible text', async () => {
  expect(await br.title()).toContain('Playwright');
  await expect(br.locator(".hero__title.heroTitle_ohkl")).toContainText("reliable end-to-end");
  await br.pause();
});
test('verification of getStarted image', async () => {
  await expect (br.locator("a[class$='getStarted_Sjon']")).toBeVisible();
});

test('test closed page', async () => {
  await br.pause();
  await br.close();
  await br.pause();
});

