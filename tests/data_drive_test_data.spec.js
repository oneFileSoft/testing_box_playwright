import { test, expect } from '@playwright/test';
const testData =  JSON.parse(JSON.stringify(require("../test_data.json")));

test.describe("DataDriven tests by JSON", function() {
    for(const currentIndexOfData of testData) {
        test.describe(`User# ${currentIndexOfData.id} name=${currentIndexOfData.useremail}`, function() {
              test('Data-driven', async ({ page }) => {
                await page.goto('https://freelance-learn-automation.vercel.app/login');
              
                await page.locator('#email1').fill(currentIndexOfData.useremail);
                await page.waitForTimeout(2000);
                await page.locator('#password1').fill(currentIndexOfData.password);
                // await page.locator("button[type='submit']").click();
                // await page.waitForTimeout(5000);
              
              });
        });
    }
});


test.describe.parallel("Data-driven_Parallel", () => {
    testData.forEach(({ id, useremail, password }) => {
        test(`Login User: ${id}`, async ({ page }) => {
            await page.goto("https://freelance-learn-automation.vercel.app/login");

            await page.locator("#email1").fill(useremail);
            await page.locator("#password1").fill(password);
            await page.locator("button[type='submit']").click();
            // await page.waitForTimeout(5000);
        });
    });
});