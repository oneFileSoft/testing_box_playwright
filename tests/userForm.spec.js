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
  expect (respBody.expenses[0].userId == 46 && respBody.expenses[0].transDescr == "nothing").toBeTruthy();
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
  expect (await page.getByPlaceholder('Description')).toBeVisible();
  expect (await page.getByPlaceholder('Total Amount')).toBeVisible();
  //following, because they have unique type - easy to capture by locator
  // expect (await page.locator('input[type="date"]').isVisible()).toBeTruthy();
  
  expect (await page.getByRole('heading', { name: 'Add Expense for test' })).toBeVisible(); 
});

 