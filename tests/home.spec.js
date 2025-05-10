import { test, expect } from '@playwright/test';
import utils from './utils.js';

test.describe.configure({ retries: 5 });

let intVal = utils.getRandomInt();
// test.beforeEach(async ({ page }) => {
//   await page.goto('/');
//   await page.waitForLoadState();
//   await page.getByRole('img', { name: 'Contact' }).click();
// });

test('flacky test checking for even number (test.describe.configure({ retries: 5 });)', async ( ) => {
    console.log("checking if number "+ intVal + " is even....");
    expect (intVal%2 == 0).toBeTruthy();
  });
