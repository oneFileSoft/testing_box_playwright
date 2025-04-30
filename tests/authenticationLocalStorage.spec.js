import { test, expect } from '@playwright/test';
import utils from './utils.js';

let uName = "";
let pswrd = "";

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  console.log(' ***********************    Current URL: ', page.url());
  await page.waitForLoadState();
  await page.getByRole('img', { name: 'Storage' }).click();
  const data = await utils.getLocalStorage(page);
  expect(data.credentials == '' || data.credentials === undefined).toBeTruthy;
  const textContainingCredentials = await page.locator('h2').innerText();
  uName = utils.extractBetween(textContainingCredentials, "Username: ", ", Password");
  pswrd = utils.extractBetween(textContainingCredentials, ", Password: ", null)
  console.log("for this session: UserNAme: " + uName + " Pass: " + pswrd);

});


// await page.goto('https://testingbox.pw/');
// await page.getByRole('img', { name: 'Storage' }).click();
// await page.getByRole('textbox', { name: 'Username' }).click();
// await page.locator('input[placeholder="Username"]').fill('abc');
// await page.getByRole('textbox', { name: 'Password' }).click();
// await page.getByRole('textbox', { name: 'Password' }).fill('vvv');
// await page.getByText('user4713').click();
// await page.getByRole('heading', { name: 'Please login using the' }).click();
// await page.getByRole('button', { name: 'Submit' }).click();
// await page.getByText('Error login').click();
// await page.getByRole('textbox', { name: 'Username' }).click();
// await page.getByRole('textbox', { name: 'Username' }).fill('user4713');
// await page.getByRole('textbox', { name: 'Password' }).click();
// await page.getByRole('textbox', { name: 'Password' }).fill('pass4243');
// await page.getByRole('button', { name: 'Submit' }).click();
// await page.getByText('User user4713 has been logged').click();



test('Wrong UserName', async ({ page }) => {
  await page.locator('input[placeholder="Username"]').fill('abc');
  await page.locator('input[placeholder="Password"]').fill(pswrd);
  await page.getByText('Submit').click();
  const err = await page.getByText('Error login').innerText();
  expect (err).toBe("Error login");
  const data = await utils.getSessionStorage(page);
  expect (data.credentials != undefined).toBeTruthy;
  expect (data.credentials).toBe("wrong user name.");
  expect (data.userName).toBeUndefined();
});

test('Empty UserName', async ({ page }) => {
  await page.locator('input[placeholder="Password"]').fill(pswrd);
  await page.getByText('Submit').click();
  const err = await page.getByText('Error login').innerText();
  expect (err).toBe("Error login");
  const data = await utils.getSessionStorage(page);
  expect (data.credentials !== undefined).toBeTruthy();
  expect (data.credentials == "wrong user name.").toBeTruthy();
});

test('Wrong Password', async ({ page }) => {
  await page.locator('input[placeholder="Username"]').fill(uName);
  await page.locator('input[placeholder="Password"]').fill("pswrd");
  await page.getByText('Submit').click();
  const err = await page.getByText('Error login').innerText();
  expect (err).toBe("Error login");
  const colorOfTheMessage =  await utils.getComputedStyleProperty(page, page.getByText('Error login'), 'color');
  console.log(colorOfTheMessage);
  expect(colorOfTheMessage).toBe("rgb(255, 0, 0)"); // red
  const data = await utils.getSessionStorage(page);
  expect (data.credentials !== undefined).toBeTruthy();
  expect (data.credentials).toBe("wrong password.");
});


test('Correct credentials', async ({ page }) => {
  await page.locator('input[placeholder="Username"]').fill(uName);
  await page.locator('input[placeholder="Password"]').fill(pswrd);
  await page.getByText('Submit').click();
  const logSuccess = await page.getByText("User " + uName + " has been logged");
  expect (logSuccess).toBeVisible();
  const data = await utils.getSessionStorage(page);
  expect (data.credentials !== undefined).toBeTruthy();
  expect (data.credentials).toBe("authentication OK.");
  expect (data.userName != undefined && data.userName == uName).toBeTruthy;
  expect (data.password != undefined && data.password == pswrd).toBeTruthy;
});

test('LocalStore value exist after successfull authentication and navigating to Home-page', async ({ page }) => {
  await page.locator('input[placeholder="Username"]').fill(uName);
  await page.locator('input[placeholder="Password"]').fill(pswrd);
  await page.getByText('Submit').click();
  const logSuccess = await page.getByText("User " + uName + " has been logged");
  expect (logSuccess).toBeVisible();
  const colorOfTheMessage = await utils.getComputedStyleProperty(page, logSuccess, 'color');
  expect (colorOfTheMessage).toBe("rgb(0, 128, 0)"); // means green
  await page.getByRole('img', { name: 'Home' }).click();
  const data = await utils.getSessionStorage(page);
  expect (data.credentials !== undefined).toBeTruthy();
  expect (data.credentials).toBe("authentication OK.");
  expect (data.userName != undefined && data.userName == uName).toBeTruthy();
  expect (data.password != undefined && data.password == pswrd).toBeTruthy();
});
