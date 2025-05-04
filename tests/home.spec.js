import { test, expect } from '@playwright/test';
import utils from './utils.js';

let intVal = utils.getRandomInt();
// test.beforeEach(async ({ page }) => {
//   await page.goto('/');
//   await page.waitForLoadState();
//   await page.getByRole('img', { name: 'Contact' }).click();
// });

test('flacky test checking for o', async ( ) => {
    console.log("test "+ intVal);
    expect (intVal%2 == 0).toBeTruthy();
  });
