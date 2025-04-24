import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  console.log(' ***********************    Current URL: ', page.url());
  await page.waitForLoadState();
});


//{"success":true,"expenses":[{"id":56,"userId":46,"transDescr":"nothing","transDate":"2025-03-01T00:00:00.000Z","transTotal":5},{"id":55,"userId":46,"transDescr":"nothing1","transDate":"2025-01-30T00:00:00.000Z","transTotal":80}]}
test('Api test --- GET', async ({ request }, testInfo) => {
  const endpoint = "/getExpenses?userId=46";
  const resp = await request.get(endpoint); 

  // Get baseURL from test info config
  const baseURL = testInfo.project.use.baseURL;
  console.log(' ***********************    API - URL: ', `${baseURL}${endpoint}`);
  console.log("RESPONSE TEXT: ", await resp.text());
  expect (resp.status()).toBe(200);
  
  const text = await resp.text();
  console.log("text from GET: " + text);

  const bodyRaw = await resp.body();
  const body = bodyRaw.toString();
  const respBody =  JSON.parse(body);
  console.log("body from GET: " + body);
  // Access specific keys-values in respBody
  console.log("specific values from: respBody.expenses[0].userId=" + respBody.expenses[0].userId + 
    ", respBody.expenses[0].transDescr="+respBody.expenses[0].transDescr);
  expect (respBody.expenses[0].userId == 46 && respBody.expenses[0].transDescr == "descriptions 1 for John").toBeTruthy();
});

test('negative - User obey 25 characters lenght', async ({ page }) => {
  await page.getByRole('img', { name: 'DB' }).click();
  await page.locator('#uname').fill('asdfghjklqwertyuiop01234567890');
  await page.locator('#passw').fill('test');
  const fieldText = await page.locator('#uname').inputValue();
  expect (fieldText === "asdfghjklqwertyuiop012345"); 
});

test('Wrong User name', async ({ page }) => {
  await page.getByRole('img', { name: 'DB' }).click();
  await page.locator('#uname').fill('test1');
  await page.locator('#passw').fill('test');
  await page.getByRole('button', { name: 'Authenticate' }).click();
  
  const messageText = await getTextFromToast(page);
  expect (messageText).toContain("Error during login: Invalid username or password");
  expect (await page.getByRole('textbox', { name: 'Description' })).toBeHidden();
});

test('Wrong password', async ({ page }) => {
  await page.getByRole('img', { name: 'DB' }).click();
  await page.locator('#uname').fill('test');
  await page.locator('#passw').fill('test1');
  await page.getByRole('button', { name: 'Authenticate' }).click();

  const messageText = await getTextFromToast(page);
  expect (messageText).toContain("Error during login: Invalid username or password");  
  expect (await page.getByRole('textbox', { name: 'Description' })).toBeHidden();
});

test('Authenticate existing User', async ({ page }) => {
  await page.getByRole('img', { name: 'DB' }).click();
  await page.getByRole('textbox', { name: 'Your User Name' }).fill('test');
  await page.getByRole('textbox', { name: 'Your User Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Your Password' }).fill('test');
  await page.getByRole('textbox', { name: 'Your Password' }).press('Tab');
  await page.getByRole('button', { name: 'Authenticate' }).click();
  await page.waitForLoadState('domcontentloaded');

  await page.getByRole('textbox', { name: 'Description' }).fill('');
  expect (await page.getByRole('textbox', { name: 'Description' })).toBeVisible();

  expect (await page.getByPlaceholder('Total Amount')).toBeVisible();
  expect (await page.locator('input[type="date"]')).toBeVisible();
  //following, because they have unique type - easy to capture by locator
  // expect (await page.locator('input[type="date"]').isVisible()).toBeTruthy();
  
  expect (await page.getByRole('heading', { name: 'Add Expense for test' })).toBeVisible(); 
});


async function getTextFromToast(page) {
  await page.waitForLoadState('domcontentloaded');
  const toastBox = page.locator(".Toastify__toast").first();
  await toastBox.waitFor(); // Ensures it's visible before extracting text
  const messageText = await toastBox.textContent();
  return messageText;
}